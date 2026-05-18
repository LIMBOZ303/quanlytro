import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', rentPrice: '', serviceFee: '', status: 'Trống' });
  const [editingId, setEditingId] = useState(null);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/rooms`);
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

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
        await axios.put(`${API_URL}/rooms/${editingId}`, payload);
      } else {
        await axios.post(`${API_URL}/rooms`, payload);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', rentPrice: '', serviceFee: '', status: 'Trống' });
      fetchRooms();
    } catch (err) {
      console.error(err);
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
        await axios.delete(`${API_URL}/rooms/${id}`);
        fetchRooms();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-800">Danh sách Phòng</h3>
        <button 
          onClick={() => { setEditingId(null); setFormData({ name: '', rentPrice: '', serviceFee: '', status: 'Trống' }); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <Plus size={16} /> Thêm Phòng
        </button>
      </div>

      <div className="overflow-x-auto">
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
            {rooms.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-slate-500">Chưa có dữ liệu phòng</td></tr>
            ) : rooms.map(room => (
              <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{room.name}</td>
                <td className="px-6 py-4 text-slate-600">{room.rentPrice.toLocaleString()}</td>
                <td className="px-6 py-4 text-slate-600">{room.serviceFee.toLocaleString()}</td>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">{editingId ? 'Sửa Phòng' : 'Thêm Phòng Mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên Phòng</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giá Thuê (VNĐ)</label>
                <input type="number" required value={formData.rentPrice} onChange={e => setFormData({...formData, rentPrice: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phí Dịch Vụ (VNĐ)</label>
                <input type="number" required value={formData.serviceFee} onChange={e => setFormData({...formData, serviceFee: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
