import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, HomeIcon, Users, FileText, LogOut } from 'lucide-react';
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
    { path: '/rooms', label: 'Phòng trọ', shortLabel: 'Phòng', icon: HomeIcon },
    { path: '/tenants', label: 'Khách thuê', shortLabel: 'Khách', icon: Users },
    { path: '/billing', label: 'Tính tiền', shortLabel: 'Tính tiền', icon: FileText },
  ];

  const currentPage = navItems.find(item => item.path === location.pathname);

  return (
    <div className="flex h-[100dvh] bg-slate-50">
      {/* Sidebar - Desktop only */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 shadow-sm flex-col shrink-0">
        <div className="h-16 flex items-center justify-center border-b border-slate-100 px-4">
          <h1 className="text-xl font-bold text-indigo-600 tracking-wide text-center leading-tight">
            Quản Lý Phòng Trọ
          </h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 w-full">
        <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 shadow-sm justify-between shrink-0 safe-top">
          <h2 className="text-base md:text-lg font-semibold text-slate-800 truncate">
            {currentPage?.label || 'Bảng điều khiển'}
          </h2>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user?.username && (
              <span className="hidden sm:inline text-sm text-slate-600 truncate max-w-[120px]">
                {user.username}
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm" title={user?.username || ''}>
              {userInitial}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] safe-bottom z-50">
        <div className="flex items-stretch justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 px-2 min-w-0 flex-1 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                <Icon size={22} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                <span className={`text-[10px] font-medium truncate max-w-full ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
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
