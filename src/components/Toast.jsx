import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-[var(--color-error-light)] text-[var(--color-error)]',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-blue-200 bg-blue-50 text-blue-900',
};

const ICON_STYLES = {
  success: 'text-emerald-600',
  error: 'text-[var(--color-error)]',
  warning: 'text-amber-600',
  info: 'text-blue-600',
};

function Toast({ id, type = 'info', message, onClose }) {
  const Icon = ICONS[type] || Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 w-full max-w-sm p-4 rounded-xl border shadow-lg ${STYLES[type] || STYLES.info}`}
      style={{ boxShadow: 'var(--shadow-modal)' }}
    >
      <Icon size={20} className={`shrink-0 mt-0.5 ${ICON_STYLES[type] || ICON_STYLES.info}`} />
      <p className="flex-1 text-sm font-medium leading-snug pr-1">{message}</p>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 transition-opacity"
        aria-label="Đóng thông báo"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export default Toast;
