import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { getBillApiErrorMessage } from '../api/billApi';
import PageLoader, { PageError } from '../components/PageLoader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/ToastProvider';
import html2canvas from 'html2canvas';
import { Download, Plus, CheckCircle, CircleAlert, Eye } from 'lucide-react';
import BillReceipt from '../components/BillReceipt';
import {
  INITIAL_BILL_FORM,
  buildBillPayload,
  calculateRoomBill,
  formatCurrency,
  getHighPriceWarnings,
  HIGH_ELECTRICITY_PRICE_THRESHOLD,
  HIGH_WATER_PRICE_THRESHOLD,
  validateBillForm,
  WATER_BILLING_METER,
  WATER_BILLING_PER_PERSON,
  DEFAULT_WATER_PER_PERSON_PRICE,
} from '../utils/billCalculator';

const getTenantsForRoom = (roomId, allTenants, selectedRoom) => {
  if (Array.isArray(selectedRoom?.tenants) && selectedRoom.tenants.length > 0) {
    return selectedRoom.tenants;
  }
  if (!roomId || !Array.isArray(allTenants)) return [];
  return allTenants.filter((t) => String(t.roomId) === String(roomId));
};

const formatWaterSummary = (bill) => {
  if (bill.waterBillingType === WATER_BILLING_PER_PERSON) {
    const count = bill.waterPeopleCount ?? '—';
    const price = Number(bill.waterPrice || 0).toLocaleString('vi-VN');
    return `${count} người × ${price}đ`;
  }
  const oldVal = bill.waterOld ?? '—';
  const newVal = bill.waterNew ?? '—';
  return `${oldVal} → ${newVal}`;
};

const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [allTenants, setAllTenants] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...INITIAL_BILL_FORM });
  const [formErrors, setFormErrors] = useState([]);
  const [billToExport, setBillToExport] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [priceConfirmOpen, setPriceConfirmOpen] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const billRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [rRes, bRes, tRes] = await Promise.all([
        axiosClient.get('/rooms'),
        axiosClient.get(`/bills?month=${selectedMonth}&year=${selectedYear}`),
        axiosClient.get('/tenants'),
      ]);
      const roomsData = Array.isArray(rRes?.data) ? rRes.data : [];
      setRooms(roomsData.filter((r) => r.status === 'Đã thuê'));
      setBills(Array.isArray(bRes?.data) ? bRes.data : []);
      setAllTenants(Array.isArray(tRes?.data) ? tRes.data : []);
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setRooms([]);
      setBills([]);
      setAllTenants([]);
      setError(err?.response?.data?.message || 'Không thể tải dữ liệu tính tiền.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const selectedRoom = useMemo(
    () =>
      Array.isArray(rooms) ? rooms.find((r) => String(r.id) === String(formData.roomId)) : null,
    [rooms, formData.roomId]
  );

  const roomTenantCount = useMemo(() => {
    const list = getTenantsForRoom(formData.roomId, allTenants, selectedRoom);
    return Math.max(1, list.length);
  }, [formData.roomId, allTenants, selectedRoom]);

  const formPreview = useMemo(() => {
    if (!selectedRoom) return null;
    try {
      return calculateRoomBill({
        rentPrice: selectedRoom.rentPrice,
        serviceFee: selectedRoom.serviceFee,
        electricityOld: formData.electricityOld,
        electricityNew: formData.electricityNew,
        electricityPrice: formData.electricityPrice,
        waterBillingType: formData.waterBillingType,
        waterOld: formData.waterOld,
        waterNew: formData.waterNew,
        waterPrice: formData.waterPrice,
        waterPeopleCount: formData.waterPeopleCount,
      });
    } catch {
      return null;
    }
  }, [selectedRoom, formData]);

  const priceWarnings = useMemo(
    () =>
      getHighPriceWarnings(
        formData.electricityPrice,
        formData.waterPrice,
        formData.waterBillingType
      ),
    [formData.electricityPrice, formData.waterPrice, formData.waterBillingType]
  );

  const openCreateModal = (roomId = '') => {
    setFormData({ ...INITIAL_BILL_FORM, roomId: roomId ? String(roomId) : '' });
    setFormErrors([]);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const roomId = query.get('roomId');
    if (roomId && Array.isArray(rooms) && rooms.some((room) => String(room.id) === String(roomId))) {
      openCreateModal(roomId);
      navigate('/billing', { replace: true });
    }
  }, [location.search, rooms, navigate]);

  const handleWaterBillingTypeChange = (type) => {
    setFormData((prev) => {
      const next = { ...prev, waterBillingType: type };
      if (type === WATER_BILLING_PER_PERSON) {
        const count = getTenantsForRoom(prev.roomId, allTenants, selectedRoom).length;
        next.waterPrice = String(DEFAULT_WATER_PER_PERSON_PRICE);
        next.waterPeopleCount = String(Math.max(1, count || 1));
      }
      return next;
    });
  };

  const handleRoomChange = (roomId) => {
    const room = rooms.find((r) => String(r.id) === String(roomId));
    setFormData((prev) => {
      const next = { ...prev, roomId };
      if (prev.waterBillingType === WATER_BILLING_PER_PERSON) {
        const count = getTenantsForRoom(roomId, allTenants, room).length;
        next.waterPeopleCount = String(Math.max(1, count || 1));
      }
      return next;
    });
  };

  const submitBill = async () => {
    setPendingSubmit(true);
    try {
      const payload = buildBillPayload(formData, selectedMonth, selectedYear);
      await axiosClient.post('/bills', payload);
      setIsModalOpen(false);
      setFormData({ ...INITIAL_BILL_FORM });
      setFormErrors([]);
      showToast({ type: 'success', message: 'Tạo hóa đơn thành công.' });
      fetchData();
    } catch (err) {
      console.error('Error creating bill:', err);
      const msg = getBillApiErrorMessage(
        err,
        'Có lỗi hoặc phòng này đã được tính tiền cho tháng này!'
      );
      showToast({ type: 'error', message: msg });
    } finally {
      setPendingSubmit(false);
      setPriceConfirmOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateBillForm({
      roomId: formData.roomId,
      month: selectedMonth,
      year: selectedYear,
      electricityOld: formData.electricityOld,
      electricityNew: formData.electricityNew,
      waterBillingType: formData.waterBillingType,
      waterOld: formData.waterOld,
      waterNew: formData.waterNew,
      waterPeopleCount: formData.waterPeopleCount,
      electricityPrice: formData.electricityPrice,
      waterPrice: formData.waterPrice,
    });

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    const warnings = getHighPriceWarnings(
      formData.electricityPrice,
      formData.waterPrice,
      formData.waterBillingType
    );
    if (warnings.length > 0) {
      setPriceConfirmOpen(true);
      return;
    }

    await submitBill();
  };

  const handleToggleStatus = async (bill) => {
    const nextStatus =
      bill.status === 'Đã thanh toán' ? 'Chưa thanh toán' : 'Đã thanh toán';
    setStatusUpdatingId(bill.id);
    try {
      await axiosClient.put(`/bills/${bill.id}/status`, { status: nextStatus });
      showToast({
        type: 'success',
        message: `Đã cập nhật trạng thái: ${nextStatus}.`,
      });
      fetchData();
    } catch (err) {
      console.error('Error updating bill status:', err);
      showToast({
        type: 'error',
        message: getBillApiErrorMessage(err, 'Không thể cập nhật trạng thái thanh toán.'),
      });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleExport = async () => {
    if (billRef.current) {
      const canvas = await html2canvas(billRef.current, { scale: 2 });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `HoaDon_${billToExport.room?.name || 'Phong'}_T${billToExport.month}_${billToExport.year}.png`;
      link.click();
      setBillToExport(null);
    }
  };

  const formatBillTotal = (bill) => formatCurrency(bill?.totalAmount ?? 0);

  if (loading) {
    return <PageLoader label="Đang tải hóa đơn..." />;
  }

  if (error) {
    return <PageError message={error} onRetry={fetchData} />;
  }

  const hasBills = Array.isArray(bills) && bills.length > 0;
  const isMeterWater = formData.waterBillingType === WATER_BILLING_METER;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <div>
        <h1 className="ds-page-title text-2xl md:text-[32px]">Tính tiền phòng</h1>
        <p className="text-[13px] text-[var(--color-muted)] mt-1">
          Quản lý hóa đơn điện nước và tiền phòng theo tháng
        </p>
      </div>

      <div className="ds-card p-4 md:p-6 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex flex-wrap flex-1 gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="ds-label block mb-1.5">Tháng</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input-field"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="ds-label block mb-1.5">Năm</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input-field"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="button" onClick={() => openCreateModal()} className="btn-primary w-full sm:w-auto shrink-0">
          <Plus size={16} /> Tính tiền phòng mới
        </button>
      </div>

      <div className="md:hidden space-y-3">
        {!hasBills ? (
          <div className="ds-card">
            <EmptyState
              title="Chưa có hóa đơn cho tháng này"
              description="Chọn phòng đã thuê và nhập chỉ số điện nước để tạo hóa đơn."
            />
          </div>
        ) : (
          bills.map((bill) => (
            <div key={bill.id} className="ds-card p-4">
              <div className="flex justify-between items-start mb-3 gap-3">
                <div>
                  <h4 className="font-bold text-[var(--color-on-surface)]">
                    {bill.room?.name || 'Không xác định'}
                  </h4>
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Khách thuê: {bill.tenant?.fullName || bill.tenantName || 'Chưa cập nhật'}
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={bill.status || 'Chưa thanh toán'} />
                  </div>
                </div>
                <p className="text-sm font-bold text-[var(--color-primary)] tabular-nums shrink-0">
                  {formatBillTotal(bill)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="rounded-lg p-2 bg-[var(--color-surface-container-low)]">
                  <p className="text-xs text-[var(--color-muted)]">Điện (cũ → mới)</p>
                  <p className="font-medium tabular-nums">
                    {bill.electricityOld} → {bill.electricityNew}
                  </p>
                </div>
                <div className="rounded-lg p-2 bg-[var(--color-surface-container-low)]">
                  <p className="text-xs text-[var(--color-muted)]">Nước</p>
                  <p className="font-medium tabular-nums">{formatWaterSummary(bill)}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setBillToExport(bill)}
                  className="btn-secondary w-full text-sm"
                >
                  <Eye size={16} /> Xem chi tiết
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(bill)}
                  disabled={statusUpdatingId === bill.id}
                  className="btn-secondary w-full text-sm"
                >
                  {bill.status === 'Đã thanh toán' ? (
                    <>
                      <CircleAlert size={16} /> Đánh dấu chưa thanh toán
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} /> Đánh dấu đã thanh toán
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setBillToExport(bill)}
                  className="btn-secondary w-full text-sm"
                >
                  <Download size={16} /> Xuất hóa đơn
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block ds-card overflow-hidden">
        <table className="w-full text-left table-ds">
          <thead>
            <tr>
              <th>Phòng</th>
              <th>Khách thuê</th>
              <th>Số điện (cũ → mới)</th>
              <th>Nước</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {!hasBills ? (
              <tr>
                <td colSpan="7">
                  <EmptyState title="Chưa có hóa đơn cho tháng này" />
                </td>
              </tr>
            ) : (
              bills.map((bill) => (
                <tr key={bill.id}>
                  <td className="font-bold">{bill.room?.name || 'Không xác định'}</td>
                  <td>{bill.tenant?.fullName || bill.tenantName || '—'}</td>
                  <td className="tabular-nums">
                    {bill.electricityOld} → {bill.electricityNew}
                  </td>
                  <td className="tabular-nums">{formatWaterSummary(bill)}</td>
                  <td className="font-bold text-[var(--color-primary)] tabular-nums">
                    {formatBillTotal(bill)}
                  </td>
                  <td>
                    <StatusBadge status={bill.status || 'Chưa thanh toán'} />
                  </td>
                  <td className="text-right">
                    <div className="inline-flex flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => setBillToExport(bill)}
                        className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                      >
                        Xem chi tiết
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(bill)}
                        disabled={statusUpdatingId === bill.id}
                        className="text-xs font-semibold text-[var(--color-primary)] hover:underline disabled:opacity-50"
                      >
                        {statusUpdatingId === bill.id
                          ? 'Đang cập nhật...'
                          : bill.status === 'Đã thanh toán'
                            ? 'Chưa thanh toán'
                            : 'Đã thanh toán'}
                      </button>
                      <button type="button" onClick={() => setBillToExport(bill)} className="text-xs font-semibold text-[var(--color-secondary)] hover:underline">Xuất hóa đơn</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.button
              type="button"
              className="absolute inset-0 bg-black/50 backdrop-blur-[8px]"
              onClick={() => !pendingSubmit && setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="relative bg-white w-full sm:max-w-xl p-5 sm:p-6 max-h-[92dvh] overflow-y-auto"
              style={{ borderRadius: 'var(--radius-modal)', boxShadow: 'var(--shadow-modal)' }}
            >
              <h3 className="text-xl font-bold mb-1">Lập hóa đơn tháng {selectedMonth}/{selectedYear}</h3>
              <p className="text-sm text-[var(--color-muted)] mb-4">Nhập chỉ số cũ/mới để xem trước. Backend sẽ là nơi tính tổng cuối cùng.</p>

              {formErrors.length > 0 && (
                <div className="mb-4 rounded-lg border border-red-200 bg-[var(--color-error-light)] p-3 text-sm text-[var(--color-error)] space-y-1">
                  {formErrors.map((errMsg) => (
                    <p key={errMsg}>• {errMsg}</p>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="ds-label block mb-1.5">Phòng đang thuê</label>
                  <select
                    required
                    value={formData.roomId}
                    onChange={(e) => handleRoomChange(e.target.value)}
                    className="input-field"
                  >
                    <option value="">-- Chọn phòng --</option>
                    {Array.isArray(rooms) &&
                      rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} · {Number(r.rentPrice || 0).toLocaleString('vi-VN')} đ
                        </option>
                      ))}
                  </select>
                </div>
                {selectedRoom && (
                  <div className="sm:col-span-2 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface-container-low)] p-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-[var(--color-on-surface)]">{selectedRoom.name}</p>
                      <StatusBadge status={selectedRoom.status} />
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[var(--color-on-surface-variant)]">
                      <p>Tiền phòng: <span className="font-semibold">{formatCurrency(selectedRoom.rentPrice)}</span></p>
                      <p>Phí dịch vụ: <span className="font-semibold">{formatCurrency(selectedRoom.serviceFee)}</span></p>
                      <p className="sm:col-span-2">Khách trong phòng: <span className="font-semibold">{roomTenantCount}</span></p>
                    </div>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="ds-label block mb-1.5">Cách tính tiền nước</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${isMeterWater ? 'border-[var(--color-primary)] bg-[var(--color-primary-tint)]' : 'border-[var(--color-outline)]'}`}>
                      <input
                        type="radio"
                        name="waterBillingType"
                        value={WATER_BILLING_METER}
                        checked={isMeterWater}
                        onChange={() => handleWaterBillingTypeChange(WATER_BILLING_METER)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-semibold">Theo đồng hồ nước</span>
                        <span className="block text-xs text-[var(--color-muted)] mt-0.5">Chỉ số cũ/mới × đơn giá/khối</span>
                      </span>
                    </label>
                    <label className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${!isMeterWater ? 'border-[var(--color-primary)] bg-[var(--color-primary-tint)]' : 'border-[var(--color-outline)]'}`}>
                      <input
                        type="radio"
                        name="waterBillingType"
                        value={WATER_BILLING_PER_PERSON}
                        checked={!isMeterWater}
                        onChange={() => handleWaterBillingTypeChange(WATER_BILLING_PER_PERSON)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-semibold">Theo đầu người</span>
                        <span className="block text-xs text-[var(--color-muted)] mt-0.5">Số người × giá/người</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="ds-label block mb-1.5">Số điện cũ</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.electricityOld}
                    onChange={(e) => setFormData({ ...formData, electricityOld: e.target.value })}
                    className="input-field tabular-nums"
                  />
                </div>
                <div>
                  <label className="ds-label block mb-1.5">Số điện mới</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.electricityNew}
                    onChange={(e) => setFormData({ ...formData, electricityNew: e.target.value })}
                    className="input-field tabular-nums"
                  />
                </div>

                {isMeterWater ? (
                  <>
                    <div>
                      <label className="ds-label block mb-1.5">Số nước cũ</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.waterOld}
                        onChange={(e) => setFormData({ ...formData, waterOld: e.target.value })}
                        className="input-field tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="ds-label block mb-1.5">Số nước mới</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.waterNew}
                        onChange={(e) => setFormData({ ...formData, waterNew: e.target.value })}
                        className="input-field tabular-nums"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="ds-label block mb-1.5">Đơn giá nước (VNĐ/khối)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.waterPrice}
                        onChange={(e) => setFormData({ ...formData, waterPrice: e.target.value })}
                        className="input-field tabular-nums"
                      />
                      {Number(formData.waterPrice) > HIGH_WATER_PRICE_THRESHOLD && (
                        <p className="mt-1 text-xs text-amber-600">
                          Đơn giá nước có vẻ quá cao, bạn có chắc muốn dùng mức này không?
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="ds-label block mb-1.5">Số người</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.waterPeopleCount}
                        onChange={(e) =>
                          setFormData({ ...formData, waterPeopleCount: e.target.value })
                        }
                        className="input-field tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="ds-label block mb-1.5">Giá nước / người (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.waterPrice}
                        onChange={(e) => setFormData({ ...formData, waterPrice: e.target.value })}
                        className="input-field tabular-nums"
                      />
                      {Number(formData.waterPrice) > HIGH_WATER_PRICE_THRESHOLD && (
                        <p className="mt-1 text-xs text-amber-600">
                          Giá nước/người có vẻ quá cao, bạn có chắc muốn dùng mức này không?
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className={isMeterWater ? '' : 'sm:col-span-2'}>
                  <label className="ds-label block mb-1.5">Đơn giá điện (VNĐ/kWh)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.electricityPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, electricityPrice: e.target.value })
                    }
                    className="input-field tabular-nums"
                  />
                  {Number(formData.electricityPrice) > HIGH_ELECTRICITY_PRICE_THRESHOLD && (
                    <p className="mt-1 text-xs text-amber-600">
                      Đơn giá điện có vẻ quá cao, bạn có chắc muốn dùng mức này không?
                    </p>
                  )}
                </div>

                {formPreview && (
                  <div className="sm:col-span-2 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface-container-low)] p-4 text-sm space-y-2">
                    <p className="font-semibold text-[var(--color-primary)]">Xem trước chi tiết hóa đơn</p>
                    <div className="flex justify-between gap-3">
                      <span>Tiền phòng</span>
                      <span className="tabular-nums font-medium">
                        {formatCurrency(formPreview.rentPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>Phí dịch vụ</span>
                      <span className="tabular-nums font-medium">
                        {formatCurrency(formPreview.serviceFee)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>
                        Điện: {formPreview.electricity.usage.toLocaleString('vi-VN')} kWh ×{' '}
                        {Number(formPreview.electricity.unitPrice).toLocaleString('vi-VN')}đ
                      </span>
                      <span className="shrink-0 tabular-nums font-medium">
                        {formatCurrency(formPreview.electricity.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>
                        {formPreview.waterBillingType === WATER_BILLING_PER_PERSON
                          ? `Nước: ${formPreview.water.peopleCount.toLocaleString('vi-VN')} người × ${Number(formPreview.water.unitPrice).toLocaleString('vi-VN')}đ`
                          : `Nước: ${formPreview.water.usage.toLocaleString('vi-VN')} khối × ${Number(formPreview.water.unitPrice).toLocaleString('vi-VN')}đ`}
                      </span>
                      <span className="shrink-0 tabular-nums font-medium">
                        {formatCurrency(formPreview.water.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-[var(--color-primary)] pt-2 border-t border-[var(--color-outline)]">
                      <span>Tổng tạm tính frontend</span>
                      <span className="tabular-nums">{formatCurrency(formPreview.totalAmount)}</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-muted)]">
                      Lưu ý: tổng tiền chính thức lấy từ backend sau khi lưu.
                    </p>
                  </div>
                )}

                {priceWarnings.length > 0 && (
                  <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    {priceWarnings.map((w) => (
                      <p key={w}>⚠ {w}</p>
                    ))}
                  </div>
                )}

                <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-[var(--color-outline)]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={pendingSubmit}
                    className="btn-ghost"
                  >
                    Hủy
                  </button>
                  <button type="submit" disabled={pendingSubmit} className="btn-primary">
                    {pendingSubmit ? 'Đang lưu...' : 'Lưu & Tính tiền'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={priceConfirmOpen}
        title="Xác nhận đơn giá cao"
        message={priceWarnings.join('\n\n')}
        confirmText="Tiếp tục lưu"
        cancelText="Kiểm tra lại"
        loading={pendingSubmit}
        onConfirm={submitBill}
        onCancel={() => setPriceConfirmOpen(false)}
      />

      <AnimatePresence>
        {billToExport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-[8px] z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white overflow-hidden max-w-md w-full max-h-[95dvh] flex flex-col"
              style={{ borderRadius: 'var(--radius-modal)', boxShadow: 'var(--shadow-modal)' }}
            >
              <div className="overflow-y-auto flex-1">
                <BillReceipt bill={billToExport} innerRef={billRef} />
              </div>
              <div className="p-4 border-t border-[var(--color-outline)] bg-[var(--color-surface-container-low)] flex flex-col-reverse sm:flex-row justify-end gap-2 safe-bottom shrink-0">
                <button type="button" onClick={() => setBillToExport(null)} className="btn-ghost">
                  Đóng
                </button>
                <button type="button" onClick={handleExport} className="btn-primary">
                  Tải ảnh (Lưu về máy)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Billing;
