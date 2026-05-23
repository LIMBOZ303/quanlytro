import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  danger = false,
  loading = false,
  error = '',
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-[8px]"
            aria-label="Đóng"
            onClick={loading ? undefined : onCancel}
            disabled={loading}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white w-full max-w-md p-5 sm:p-6 mx-auto"
            style={{
              borderRadius: 'var(--radius-modal)',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <h2
              id="confirm-dialog-title"
              className="text-lg font-bold text-[var(--color-on-surface)] mb-2"
            >
              {title}
            </h2>
            <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed whitespace-pre-line">
              {message}
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error)]">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2.5 text-white rounded-lg font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                  danger
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'btn-primary'
                }`}
              >
                {loading ? 'Đang xử lý...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
