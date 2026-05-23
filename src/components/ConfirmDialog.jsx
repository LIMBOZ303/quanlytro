import React from 'react';

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
  if (!open) return null;

  const confirmBtnClass = danger
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Đóng"
        onClick={loading ? undefined : onCancel}
        disabled={loading}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 mx-auto">
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-slate-800 mb-2">
          {title}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{message}</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2.5 text-white rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmBtnClass}`}
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
