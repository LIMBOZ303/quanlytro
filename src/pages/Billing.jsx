import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';

const API_URL = 'http://localhost:5000/api';

const Billing = () => {
  const [rooms, setRooms] = useState([]);
  const [bills, setBills] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ roomId: '', electricityOld: '', electricityNew: '', waterOld: '', waterNew: '', electricityPrice: '3500', waterPrice: '20000' });
  const [billToExport, setBillToExport] = useState(null);
  const billRef = useRef(null);

  const fetchData = async () => {
    try {
      const [rRes, bRes] = await Promise.all([
        axios.get(`${API_URL}/rooms`),
        axios.get(`${API_URL}/bills?month=${selectedMonth}&year=${selectedYear}`)
      ]);
      setRooms(rRes.data.filter(r => r.status === 'Đã thuê'));
      setBills(bRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/bills`, {
        ...formData,
        month: selectedMonth,
        year: selectedYear
      });
      setIsModalOpen(false);
      setFormData({ roomId: '', electricityOld: '', electricityNew: '', waterOld: '', waterNew: '', electricityPrice: '3500', waterPrice: '20000' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Có lỗi hoặc phòng này đã được tính tiền cho tháng này!');
    }
  };

  const handleExport = async () => {
    if (billRef.current) {
      const canvas = await html2canvas(billRef.current, { scale: 2 });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `HoaDon_${billToExport.room.name}_T${billToExport.month}_${billToExport.year}.png`;
      link.click();
      setBillToExport(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm text-slate-500 mr-2">Tháng</label>
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="border border-slate-300 rounded px-3 py-1.5 focus:ring-indigo-500">
              {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-500 mr-2">Năm</label>
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="border border-slate-300 rounded px-3 py-1.5 focus:ring-indigo-500">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
        >
          Tính tiền phòng mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Phòng</th>
              <th className="px-6 py-4">Số điện (Cũ - Mới)</th>
              <th className="px-6 py-4">Số nước (Cũ - Mới)</th>
              <th className="px-6 py-4">Tổng tiền (VNĐ)</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bills.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-slate-500">Chưa có hóa đơn cho tháng này</td></tr>
            ) : bills.map(bill => (
              <tr key={bill.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-800">{bill.room.name}</td>
                <td className="px-6 py-4">{bill.electricityOld} - {bill.electricityNew}</td>
                <td className="px-6 py-4">{bill.waterOld} - {bill.waterNew}</td>
                <td className="px-6 py-4 font-bold text-rose-600">{bill.totalAmount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${bill.status === 'Đã thanh toán' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setBillToExport(bill)} className="text-indigo-600 hover:underline">Xuất hóa đơn</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add Bill */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">
            <h3 className="text-xl font-bold mb-4">Tính Tiền Tháng {selectedMonth}/{selectedYear}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Chọn phòng (Chỉ hiện phòng đã thuê)</label>
                <select required value={formData.roomId} onChange={e => setFormData({...formData, roomId: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện CŨ</label>
                <input type="number" required value={formData.electricityOld} onChange={e => setFormData({...formData, electricityOld: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số điện MỚI</label>
                <input type="number" required value={formData.electricityNew} onChange={e => setFormData({...formData, electricityNew: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số nước CŨ</label>
                <input type="number" required value={formData.waterOld} onChange={e => setFormData({...formData, waterOld: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số nước MỚI</label>
                <input type="number" required value={formData.waterNew} onChange={e => setFormData({...formData, waterNew: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Đơn giá điện</label>
                <input type="number" required value={formData.electricityPrice} onChange={e => setFormData({...formData, electricityPrice: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Đơn giá nước</label>
                <input type="number" required value={formData.waterPrice} onChange={e => setFormData({...formData, waterPrice: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>
              <div className="col-span-2 flex justify-end gap-3 pt-4 border-t mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Lưu & Tính tiền</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Export View (Hidden but rendered for html2canvas) */}
      {billToExport && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-md w-full relative">
            <div ref={billRef} className="p-8 bg-white" style={{ fontFamily: 'sans-serif' }}>
              <div className="text-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">PHIẾU THU TIỀN PHÒNG</h2>
                <p className="text-slate-500">Tháng {billToExport.month} / {billToExport.year}</p>
                <p className="text-lg font-bold text-indigo-600 mt-2">Phòng: {billToExport.room.name}</p>
              </div>
              
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Tiền phòng:</span>
                  <span className="font-semibold">{billToExport.room.rentPrice.toLocaleString()} VNĐ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí dịch vụ:</span>
                  <span className="font-semibold">{billToExport.room.serviceFee.toLocaleString()} VNĐ</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền điện ({billToExport.electricityNew} - {billToExport.electricityOld} = {billToExport.electricityNew - billToExport.electricityOld} kWh):</span>
                  <span className="font-semibold">{((billToExport.electricityNew - billToExport.electricityOld) * billToExport.electricityPrice).toLocaleString()} VNĐ</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền nước ({billToExport.waterNew} - {billToExport.waterOld} = {billToExport.waterNew - billToExport.waterOld} khối):</span>
                  <span className="font-semibold">{((billToExport.waterNew - billToExport.waterOld) * billToExport.waterPrice).toLocaleString()} VNĐ</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-800">TỔNG CỘNG:</span>
                  <span className="text-2xl font-black text-rose-600">{billToExport.totalAmount.toLocaleString()} đ</span>
                </div>
              </div>
              <div className="text-center mt-6 text-xs text-slate-400">
                <p>Cảm ơn quý khách!</p>
                <p>Vui lòng thanh toán trước ngày 05 hàng tháng.</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
              <button onClick={() => setBillToExport(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded font-medium">Đóng</button>
              <button onClick={handleExport} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded font-medium">Tải Ảnh (Lưu về máy)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
