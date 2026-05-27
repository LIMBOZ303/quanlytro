import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../api/axiosClient';
import { TableSkeleton, PageError } from '../components/PageLoader';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/ToastProvider';
import { PHONE_ERROR, validatePhone } from '../utils/validation';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const IDCARD_REGEX = /^\d{12}$/;
const IDCARD_ERROR = 'Căn cước công dân không hợp lệ. Vui lòng nhập đúng 12 chữ số.';

const emptyForm = { fullName: '', birthYear: '', hometown: '', idCard: '', phone: '', roomId: '' };

const Tenants = () => {
  const { showToast } = useToast();
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tRes, rRes] = await Promise.all([
        axiosClient.get('/tenants'),
        axiosClient.get('/rooms'),
      ]);
      setTenants(Array.isArray(tRes?.data) ? tRes.data : []);
      setRooms(Array.isArray(rRes?.data) ? rRes.data : []);
    } catch (err) {
      console.error('Error fetching tenants data:', err);
      setTenants([]);
      setRooms([]);
      setError(err?.response?.data?.message || 'Không thể tải danh sách khách thuê.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormErrors({});
    setSubmitError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
    setFormErrors({});
    setSubmitError('');
    setSubmitting(false);
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.fullName) errors.fullName = 'Vui lòng nhập họ và tên.';
    if (!data.birthYear) errors.birthYear = 'Vui lòng nhập năm sinh.';
    if (!data.hometown) errors.hometown = 'Vui lòng nhập quê quán.';
    if (!validatePhone(data.phone)) errors.phone = PHONE_ERROR;
    if (!IDCARD_REGEX.test(data.idCard)) errors.idCard = IDCARD_ERROR;
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const trimmed = {
      fullName: formData.fullName.trim(),
      birthYear: formData.birthYear,
      hometown: formData.hometown.trim(),
      idCard: formData.idCard.replace(/\D/g, ''),
      phone: formData.phone.replace(/\D/g, ''),
      roomId: formData.roomId || '',
    };

    const errors = validateForm(trimmed);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        fullName: trimmed.fullName,
        birthYear: trimmed.birthYear,
        hometown: trimmed.hometown,
        idCard: trimmed.idCard,
        phone: trimmed.phone,
        roomId: trimmed.roomId || null,
      };
      if (editingId) {
        await axiosClient.put(`/tenants/${editingId}`, payload);
        showToast({ type: 'success', message: 'Cập nhật khách thuê thành công.' });
      } else {
        await axiosClient.post('/tenants', payload);
        showToast({ type: 'success', message: 'Thêm khách thuê thành công.' });
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Error submitting tenant:', err);
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setSubmitError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (tenant) => {
    setFormData({
      fullName: tenant.fullName,
      birthYear: tenant.birthYear,
      hometown: tenant.hometown,
      idCard: tenant.idCard,
      phone: tenant.phone,
      roomId: tenant.roomId || '',
    });
    setEditingId(tenant.id);
    setFormErrors({});
    setSubmitError('');
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setConfirmError('');
    setConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setDeleteId(null);
    setConfirmError('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setConfirmLoading(true);
    setConfirmError('');
    try {
      await axiosClient.delete(`/tenants/${deleteId}`);
      setConfirmOpen(false);
      setDeleteId(null);
      showToast({ type: 'success', message: 'Xóa khách thuê thành công.' });
      fetchData();
    } catch (err) {
      console.error('Error deleting tenant:', err);
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra khi xóa khách thuê.';
      setConfirmError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleNumericChange = (field, value, maxLen) => {
    const digits = value.replace(/\D/g, '').slice(0, maxLen);
    setFormData((prev) => ({ ...prev, [field]: digits }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const inputClass = (field) =>
    `input-field ${formErrors[field] ? 'input-error' : ''}`;

  if (loading) {
    return <TableSkeleton />;
  }

  if (error) {
    return <PageError message={error} onRetry={fetchData} />;
  }

  const hasTenants = Array.isArray(tenants) && tenants.length > 0;

  return (
    <div className="ds-card overflow-hidden">
      <div className="p-4 md:p-6 border-b border-[var(--color-outline)] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-[var(--color-surface-container-low)]/40">
        <div>
          <h1 className="ds-section-title text-xl">Danh sách khách thuê</h1>
          <p className="text-[13px] text-[var(--color-muted)] mt-0.5">{tenants.length} khách trong hệ thống</p>
        </div>
        <button type="button" onClick={openAddModal} className="btn-primary w-full sm:w-auto">
          <Plus size={16} /> Thêm khách
        </button>
      </div>

      <div className="md:hidden divide-y divide-[var(--color-outline)]">
        {!hasTenants ? (
          <EmptyState title="Chưa có khách thuê" description="Thêm khách để quản lý hợp đồng và hóa đơn." />
        ) : (
          tenants.map((tenant) => (
            <div key={tenant.id} className="p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h4 className="font-semibold text-[var(--color-on-surface)]">{tenant.fullName}</h4>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(tenant)}
                    className="p-2 rounded-lg bg-blue-50 text-blue-600"
                    aria-label="Sửa"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteConfirm(tenant.id)}
                    className="p-2 rounded-lg bg-red-50 text-red-600"
                    aria-label="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              {tenant.room ? (
                <span className="inline-block mb-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-primary-tint)] text-[var(--color-primary)]">
                  {tenant.room.name}
                </span>
              ) : (
                <span className="inline-block mb-2 text-[var(--color-muted)] italic text-xs">
                  Chưa gán phòng
                </span>
              )}
              <div className="space-y-1 text-[13px] text-[var(--color-on-surface-variant)]">
                <p>
                  Năm sinh: {tenant.birthYear} · Quê: {tenant.hometown}
                </p>
                <p>SĐT: {tenant.phone}</p>
                <p>CCCD: {tenant.idCard}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left table-ds">
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Thông tin</th>
              <th>Liên hệ</th>
              <th>Phòng</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {!hasTenants ? (
              <tr>
                <td colSpan="5">
                  <EmptyState title="Chưa có khách thuê" />
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="font-semibold">{tenant.fullName}</td>
                  <td className="text-[var(--color-on-surface-variant)]">
                    <p>Năm sinh: {tenant.birthYear}</p>
                    <p>Quê: {tenant.hometown}</p>
                  </td>
                  <td className="text-[var(--color-on-surface-variant)]">
                    <p>SĐT: {tenant.phone}</p>
                    <p>CCCD: {tenant.idCard}</p>
                  </td>
                  <td>
                    {tenant.room ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary-tint)] text-[var(--color-primary)]">
                        {tenant.room.name}
                      </span>
                    ) : (
                      <span className="text-[var(--color-muted)] italic text-xs">Chưa gán</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(tenant)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        aria-label="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteConfirm(tenant.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
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
              onClick={closeModal}
              aria-label="Đóng"
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="relative bg-white w-full sm:max-w-lg p-5 sm:p-6 max-h-[92dvh] overflow-y-auto"
              style={{ borderRadius: 'var(--radius-modal)', boxShadow: 'var(--shadow-modal)' }}
            >
              <h3 className="text-xl font-bold mb-4">
                {editingId ? 'Sửa khách thuê' : 'Thêm khách thuê'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {submitError && (
                  <div className="sm:col-span-2 rounded-lg border border-red-200 bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error)]">
                    {submitError}
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label className="ds-label block mb-1.5">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (formErrors.fullName)
                        setFormErrors((prev) => {
                          const n = { ...prev };
                          delete n.fullName;
                          return n;
                        });
                    }}
                    className={inputClass('fullName')}
                  />
                  {formErrors.fullName && (
                    <p className="mt-1 text-xs text-[var(--status-overdue)]">{formErrors.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="ds-label block mb-1.5">Năm sinh</label>
                  <input
                    type="number"
                    required
                    value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                    className="input-field"
                  />
                  {formErrors.birthYear && (
                    <p className="mt-1 text-xs text-[var(--status-overdue)]">{formErrors.birthYear}</p>
                  )}
                </div>
                <div>
                  <label className="ds-label block mb-1.5">Quê quán</label>
                  <input
                    type="text"
                    required
                    value={formData.hometown}
                    onChange={(e) => {
                      setFormData({ ...formData, hometown: e.target.value });
                      if (formErrors.hometown)
                        setFormErrors((prev) => {
                          const n = { ...prev };
                          delete n.hometown;
                          return n;
                        });
                    }}
                    className={inputClass('hometown')}
                  />
                  {formErrors.hometown && (
                    <p className="mt-1 text-xs text-[var(--status-overdue)]">{formErrors.hometown}</p>
                  )}
                </div>
                <div>
                  <label className="ds-label block mb-1.5">CCCD</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={12}
                    value={formData.idCard}
                    onChange={(e) => handleNumericChange('idCard', e.target.value, 12)}
                    className={inputClass('idCard')}
                  />
                  {formErrors.idCard && (
                    <p className="mt-1 text-xs text-[var(--status-overdue)]">{formErrors.idCard}</p>
                  )}
                </div>
                <div>
                  <label className="ds-label block mb-1.5">SĐT</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => handleNumericChange('phone', e.target.value, 10)}
                    className={inputClass('phone')}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-xs text-[var(--status-overdue)]">{formErrors.phone}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="ds-label block mb-1.5">Phòng đang ở</label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">-- Không gán phòng --</option>
                    {Array.isArray(rooms) &&
                      rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (Giá: {(r.rentPrice ?? 0).toLocaleString('vi-VN')})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
                  <button type="button" onClick={closeModal} disabled={submitting} className="btn-ghost">
                    Hủy
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa khách thuê?"
        message="Bạn có chắc muốn xóa khách thuê này không? Hành động này không thể hoàn tác."
        confirmText="Xóa khách"
        cancelText="Hủy"
        danger
        loading={confirmLoading}
        error={confirmError}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
};

export default Tenants;
