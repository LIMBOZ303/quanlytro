const PageLoader = ({ label = 'Đang tải dữ liệu...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    <p className="text-sm text-slate-500">{label}</p>
  </div>
);

export const PageError = ({ message, onRetry }) => (
  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
    <p className="text-red-700 font-medium mb-1">Không tải được dữ liệu</p>
    <p className="text-sm text-red-600 mb-4">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100"
      >
        Thử lại
      </button>
    )}
  </div>
);

export default PageLoader;
