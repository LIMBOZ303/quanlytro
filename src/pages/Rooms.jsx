import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', rentPrice: '', serviceFee: '', status: 'Trống' });
  const [editingId, setEditingId] = useState(null);

  const fetchRooms = async () => {
    try {
      const res = await axiosClient.get('/rooms');
      setRooms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setRooms([]);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', rentPrice: '', serviceFee: '', status: 'Trống' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        rentPrice: Number(formData.rentPrice),
        serviceFee: Number(formData.serviceFee),
        status: formData.status
      };
      if (editingId) {
        await axiosClient.put(`/rooms/${editingId}`, payload);
      } else {
        await axiosClient.post('/rooms', payload);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', rentPrice: '', serviceFee: '', status: 'Trống' });
      fetchRooms();
    } catch (err) {
      console.error('Error submitting room:', err);
      alert('Có lỗi xảy ra!');
    }
  };

  const handleEdit = (room) => {
    setFormData({ name: room.name, rentPrice: room.rentPrice, serviceFee: room.serviceFee, status: room.status });
    setEditingId(room.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phòng này?')) {
      try {
        await axiosClient.delete(`/rooms/${id}`);
        fetchRooms();
      } catch (err) {
        console.error('Error deleting room:', err);
        alert('Có lỗi xảy ra khi xóa phòng!');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-800">Danh sách Phòng</h3>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-medium w-full sm:w-auto"
        >
          <Plus size={16} /> Thêm Phòng
        </button>
      </div>

      {/* Mobile: Card list */}
      <div className="md:hidden divide-y divide-slate-100">
        {!Array.isArray(rooms) || rooms.length === 0 ? (
          <p className="text-center py-8 text-slate-500 px-4">Chưa có dữ liệu phòng</p>
        ) : rooms.map(room => (
          <div key={room.id} className="p-4">
            <div className="flex justify-between items-start gap-2 mb-3">
              <div>
                <h4 className="font-semibold text-slate-800 text-base">{room.name}</h4>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${room.status === 'Đã thuê' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                  {room.status}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(room)} className="p-2 rounded-lg bg-blue-50 text-blue-600 active:bg-blue-100" aria-label="Sửa">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(room.id)} className="p-2 rounded-lg bg-red-50 text-red-600 active:bg-red-100" aria-label="Xóa">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-slate-500 text-xs">Giá thuê</p>
                <p className="font-medium text-slate-800">{room.rentPrice ? room.rentPrice.toLocaleString() : '0'} đ</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-slate-500 text-xs">Phí DV</p>
                <p className="font-medium text-slate-800">{room.serviceFee ? room.serviceFee.toLocaleString() : '0'} đ</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Tên Phòng</th>
              <th className="px-6 py-4">Giá Thuê (VNĐ)</th>
              <th className="px-6 py-4">Phí Dịch Vụ (VNĐ)</th>
              <th className="px-6 py-4">Trạng Thái</th>
              <th className="px-6 py-4 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!Array.isArray(rooms) || rooms.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-slate-500">Chưa có dữ liệu phòng</td></tr>
            ) : rooms.map(room => (
              <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{room.name}</td>
                <td className="px-6 py-4 text-slate-600">{room.rentPrice ? room.rentPrice.toLocaleString() : '0'}</td>
                <td className="px-6 py-4 text-slate-600">{room.serviceFee ? room.serviceFee.toLocaleString() : '0'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${room.status === 'Đã thuê' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {room.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => handleEdit(room)} className="text-blue-500 hover:text-blue-700"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(room.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md p-5 sm:p-6 max-h-[92dvh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Sửa Phòng' : 'Thêm Phòng Mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên Phòng</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giá Thuê (VNĐ)</label>
                <input type="number" required value={formData.rentPrice} onChange={e => setFormData({ ...formData, rentPrice: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phí Dịch Vụ (VNĐ)</label>
                <input type="number" required value={formData.serviceFee} onChange={e => setFormData({ ...formData, serviceFee: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base" />
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 safe-bottom">
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

export default Rooms;
