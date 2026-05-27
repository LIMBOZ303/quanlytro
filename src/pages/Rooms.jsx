import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { TableSkeleton, PageError } from '../components/PageLoader';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import RoomCard from '../components/RoomCard';
import RoomDetailModal from '../components/RoomDetailModal';
import { useToast } from '../components/ToastProvider';
import { Plus } from 'lucide-react';

const getRoomTenants = (room, tenantsByRoomId) => {
  if (Array.isArray(room?.tenants) && room.tenants.length > 0) {
    return room.tenants;
  }
  return tenantsByRoomId.get(room.id) || [];
};

const Rooms = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', rentPrice: '', serviceFee: '', status: 'Trống' });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [detailRoom, setDetailRoom] = useState(null);

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

  const tenantsByRoomId = useMemo(() => {
    const map = new Map();
    tenants.forEach((tenant) => {
      if (tenant?.roomId) {
        if (!map.has(tenant.roomId)) {
          map.set(tenant.roomId, []);
        }
        map.get(tenant.roomId).push(tenant);
      }
    });
    return map;
  }, [tenants]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', rentPrice: '', serviceFee: '', status: 'Trống' });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeRoomModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', rentPrice: '', serviceFee: '', status: 'Trống' });
    setFormError('');
  };

  const checkDuplicateRoomName = (name, excludeId = null) => {
    const normalized = name.trim().toLowerCase();
    return rooms.some(
      (r) =>
        r.name?.trim().toLowerCase() === normalized &&
        String(r.id) !== String(excludeId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setFormError('Vui lòng nhập tên phòng.');
      return;
    }

    if (checkDuplicateRoomName(trimmedName, editingId)) {
      const msg = 'Tên phòng này đã tồn tại. Vui lòng chọn tên phòng khác.';
      setFormError(msg);
      showToast({ type: 'error', message: msg });
      return;
    }

    const payload = {
      name: trimmedName,
      rentPrice: Number(formData.rentPrice),
      serviceFee: Number(formData.serviceFee),
      status: formData.status,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await axiosClient.put(`/rooms/${editingId}`, payload);
        showToast({ type: 'success', message: 'Cập nhật phòng thành công.' });
      } else {
        await axiosClient.post('/rooms', payload);
        showToast({ type: 'success', message: 'Thêm phòng thành công.' });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', rentPrice: '', serviceFee: '', status: 'Trống' });
      fetchRooms();
    } catch (err) {
      console.error('Error submitting room:', err);
      const msg =
        err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setFormError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
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
    setFormError('');
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
      showToast({ type: 'success', message: 'Xóa phòng thành công.' });
      if (detailRoom?.id === deleteId) {
        setDetailRoom(null);
      }
      fetchRooms();
    } catch (err) {
      console.error('Error deleting room:', err);
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra khi xóa phòng.';
      setConfirmError(msg);
      showToast({ type: 'error', message: msg });
    } finally {
      setConfirmLoading(false);
    }
  };

  const openRoomDetail = (room) => {
    setDetailRoom(room);
  };

  if (loading) {
    return <TableSkeleton />;
  }

  if (error) {
    return <PageError message={error} onRetry={fetchRooms} />;
  }

  const roomsWithTenant = rooms.map((room) => {
    const roomTenants = getRoomTenants(room, tenantsByRoomId);
    return {
      ...room,
      roomTenants,
      currentTenant: roomTenants[0] || room.tenant || null,
      tenantCount: roomTenants.length,
    };
  });

  const hasRooms = Array.isArray(rooms) && rooms.length > 0;
  const detailTenants = detailRoom
    ? getRoomTenants(detailRoom, tenantsByRoomId)
    : [];

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
                tenantCount={room.tenantCount}
                onEdit={handleEdit}
                onDelete={openDeleteConfirm}
                onCreateBill={(targetRoom) => navigate(`/billing?roomId=${targetRoom.id}`)}
                onDetail={openRoomDetail}
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
              onClick={closeRoomModal}
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
                {formError && (
                  <div className="rounded-lg border border-red-200 bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error)]">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="ds-label block mb-1.5">Tên phòng</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formError) setFormError('');
                    }}
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
                  <button type="button" onClick={closeRoomModal} disabled={submitting} className="btn-ghost">
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

      <RoomDetailModal
        open={Boolean(detailRoom)}
        room={detailRoom}
        tenants={detailTenants}
        onClose={() => setDetailRoom(null)}
      />

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
