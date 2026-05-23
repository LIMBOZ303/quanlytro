import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosClient from '../api/axiosClient';
import { DashboardSkeleton, PageError } from '../components/PageLoader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/billCalculator';
import {
  Building2,
  DoorOpen,
  Users,
  Wallet,
  AlertCircle,
  Home,
  Receipt,
  ChevronRight,
} from 'lucide-react';

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [roomsRes, tenantsRes, billsRes] = await Promise.all([
        axiosClient.get('/rooms'),
        axiosClient.get('/tenants'),
        axiosClient.get(`/bills?month=${month}&year=${year}`).catch(() => ({ data: [] })),
      ]);

      setRooms(Array.isArray(roomsRes?.data) ? roomsRes.data : []);
      setTenants(Array.isArray(tenantsRes?.data) ? tenantsRes.data : []);
      setBills(Array.isArray(billsRes?.data) ? billsRes.data : []);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(
        err?.response?.data?.message || 'Không thể tải thống kê. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const rented = rooms.filter((r) => r.status === 'Đã thuê').length;
    const vacant = rooms.filter((r) => r.status === 'Trống').length;
    const revenue = bills
      .filter((b) => b.status === 'Đã thanh toán')
      .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
    const unpaid = bills.filter((b) => b.status !== 'Đã thanh toán').length;
    return {
      totalRooms: rooms.length,
      rentedRooms: rented,
      vacantRooms: vacant,
      totalTenants: tenants.length,
      revenue,
      unpaid,
    };
  }, [rooms, tenants, bills]);

  const recentBills = useMemo(
    () => [...bills].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5),
    [bills]
  );

  const recentTenants = useMemo(
    () => [...tenants].slice(0, 5),
    [tenants]
  );

  const occupiedRooms = useMemo(
    () => rooms.filter((r) => r.status === 'Đã thuê').slice(0, 6),
    [rooms]
  );

  const statCards = [
    { title: 'Tổng phòng', value: stats.totalRooms, icon: Building2, accent: 'primary' },
    { title: 'Phòng đang thuê', value: stats.rentedRooms, icon: Home, accent: 'rented' },
    { title: 'Phòng trống', value: stats.vacantRooms, icon: DoorOpen, accent: 'available' },
    { title: 'Tổng khách thuê', value: stats.totalTenants, icon: Users, accent: 'secondary' },
    {
      title: `Doanh thu tháng ${month}`,
      value: formatCurrency(stats.revenue),
      icon: Wallet,
      accent: 'revenue',
    },
    { title: 'Chưa thanh toán', value: stats.unpaid, icon: AlertCircle, accent: 'warning' },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <PageError message={error} onRetry={fetchData} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div>
        <h1 className="ds-page-title">Tổng quan</h1>
        <p className="text-[13px] text-[var(--color-on-surface-variant)] mt-1">
          Tháng {month}/{year} · Cập nhật theo dữ liệu hệ thống
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {statCards.map((stat, idx) => (
          <StatCard key={stat.title} {...stat} delay={idx * 0.04} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="ds-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-outline)] flex items-center justify-between">
            <h3 className="ds-section-title flex items-center gap-2">
              <Receipt size={18} className="text-[var(--color-primary)]" />
              Hóa đơn gần đây
            </h3>
            <Link
              to="/billing"
              className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-0.5 hover:underline"
            >
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>
          {recentBills.length === 0 ? (
            <EmptyState
              title="Chưa có hóa đơn tháng này"
              description="Vào mục Tính tiền để tạo hóa đơn cho phòng đã thuê."
            />
          ) : (
            <ul className="divide-y divide-[var(--color-outline)]">
              {recentBills.map((bill) => (
                <li
                  key={bill.id}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[var(--color-primary-tint)]/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-on-surface)] truncate">
                      {bill.room?.name || 'Phòng không xác định'}
                    </p>
                    <p className="text-[13px] text-[var(--color-muted)] tabular-nums">
                      T{bill.month}/{bill.year}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-[var(--color-primary)] tabular-nums">
                      {formatCurrency(bill.totalAmount ?? 0)}
                    </span>
                    <StatusBadge status={bill.status || 'Chưa thanh toán'} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ds-card overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-outline)] flex items-center justify-between">
            <h3 className="ds-section-title flex items-center gap-2">
              <Users size={18} className="text-[var(--color-primary)]" />
              Khách thuê gần đây
            </h3>
            <Link
              to="/tenants"
              className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-0.5 hover:underline"
            >
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>
          {recentTenants.length === 0 ? (
            <EmptyState
              title="Chưa có khách thuê"
              description="Thêm khách thuê và gán phòng trong mục Khách thuê."
            />
          ) : (
            <ul className="divide-y divide-[var(--color-outline)]">
              {recentTenants.map((tenant) => (
                <li
                  key={tenant.id}
                  className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[var(--color-primary-tint)]/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-on-surface)] truncate">
                      {tenant.fullName}
                    </p>
                    <p className="text-[13px] text-[var(--color-muted)]">{tenant.phone}</p>
                  </div>
                  {tenant.room ? (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-primary-tint)] text-[var(--color-primary)]">
                      {tenant.room.name}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--color-muted)] italic">Chưa gán phòng</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="ds-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-outline)] flex items-center justify-between">
          <h3 className="ds-section-title flex items-center gap-2">
            <Building2 size={18} className="text-[var(--color-primary)]" />
            Phòng đang có khách
          </h3>
          <Link
            to="/rooms"
            className="text-xs font-semibold text-[var(--color-primary)] flex items-center gap-0.5 hover:underline"
          >
            Quản lý phòng <ChevronRight size={14} />
          </Link>
        </div>
        {occupiedRooms.length === 0 ? (
          <EmptyState
            title="Chưa có phòng đang cho thuê"
            description="Gán khách vào phòng hoặc cập nhật trạng thái phòng thành Đã thuê."
          />
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {occupiedRooms.map((room) => (
              <div
                key={room.id}
                className="rounded-lg border border-[var(--color-outline)] p-4 bg-[var(--color-surface-container-low)]/50"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-[var(--color-on-surface)]">{room.name}</p>
                  <StatusBadge status={room.status} />
                </div>
                <p className="text-[13px] text-[var(--color-on-surface-variant)] tabular-nums">
                  Giá thuê: {(room.rentPrice ?? 0).toLocaleString('vi-VN')} đ
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};

export default Dashboard;
