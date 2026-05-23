import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Home, Users, DollarSign, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    rentedRooms: 0,
    totalTenants: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, tenantsRes] = await Promise.all([
          axiosClient.get('/rooms'),
          axiosClient.get('/tenants')
        ]);

        const rooms = Array.isArray(roomsRes?.data) ? roomsRes.data : [];
        const tenants = Array.isArray(tenantsRes?.data) ? tenantsRes.data : [];

        setStats({
          totalRooms: rooms.length,
          rentedRooms: rooms.filter(r => r.status === 'Đã thuê').length,
          totalTenants: tenants.length,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Tổng số phòng', value: stats.totalRooms, icon: Home, color: 'bg-blue-500' },
    { title: 'Phòng đã thuê', value: stats.rentedRooms, icon: Activity, color: 'bg-emerald-500' },
    { title: 'Số lượng khách', value: stats.totalTenants, icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6 flex items-center gap-3 md:gap-4">
              <div className={`${stat.color} w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0`}>
                <Icon size={22} className="md:w-6 md:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-slate-800 mb-3 md:mb-4">Chào mừng đến với hệ thống quản lý</h3>
        <p className="text-sm md:text-base text-slate-600 leading-relaxed">
          <span className="md:hidden">Dùng thanh menu phía dưới để mở Phòng trọ, Khách thuê và Tính tiền hàng tháng.</span>
          <span className="hidden md:inline">Sử dụng thanh menu bên trái để điều hướng đến các chức năng quản lý Phòng trọ, Khách thuê, và Tính tiền hàng tháng.</span>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
