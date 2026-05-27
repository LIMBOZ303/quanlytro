import React from 'react';
import { buildBillBreakdown, formatCurrency } from '../utils/billCalculator';
import StatusBadge from './StatusBadge';

const BillReceipt = ({ bill, innerRef }) => {
  const breakdown = buildBillBreakdown(bill);

  if (!bill || !breakdown) {
    return (
      <div
        ref={innerRef}
        className="p-6 sm:p-8 bg-white text-center text-[var(--color-muted)]"
        style={{ fontFamily: 'var(--font-family)' }}
      >
        Không thể hiển thị phiếu thu. Dữ liệu hóa đơn không hợp lệ.
      </div>
    );
  }

  const { rentPrice, serviceFee, electricity, water, totalAmount } = breakdown;
  const backendTotal = Number(bill.totalAmount || 0);
  const finalTotal = backendTotal > 0 ? backendTotal : totalAmount;

  return (
    <div
      ref={innerRef}
      className="p-6 sm:p-8 bg-white"
      style={{ fontFamily: 'var(--font-family)' }}
    >
      <div className="text-center mb-6 border-b border-[var(--color-outline)] pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-on-surface)]">
          PHIẾU THU TIỀN PHÒNG
        </h2>
        <p className="text-[var(--color-muted)] text-sm mt-1">
          Tháng {bill.month} / {bill.year}
        </p>
        <p className="text-lg font-bold text-[var(--color-primary)] mt-2">
          Phòng: {bill.room?.name || 'Không xác định'}
        </p>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Khách thuê: {bill.tenant?.fullName || bill.tenantName || 'Chưa cập nhật'}
        </p>
        {bill.status && (
          <div className="mt-2 flex justify-center">
            <StatusBadge status={bill.status} />
          </div>
        )}
      </div>

      <div className="space-y-3 text-sm text-[var(--color-on-surface-variant)]">
        <div className="flex justify-between gap-3">
          <span>Tiền phòng:</span>
          <span className="font-semibold shrink-0 text-right tabular-nums">
            {formatCurrency(rentPrice)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Phí dịch vụ:</span>
          <span className="font-semibold shrink-0 text-right tabular-nums">
            {formatCurrency(serviceFee)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-left">
            Điện: {Number(bill.electricityOld || 0).toLocaleString('vi-VN')} → {Number(bill.electricityNew || 0).toLocaleString('vi-VN')} ({electricity.usage.toLocaleString('vi-VN')} kWh ×{' '}
            {Number(electricity.unitPrice).toLocaleString('vi-VN')} VNĐ)
          </span>
          <span className="font-semibold shrink-0 text-right tabular-nums">
            {formatCurrency(electricity.amount)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-left">
            Nước: {Number(bill.waterOld || 0).toLocaleString('vi-VN')} → {Number(bill.waterNew || 0).toLocaleString('vi-VN')} ({water.usage.toLocaleString('vi-VN')} khối ×{' '}
            {Number(water.unitPrice).toLocaleString('vi-VN')} VNĐ)
          </span>
          <span className="font-semibold shrink-0 text-right tabular-nums">
            {formatCurrency(water.amount)}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t-2 border-dashed border-[var(--color-outline)]">
        <div className="flex justify-between items-center gap-3">
          <span className="text-lg font-bold text-[var(--color-on-surface)]">TỔNG CỘNG:</span>
          <span className="text-xl sm:text-2xl font-black text-[var(--color-primary)] text-right tabular-nums">
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>

      {(bill.receiptImageUrl || bill.invoiceImageUrl) && (
        <div className="mt-6 p-3 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface-container-low)]">
          <a
            href={bill.receiptImageUrl || bill.invoiceImageUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            Tải ảnh hóa đơn đã lưu
          </a>
        </div>
      )}

      <div className="text-center mt-6 text-xs text-[var(--color-muted)]">
        <p>Cảm ơn quý khách!</p>
        <p>Vui lòng thanh toán trước ngày 05 hàng tháng.</p>
      </div>
    </div>
  );
};

export default BillReceipt;
