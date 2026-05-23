import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Building2, Users, Receipt, LogOut } from 'lucide-react';
import { getUser, logout } from '../utils/auth';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const userInitial = (user?.username || 'A').charAt(0).toUpperCase();

  const navItems = [
    { path: '/', label: 'Tổng quan', shortLabel: 'Tổng quan', icon: Home },
    { path: '/rooms', label: 'Phòng trọ', shortLabel: 'Phòng', icon: Building2 },
    { path: '/tenants', label: 'Khách thuê', shortLabel: 'Khách', icon: Users },
    { path: '/billing', label: 'Tính tiền', shortLabel: 'Tính tiền', icon: Receipt },
  ];

  const currentPage = navItems.find((item) => item.path === location.pathname);

  return (
    <div className="flex h-[100dvh] bg-[var(--color-background)]">
      <aside
        className="hidden md:flex flex-col shrink-0 bg-white border-r border-[var(--color-outline)]"
        style={{ width: 'var(--sidebar-width)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[var(--color-outline)]">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white shrink-0">
            <Building2 size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-[var(--color-on-surface)] leading-tight truncate">
              Quản Lý Phòng Trọ
            </h1>
            <p className="text-[11px] text-[var(--color-muted)]">Bảng điều khiển</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="block">
                <motion.div
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary-tint)] text-[var(--color-primary)]'
                      : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-on-surface)]'
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'}
                  />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--color-outline)] text-[11px] text-[var(--color-muted)]">
          © Quản lý phòng trọ
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 w-full min-w-0">
        <header className="h-14 md:h-16 bg-white border-b border-[var(--color-outline)] flex items-center px-4 md:px-6 justify-between shrink-0 safe-top">
          <h2 className="text-base md:text-lg font-semibold text-[var(--color-on-surface)] truncate md:hidden">
            {currentPage?.label || 'Bảng điều khiển'}
          </h2>
          <h2 className="hidden md:block text-lg font-semibold text-[var(--color-on-surface)] truncate">
            {currentPage?.label || 'Bảng điều khiển'}
          </h2>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user?.username && (
              <span className="hidden sm:inline text-sm text-[var(--color-on-surface-variant)] truncate max-w-[140px]">
                {user.username}
              </span>
            )}
            <div
              className="w-8 h-8 rounded-full bg-[var(--color-primary-tint)] flex items-center justify-center text-[var(--color-primary)] font-bold text-sm"
              title={user?.username || ''}
            >
              {userInitial}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-ghost !py-1.5 !px-2 text-[var(--color-on-surface-variant)] hover:!text-red-600 hover:!bg-red-50"
              title="Đăng xuất"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm">Đăng xuất</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          <div className="mx-auto w-full max-w-[var(--content-max-width)]">
            <Outlet />
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-outline)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] safe-bottom z-50">
        <div className="flex items-stretch justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 px-2 min-w-0 flex-1 transition-colors ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'
                }`}
              >
                <Icon size={22} />
                <span className={`text-[10px] font-semibold truncate max-w-full ${isActive ? 'text-[var(--color-primary)]' : ''}`}>
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
