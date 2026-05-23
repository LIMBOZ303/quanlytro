const STATUS_STYLES = {
  'Trống': {
    bg: 'var(--status-available-bg)',
    color: 'var(--status-available)',
  },
  'Đã thuê': {
    bg: 'var(--status-rented-bg)',
    color: 'var(--status-rented)',
  },
  'Chưa thanh toán': {
    bg: 'var(--status-unpaid-bg)',
    color: 'var(--status-unpaid)',
  },
  'Đã thanh toán': {
    bg: 'var(--status-paid-bg)',
    color: 'var(--status-paid)',
  },
  'Quá hạn': {
    bg: 'var(--status-overdue-bg)',
    color: 'var(--status-overdue)',
  },
};

const DEFAULT_STYLE = {
  bg: 'var(--color-surface-container-low)',
  color: 'var(--color-on-surface-variant)',
};

function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || DEFAULT_STYLE;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold leading-[14px] whitespace-nowrap ${className}`}
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status || '—'}
    </span>
  );
}

export default StatusBadge;
