import React from 'react';
import { buildBillBreakdown, formatCurrency } from '../utils/billCalculator';

const BillReceipt = ({ bill, innerRef }) => {
  const breakdown = buildBillBreakdown(bill);

  if (!bill || !breakdown) {
    return (
      <div ref={innerRef} className="p-6 sm:p-8 bg-white text-center text-slate-500">
        Không thể hiển thị phiếu thu. Dữ liệu hóa đơn không hợp lệ.
      </div>
    );
  }

  const { rentPrice, serviceFee, electricity, water, totalAmount } = breakdown;

  return (
    <div ref={innerRef} className="p-6 sm:p-8 bg-white" style={{ fontFamily: 'sans-serif' }}>
      <div className="text-center mb-6 border-b pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">PHIẾU THU TIỀN PHÒNG</h2>
        <p className="text-slate-500">Tháng {bill.month} / {bill.year}</p>
        <p className="text-lg font-bold text-indigo-600 mt-2">
          Phòng: {bill.room?.name || 'Không xác định'}
        </p>
      </div>

      <div className="space-y-3 text-sm text-slate-700">
        <div className="flex justify-between gap-3">
          <span>Tiền phòng:</span>
          <span className="font-semibold shrink-0 text-right">{formatCurrency(rentPrice)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Phí dịch vụ:</span>
          <span className="font-semibold shrink-0 text-right">{formatCurrency(serviceFee)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-left">
            Điện: {electricity.usage.toLocaleString('vi-VN')} kWh × {Number(electricity.unitPrice).toLocaleString('vi-VN')} VNĐ
          </span>
          <span className="font-semibold shrink-0 text-right">{formatCurrency(electricity.amount)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-left">
            Nước: {water.usage.toLocaleString('vi-VN')} khối × {Number(water.unitPrice).toLocaleString('vi-VN')} VNĐ
          </span>
          <span className="font-semibold shrink-0 text-right">{formatCurrency(water.amount)}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-dashed border-slate-200">
        <div className="flex justify-between items-center gap-3">
          <span className="text-lg font-bold text-slate-800">TỔNG CỘNG:</span>
          <span className="text-xl sm:text-2xl font-black text-rose-600 text-right">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      <div className="text-center mt-6 text-xs text-slate-400">
        <p>Cảm ơn quý khách!</p>
        <p>Vui lòng thanh toán trước ngày 05 hàng tháng.</p>
      </div>
    </div>
  );
};

export default BillReceipt;
