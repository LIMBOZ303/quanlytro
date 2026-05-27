import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, IdCard, MapPin, CalendarDays } from 'lucide-react';
import StatusBadge from './StatusBadge';

const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN') + ' đ';

function RoomDetailModal({ open, room, tenants = [], onClose }) {
  if (!open || !room) return null;

  const tenantList = Array.isArray(tenants) ? tenants : [];
  const hasTenants = tenantList.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[8px]"
            onClick={onClose}
            aria-label="Đóng"
          />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="relative bg-white w-full sm:max-w-lg p-5 sm:p-6 max-h-[92dvh] overflow-y-auto"
            style={{ borderRadius: 'var(--radius-modal)', boxShadow: 'var(--shadow-modal)' }}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-[var(--color-on-surface)] truncate">
                  {room.name}
                </h3>
                <div className="mt-2">
                  <StatusBadge status={room.status} />
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="icon-btn shrink-0"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl border border-[var(--color-outline)] bg-[var(--color-surface-container-low)] p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-[var(--color-muted)]">Giá thuê</span>
                <span className="font-semibold text-[var(--color-primary)] tabular-nums">
                  {formatCurrency(room.rentPrice)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--color-muted)]">Phí dịch vụ</span>
                <span className="font-semibold tabular-nums">{formatCurrency(room.serviceFee)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[var(--color-muted)]">Trạng thái</span>
                <span className="font-medium">{room.status}</span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-[var(--color-on-surface)] mb-3">
              Khách thuê trong phòng ({tenantList.length})
            </h4>

            {!hasTenants ? (
              <div className="rounded-xl border border-dashed border-[var(--color-outline)] bg-white p-6 text-center">
                <p className="text-sm text-[var(--color-muted)]">Phòng này chưa có khách thuê.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {tenantList.map((tenant) => (
                  <li
                    key={tenant.id}
                    className="rounded-xl border border-[var(--color-outline)] bg-[var(--color-surface-container-low)] p-4 space-y-2 text-[13px]"
                  >
                    <p className="font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
                      <User size={14} className="text-[var(--color-muted)] shrink-0" />
                      {tenant.fullName || 'Chưa có tên'}
                    </p>
                    <p className="text-[var(--color-on-surface-variant)] flex items-center gap-2">
                      <Phone size={14} className="text-[var(--color-muted)] shrink-0" />
                      {tenant.phone || '—'}
                    </p>
                    <p className="text-[var(--color-on-surface-variant)] flex items-center gap-2">
                      <IdCard size={14} className="text-[var(--color-muted)] shrink-0" />
                      {tenant.idCard || '—'}
                    </p>
                    <p className="text-[var(--color-on-surface-variant)] flex items-center gap-2">
                      <CalendarDays size={14} className="text-[var(--color-muted)] shrink-0" />
                      Năm sinh: {tenant.birthYear || '—'}
                    </p>
                    <p className="text-[var(--color-on-surface-variant)] flex items-center gap-2">
                      <MapPin size={14} className="text-[var(--color-muted)] shrink-0" />
                      {tenant.hometown || '—'}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex justify-end">
              <button type="button" onClick={onClose} className="btn-ghost">
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default RoomDetailModal;
