import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, HomeIcon, Users, FileText, Settings } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Tổng quan', icon: Home },
    { path: '/rooms', label: 'Phòng trọ', icon: HomeIcon },
    { path: '/tenants', label: 'Khách thuê', icon: Users },
    { path: '/billing', label: 'Tính tiền', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-slate-100">
          <h1 className="text-xl font-bold text-indigo-600 tracking-wide">Quản Lý Phòng Trọ</h1>
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shadow-sm justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {navItems.find(item => item.path === location.pathname)?.label || 'Bảng điều khiển'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              A
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
