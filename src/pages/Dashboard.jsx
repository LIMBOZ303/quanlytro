import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Home, Users, DollarSign, Activity } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

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
          axios.get(`${API_URL}/rooms`),
          axios.get(`${API_URL}/tenants`)
        ]);
        
        const rooms = roomsRes.data;
        const tenants = tenantsRes.data;
        
        setStats({
          totalRooms: rooms.length,
          rentedRooms: rooms.filter(r => r.status === 'Đã thuê').length,
          totalTenants: tenants.length,
        });
      } catch (err) {
        console.error(err);
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center gap-4">
              <div className={`${stat.color} w-14 h-14 rounded-lg flex items-center justify-center text-white shadow-sm`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Chào mừng đến với hệ thống quản lý</h3>
        <p className="text-slate-600">
          Sử dụng thanh menu bên trái để điều hướng đến các chức năng quản lý Phòng trọ, Khách thuê, và Tính tiền hàng tháng.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
