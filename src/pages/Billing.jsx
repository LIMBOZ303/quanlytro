import React, { useState, useEffect, useRef, useMemo } from 'react';
import axiosClient from '../api/axiosClient';
import { getBillApiErrorMessage } from '../api/billApi';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
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
} from '../utils/billCalculator';

const Billing = () => {
  const [rooms, setRooms] = useState([]);
  const [bills, setBills] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...INITIAL_BILL_FORM });
  const [formErrors, setFormErrors] = useState([]);
  const [billToExport, setBillToExport] = useState(null);
  const billRef = useRef(null);

  const fetchData = async () => {
    try {
      const [rRes, bRes] = await Promise.all([
        axiosClient.get('/rooms'),
        axiosClient.get(`/bills?month=${selectedMonth}&year=${selectedYear}`),
      ]);
      const roomsData = Array.isArray(rRes?.data) ? rRes.data : [];
      setRooms(roomsData.filter((r) => r.status === 'Đã thuê'));
      setBills(Array.isArray(bRes?.data) ? bRes.data : []);
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setRooms([]);
      setBills([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const selectedRoom = useMemo(
    () => (Array.isArray(rooms) ? rooms.find((r) => String(r.id) === String(formData.roomId)) : null),
    [rooms, formData.roomId]
  );

  const formPreview = useMemo(() => {
    if (!selectedRoom) return null;
    try {
      return calculateRoomBill({
        rentPrice: selectedRoom.rentPrice,
        serviceFee: selectedRoom.serviceFee,
        electricityOld: formData.electricityOld,
        electricityNew: formData.electricityNew,
        electricityPrice: formData.electricityPrice,
        waterOld: formData.waterOld,
        waterNew: formData.waterNew,
        waterPrice: formData.waterPrice,
      });
    } catch {
      return null;
    }
  }, [selectedRoom, formData]);

  const priceWarnings = useMemo(
    () => getHighPriceWarnings(formData.electricityPrice, formData.waterPrice),
    [formData.electricityPrice, formData.waterPrice]
  );

  const openCreateModal = () => {
    setFormData({ ...INITIAL_BILL_FORM });
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateBillForm({
      roomId: formData.roomId,
      month: selectedMonth,
      year: selectedYear,
      electricityOld: formData.electricityOld,
      electricityNew: formData.electricityNew,
      waterOld: formData.waterOld,
      waterNew: formData.waterNew,
      electricityPrice: formData.electricityPrice,
      waterPrice: formData.waterPrice,
    });

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    const warnings = getHighPriceWarnings(formData.electricityPrice, formData.waterPrice);
    if (warnings.length > 0) {
      const confirmed = window.confirm(warnings.join('\n\n'));
      if (!confirmed) return;
    }

    try {
      const payload = buildBillPayload(formData, selectedMonth, selectedYear);
      await axiosClient.post('/bills', payload);
      setIsModalOpen(false);
      setFormData({ ...INITIAL_BILL_FORM });
      setFormErrors([]);
      fetchData();
    } catch (err) {
      console.error('Error creating bill:', err);
      alert(getBillApiErrorMessage(err, 'Có lỗi hoặc phòng này đã được tính tiền cho tháng này!'));
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

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="text-sm text-slate-500 block mb-1">Tháng</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-base"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="text-sm text-slate-500 block mb-1">Năm</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-base"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium"
        >
          Tính tiền phòng mới
        </button>
      </div>

      <div className="md:hidden space-y-3">
        {!Array.isArray(bills) || bills.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center text-slate-500">
            Chưa có hóa đơn cho tháng này
          </div>
        ) : bills.map((bill) => (
          <div key={bill.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="flex justify-between items-start mb-3 gap-3">
              <div>
                <h4 className="font-bold text-slate-800">{bill.room?.name || 'Không xác định'}</h4>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${bill.status === 'Đã thanh toán' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {bill.status}
                </span>
              </div>
              <p className="text-sm font-bold text-rose-600 shrink-0">{formatBillTotal(bill)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-xs text-slate-400">Điện (cũ → mới)</p>
                <p className="font-medium">{bill.electricityOld} → {bill.electricityNew}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-xs text-slate-400">Nước (cũ → mới)</p>
                <p className="font-medium">{bill.waterOld} → {bill.waterNew}</p>
              </div>
            </div>
            <button type="button" onClick={() => setBillToExport(bill)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm">
              <Download size={16} /> Xuất hóa đơn
            </button>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Phòng</th>
              <th className="px-6 py-4">Số điện (Cũ → Mới)</th>
              <th className="px-6 py-4">Số nước (Cũ → Mới)</th>
              <th className="px-6 py-4">Tổng tiền</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!Array.isArray(bills) || bills.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-slate-500">Chưa có hóa đơn cho tháng này</td></tr>
            ) : bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-800">{bill.room?.name || 'Không xác định'}</td>
                <td className="px-6 py-4">{bill.electricityOld} → {bill.electricityNew}</td>
                <td className="px-6 py-4">{bill.waterOld} → {bill.waterNew}</td>
                <td className="px-6 py-4 font-bold text-rose-600">{formatBillTotal(bill)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${bill.status === 'Đã thanh toán' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{bill.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button type="button" onClick={() => setBillToExport(bill)} className="text-indigo-600 hover:underline">Xuất hóa đơn</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-xl p-5 sm:p-6 max-h-[92dvh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-2">Tính tiền tháng {selectedMonth}/{selectedYear}</h3>
            <p className="text-sm text-slate-500 mb-4">Điện/nước tính theo đơn giá cố định, không áp dụng bậc thang.</p>

            {formErrors.length > 0 && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 space-y-1">
                {formErrors.map((error) => <p key={error}>• {error}</p>)}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Chọn phòng (chỉ phòng đã thuê)</label>
                <select required value={formData.roomId} onChange={(e) => setFormData({ ...formData, roomId: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base">
                  <option value="">-- Chọn phòng --</option>
                  {Array.isArray(rooms) && rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện cũ</label>
                <input type="number" min="0" required value={formData.electricityOld} onChange={(e) => setFormData({ ...formData, electricityOld: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện mới</label>
                <input type="number" min="0" required value={formData.electricityNew} onChange={(e) => setFormData({ ...formData, electricityNew: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số nước cũ</label>
                <input type="number" min="0" required value={formData.waterOld} onChange={(e) => setFormData({ ...formData, waterOld: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số nước mới</label>
                <input type="number" min="0" required value={formData.waterNew} onChange={(e) => setFormData({ ...formData, waterNew: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Đơn giá điện (VNĐ/kWh)</label>
                <input type="number" min="0" required value={formData.electricityPrice} onChange={(e) => setFormData({ ...formData, electricityPrice: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base" />
                {Number(formData.electricityPrice) > HIGH_ELECTRICITY_PRICE_THRESHOLD && (
                  <p className="mt-1 text-xs text-amber-600">Đơn giá điện có vẻ quá cao, bạn có chắc muốn dùng mức này không?</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Đơn giá nước (VNĐ/khối)</label>
                <input type="number" min="0" required value={formData.waterPrice} onChange={(e) => setFormData({ ...formData, waterPrice: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base" />
                {Number(formData.waterPrice) > HIGH_WATER_PRICE_THRESHOLD && (
                  <p className="mt-1 text-xs text-amber-600">Đơn giá nước có vẻ quá cao, bạn có chắc muốn dùng mức này không?</p>
                )}
              </div>

              {formPreview && (
                <div className="sm:col-span-2 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 text-sm space-y-2">
                  <p className="font-semibold text-indigo-800">Xem trước tổng tiền</p>
                  <div className="flex justify-between gap-3"><span>Tiền phòng</span><span>{formatCurrency(formPreview.rentPrice)}</span></div>
                  <div className="flex justify-between gap-3"><span>Phí dịch vụ</span><span>{formatCurrency(formPreview.serviceFee)}</span></div>
                  <div className="flex justify-between gap-3">
                    <span>Điện: {formPreview.electricity.usage.toLocaleString('vi-VN')} kWh × {Number(formPreview.electricity.unitPrice).toLocaleString('vi-VN')} VNĐ</span>
                    <span className="shrink-0">{formatCurrency(formPreview.electricity.amount)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Nước: {formPreview.water.usage.toLocaleString('vi-VN')} khối × {Number(formPreview.water.unitPrice).toLocaleString('vi-VN')} VNĐ</span>
                    <span className="shrink-0">{formatCurrency(formPreview.water.amount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-rose-600 pt-2 border-t border-indigo-100">
                    <span>Tổng cộng</span><span>{formatCurrency(formPreview.totalAmount)}</span>
                  </div>
                </div>
              )}

              {priceWarnings.length > 0 && (
                <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  {priceWarnings.map((w) => <p key={w}>⚠ {w}</p>)}
                </div>
              )}

              <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Hủy</button>
                <button type="submit" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Lưu & Tính tiền</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {billToExport && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl overflow-hidden shadow-2xl max-w-md w-full max-h-[95dvh] flex flex-col">
            <div className="overflow-y-auto flex-1">
              <BillReceipt bill={billToExport} innerRef={billRef} />
            </div>
            <div className="p-4 bg-slate-50 border-t flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 safe-bottom shrink-0">
              <button type="button" onClick={() => setBillToExport(null)} className="px-4 py-2.5 text-slate-600 hover:bg-slate-200 rounded-lg font-medium">Đóng</button>
              <button type="button" onClick={handleExport} className="px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium">Tải ảnh (Lưu về máy)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
