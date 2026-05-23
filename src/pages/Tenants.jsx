import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import PageLoader, { PageError } from '../components/PageLoader';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const PHONE_REGEX = /^0\d{9}$/;
const IDCARD_REGEX = /^\d{12}$/;

const PHONE_ERROR = 'Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số và bắt đầu bằng 0.';
const IDCARD_ERROR = 'Căn cước công dân không hợp lệ. Vui lòng nhập đúng 12 chữ số.';

const emptyForm = { fullName: '', birthYear: '', hometown: '', idCard: '', phone: '', roomId: '' };

const Tenants = () => {
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
    if (!PHONE_REGEX.test(data.phone)) errors.phone = PHONE_ERROR;
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
      } else {
        await axiosClient.post('/tenants', payload);
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Error submitting tenant:', err);
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setSubmitError(msg);
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
      fetchData();
    } catch (err) {
      console.error('Error deleting tenant:', err);
      setConfirmError(err?.response?.data?.message || 'Có lỗi xảy ra khi xóa khách thuê.');
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

  const inputErrorClass = (field) =>
    formErrors[field]
      ? 'border-red-400 focus:ring-red-500'
      : 'border-slate-300 focus:ring-indigo-500';

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100">
        <PageLoader label="Đang tải danh sách khách thuê..." />
      </div>
    );
  }

  if (error) {
    return <PageError message={error} onRetry={fetchData} />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-800">Danh sách Khách Thuê</h3>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium w-full sm:w-auto"
        >
          <Plus size={16} /> Thêm Khách
        </button>
      </div>

      {/* Mobile: Card list */}
      <div className="md:hidden divide-y divide-slate-100">
        {!Array.isArray(tenants) || tenants.length === 0 ? (
          <p className="text-center py-8 text-slate-500 px-4">Chưa có dữ liệu</p>
        ) : tenants.map(tenant => (
          <div key={tenant.id} className="p-4">
            <div className="flex justify-between items-start gap-2 mb-2">
              <h4 className="font-semibold text-slate-800 text-base">{tenant.fullName}</h4>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(tenant)} className="p-2 rounded-lg bg-blue-50 text-blue-600 active:bg-blue-100" aria-label="Sửa">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => openDeleteConfirm(tenant.id)} className="p-2 rounded-lg bg-red-50 text-red-600 active:bg-red-100" aria-label="Xóa">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            {tenant.room ? (
              <span className="inline-block mb-2 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                {tenant.room.name}
              </span>
            ) : (
              <span className="inline-block mb-2 text-slate-400 italic text-xs">Chưa gán phòng</span>
            )}
            <div className="space-y-1.5 text-sm text-slate-600">
              <p><span className="text-slate-400">Năm sinh:</span> {tenant.birthYear} · <span className="text-slate-400">Quê:</span> {tenant.hometown}</p>
              <p><span className="text-slate-400">SĐT:</span> {tenant.phone}</p>
              <p><span className="text-slate-400">CCCD:</span> {tenant.idCard}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Họ và Tên</th>
              <th className="px-6 py-4">Thông tin</th>
              <th className="px-6 py-4">Liên hệ</th>
              <th className="px-6 py-4">Phòng</th>
              <th className="px-6 py-4 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!Array.isArray(tenants) || tenants.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-slate-500">Chưa có dữ liệu</td></tr>
            ) : tenants.map(tenant => (
              <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{tenant.fullName}</td>
                <td className="px-6 py-4 text-slate-600">
                  <p>Năm sinh: {tenant.birthYear}</p>
                  <p>Quê: {tenant.hometown}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <p>SĐT: {tenant.phone}</p>
                  <p>CCCD: {tenant.idCard}</p>
                </td>
                <td className="px-6 py-4">
                  {tenant.room ? (
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                      {tenant.room.name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Chưa gán</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => handleEdit(tenant)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                  <button onClick={() => openDeleteConfirm(tenant.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg p-5 sm:p-6 max-h-[92dvh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Sửa Khách Thuê' : 'Thêm Khách Thuê'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {submitError && (
                <div className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (formErrors.fullName) setFormErrors(prev => { const n = { ...prev }; delete n.fullName; return n; });
                  }}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${inputErrorClass('fullName')}`}
                />
                {formErrors.fullName && <p className="mt-1 text-xs text-red-600">{formErrors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Năm sinh</label>
                <input
                  type="number"
                  required
                  value={formData.birthYear}
                  onChange={e => setFormData({ ...formData, birthYear: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quê quán</label>
                <input
                  type="text"
                  required
                  value={formData.hometown}
                  onChange={e => {
                    setFormData({ ...formData, hometown: e.target.value });
                    if (formErrors.hometown) setFormErrors(prev => { const n = { ...prev }; delete n.hometown; return n; });
                  }}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${inputErrorClass('hometown')}`}
                />
                {formErrors.hometown && <p className="mt-1 text-xs text-red-600">{formErrors.hometown}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CCCD</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={12}
                  value={formData.idCard}
                  onChange={e => handleNumericChange('idCard', e.target.value, 12)}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${inputErrorClass('idCard')}`}
                />
                {formErrors.idCard && <p className="mt-1 text-xs text-red-600">{formErrors.idCard}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SĐT</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={10}
                  value={formData.phone}
                  onChange={e => handleNumericChange('phone', e.target.value, 10)}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-base ${inputErrorClass('phone')}`}
                />
                {formErrors.phone && <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Phòng đang ở</label>
                <select value={formData.roomId} onChange={e => setFormData({ ...formData, roomId: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base">
                  <option value="">-- Không gán phòng --</option>
                  {Array.isArray(rooms) && rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name} (Giá: {r.rentPrice ? r.rentPrice.toLocaleString() : '0'})</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                <button type="button" onClick={closeModal} disabled={submitting} className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium disabled:opacity-50">Hủy</button>
                <button type="submit" disabled={submitting} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
