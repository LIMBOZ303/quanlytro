import React from 'react';
import {
  User,
  Phone,
  IdCard,
  MapPin,
  CalendarDays,
  Pencil,
  Trash2,
  ReceiptText,
  Eye,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const formatCurrency = (value) => Number(value || 0).toLocaleString('vi-VN') + ' đ';

const statusBarClass = (status) => {
  if (status === 'Trống') return 'bg-emerald-500';
  if (status === 'Đã thuê') return 'bg-blue-500';
  if (status === 'Chưa thanh toán') return 'bg-amber-500';
  if (status === 'Quá hạn') return 'bg-rose-500';
  return 'bg-slate-400';
};

const RoomCard = ({ room, tenant, tenantCount = 0, onEdit, onDelete, onCreateBill, onDetail }) => {
  const hasTenant = Boolean(tenant);
  const extraTenants = tenantCount > 1 ? tenantCount - 1 : 0;

  const handleCardClick = () => {
    onDetail?.(room);
  };

  return (
    <article
      className="room-card group cursor-pointer"
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Chi tiết phòng ${room.name}`}
    >
      <div className={`h-1.5 w-full ${statusBarClass(room.status)}`} />

      <div className="p-4 md:p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] md:text-base font-bold text-[var(--color-on-surface)] truncate">
              {room.name}
            </h3>
            <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">
              Giá thuê:{' '}
              <span className="font-semibold text-[var(--color-primary)] tabular-nums">
                {formatCurrency(room.rentPrice)}
              </span>
            </p>
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              Phí dịch vụ:{' '}
              <span className="font-semibold tabular-nums">{formatCurrency(room.serviceFee)}</span>
            </p>
          </div>
          <StatusBadge status={room.status} />
        </div>

        <div className="rounded-xl border border-[var(--color-outline)] bg-[var(--color-surface-container-low)] p-3 min-h-[126px]">
          {hasTenant ? (
            <div className="space-y-2 text-[13px]">
              <p className="font-semibold text-[var(--color-on-surface)] flex items-center gap-2">
                <User size={14} className="text-[var(--color-muted)] shrink-0" />
                <span className="truncate">{tenant.fullName || 'Chưa có tên khách'}</span>
                {extraTenants > 0 && (
                  <span className="shrink-0 text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary-tint)] px-2 py-0.5 rounded-full">
                    +{extraTenants} khách
                  </span>
                )}
              </p>
              <p className="text-[var(--color-on-surface-variant)] flex items-center gap-2">
                <Phone size={14} className="text-[var(--color-muted)] shrink-0" />
                <span>{tenant.phone || 'Chưa có SĐT'}</span>
              </p>
              <p className="text-[var(--color-on-surface-variant)] flex items-center gap-2">
                <IdCard size={14} className="text-[var(--color-muted)] shrink-0" />
                <span>{tenant.idCard || 'Chưa có CCCD'}</span>
              </p>
              <p className="text-[var(--color-on-surface-variant)] flex items-center gap-2">
                <MapPin size={14} className="text-[var(--color-muted)] shrink-0" />
                <span className="truncate">
                  {tenant.hometown || 'Chưa có quê quán'}
                  {tenant.birthYear ? ` · ${tenant.birthYear}` : ''}
                </span>
              </p>
              <p className="text-[var(--color-on-surface-variant)] flex items-center gap-2">
                <CalendarDays size={14} className="text-[var(--color-muted)] shrink-0" />
                <span>{tenant.startDate || tenant.createdAt?.slice(0, 10) || 'Chưa có ngày thuê'}</span>
              </p>
            </div>
          ) : (
            <div className="h-full rounded-lg border border-dashed border-[var(--color-outline)] bg-white flex items-center justify-center text-center px-4">
              <p className="text-sm text-[var(--color-muted)]">Chưa có khách thuê</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 md:px-5 py-3 border-t border-[var(--color-outline)] bg-white flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDetail?.(room);
            }}
            className="icon-btn text-[var(--color-primary)] hover:bg-[var(--color-primary-tint)]"
            aria-label="Chi tiết phòng"
            title="Chi tiết"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(room);
            }}
            className="icon-btn text-blue-600 hover:bg-blue-50"
            aria-label="Sửa phòng"
            title="Sửa phòng"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(room.id);
            }}
            className="icon-btn text-rose-600 hover:bg-rose-50"
            aria-label="Xóa phòng"
            title="Xóa phòng"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCreateBill(room);
          }}
          className="btn-primary !py-2 !px-3 !text-xs"
        >
          <ReceiptText size={14} />
          Tính tiền
        </button>
      </div>
    </article>
  );
};

export default RoomCard;
