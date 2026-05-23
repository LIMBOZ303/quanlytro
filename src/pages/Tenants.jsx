import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', birthYear: '', hometown: '', idCard: '', phone: '', roomId: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      const [tRes, rRes] = await Promise.all([
        axiosClient.get('/tenants'),
        axiosClient.get('/rooms')
      ]);
      setTenants(Array.isArray(tRes?.data) ? tRes.data : []);
      setRooms(Array.isArray(rRes?.data) ? rRes.data : []);
    } catch (err) {
      console.error('Error fetching tenants data:', err);
      setTenants([]);
      setRooms([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ fullName: '', birthYear: '', hometown: '', idCard: '', phone: '', roomId: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: formData.fullName,
        birthYear: formData.birthYear,
        hometown: formData.hometown,
        idCard: formData.idCard,
        phone: formData.phone,
        roomId: formData.roomId || null
      };
      if (editingId) {
        await axiosClient.put(`/tenants/${editingId}`, payload);
      } else {
        await axiosClient.post('/tenants', payload);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ fullName: '', birthYear: '', hometown: '', idCard: '', phone: '', roomId: '' });
      fetchData();
    } catch (err) {
      console.error('Error submitting tenant:', err);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleEdit = (tenant) => {
    setFormData({
      fullName: tenant.fullName,
      birthYear: tenant.birthYear,
      hometown: tenant.hometown,
      idCard: tenant.idCard,
      phone: tenant.phone,
      roomId: tenant.roomId || ''
    });
    setEditingId(tenant.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa khách thuê này?')) {
      try {
        await axiosClient.delete(`/tenants/${id}`);
        fetchData();
      } catch (err) {
        console.error('Error deleting tenant:', err);
        alert('Có lỗi xảy ra khi xóa khách thuê!');
      }
    }
  };

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
                <button onClick={() => handleDelete(tenant.id)} className="p-2 rounded-lg bg-red-50 text-red-600 active:bg-red-100" aria-label="Xóa">
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
                  <button onClick={() => handleDelete(tenant.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
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
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và Tên</label>
                <input type="text" required value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Năm sinh</label>
                <input type="number" required value={formData.birthYear} onChange={e => setFormData({ ...formData, birthYear: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quê quán</label>
                <input type="text" required value={formData.hometown} onChange={e => setFormData({ ...formData, hometown: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CCCD</label>
                <input type="text" required value={formData.idCard} onChange={e => setFormData({ ...formData, idCard: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SĐT</label>
                <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base" />
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Hủy</button>
                <button type="submit" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;
