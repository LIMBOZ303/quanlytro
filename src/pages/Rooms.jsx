import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { TableSkeleton, PageError } from '../components/PageLoader';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import RoomCard from '../components/RoomCard';
import { Plus } from 'lucide-react';

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', rentPrice: '', serviceFee: '', status: 'Trống' });
  const [editingId, setEditingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const [roomsRes, tenantsRes] = await Promise.allSettled([
        axiosClient.get('/rooms'),
        axiosClient.get('/tenants'),
      ]);

      const roomList =
        roomsRes.status === 'fulfilled' && Array.isArray(roomsRes.value?.data)
          ? roomsRes.value.data
          : [];
      const tenantList =
        tenantsRes.status === 'fulfilled' && Array.isArray(tenantsRes.value?.data)
          ? tenantsRes.value.data
          : [];

      setRooms(roomList);
      setTenants(tenantList);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setRooms([]);
      setTenants([]);
      setError(err?.response?.data?.message || 'Không thể tải danh sách phòng.');
    } finally {
      setLoading(false);
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
        status: formData.status,
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
    setFormData({
      name: room.name,
      rentPrice: room.rentPrice,
      serviceFee: room.serviceFee,
      status: room.status,
    });
    setEditingId(room.id);
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
      await axiosClient.delete(`/rooms/${deleteId}`);
      setConfirmOpen(false);
      setDeleteId(null);
      fetchRooms();
    } catch (err) {
      console.error('Error deleting room:', err);
      setConfirmError(err?.response?.data?.message || 'Có lỗi xảy ra khi xóa phòng.');
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return <TableSkeleton />;
  }

  if (error) {
    return <PageError message={error} onRetry={fetchRooms} />;
  }

  const tenantsByRoomId = new Map();
  tenants.forEach((tenant) => {
    if (tenant?.roomId && !tenantsByRoomId.has(tenant.roomId)) {
      tenantsByRoomId.set(tenant.roomId, tenant);
    }
  });

  const roomsWithTenant = rooms.map((room) => ({
    ...room,
    currentTenant: room.tenant || room.tenants?.[0] || tenantsByRoomId.get(room.id) || null,
  }));

  const hasRooms = Array.isArray(rooms) && rooms.length > 0;

  return (
    <div className="ds-card overflow-hidden">
      <div className="p-4 md:p-6 border-b border-[var(--color-outline)] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-[var(--color-surface-container-low)]/40">
        <div>
          <h1 className="ds-section-title text-xl">Danh sách phòng</h1>
          <p className="text-[13px] text-[var(--color-muted)] mt-0.5">{rooms.length} phòng trong hệ thống</p>
        </div>
        <button type="button" onClick={openAddModal} className="btn-primary w-full sm:w-auto">
          <Plus size={16} /> Thêm phòng
        </button>
      </div>

      <div className="p-4 md:p-6">
        {!hasRooms ? (
          <EmptyState title="Chưa có dữ liệu phòng" description="Nhấn Thêm phòng để bắt đầu." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {roomsWithTenant.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                tenant={room.currentTenant}
                onEdit={handleEdit}
                onDelete={openDeleteConfirm}
                onCreateBill={(targetRoom) => navigate(`/billing?roomId=${targetRoom.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-[8px]"
              onClick={() => setIsModalOpen(false)}
              aria-label="Đóng"
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="relative bg-white w-full sm:max-w-md p-5 sm:p-6 max-h-[92dvh] overflow-y-auto"
              style={{ borderRadius: 'var(--radius-modal)', boxShadow: 'var(--shadow-modal)' }}
            >
              <h3 className="text-xl font-bold mb-4 text-[var(--color-on-surface)]">
                {editingId ? 'Sửa phòng' : 'Thêm phòng mới'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="ds-label block mb-1.5">Tên phòng</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="ds-label block mb-1.5">Giá thuê (VNĐ)</label>
                  <input
                    type="number"
                    required
                    value={formData.rentPrice}
                    onChange={(e) => setFormData({ ...formData, rentPrice: e.target.value })}
                    className="input-field tabular-nums"
                  />
                </div>
                <div>
                  <label className="ds-label block mb-1.5">Phí dịch vụ (VNĐ)</label>
                  <input
                    type="number"
                    required
                    value={formData.serviceFee}
                    onChange={(e) => setFormData({ ...formData, serviceFee: e.target.value })}
                    className="input-field tabular-nums"
                  />
                </div>
                <div>
                  <label className="ds-label block mb-1.5">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="Trống">Trống</option>
                    <option value="Đã thuê">Đã thuê</option>
                    <option value="Chưa thanh toán">Chưa thanh toán</option>
                    <option value="Quá hạn">Quá hạn</option>
                  </select>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 safe-bottom">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary">
                    Lưu
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        title="Xóa phòng?"
        message="Bạn có chắc muốn xóa phòng này không? Hành động này không thể hoàn tác."
        confirmText="Xóa phòng"
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

export default Rooms;
