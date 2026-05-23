const PageLoader = ({ label = 'Đang tải dữ liệu...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div
      className="w-10 h-10 border-4 border-[var(--color-primary-tint)] border-t-[var(--color-primary)] rounded-full animate-spin"
      role="status"
      aria-label="Đang tải"
    />
    <p className="text-sm text-[var(--color-on-surface-variant)]">{label}</p>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="skeleton h-10 w-48" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="ds-card p-5 flex gap-4">
          <div className="skeleton w-12 h-12 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-7 w-16" />
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="ds-card p-5 space-y-3">
        <div className="skeleton h-5 w-40" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-10 w-full" />
        ))}
      </div>
      <div className="ds-card p-5 space-y-3">
        <div className="skeleton h-5 w-40" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-10 w-full" />
        ))}
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="ds-card overflow-hidden animate-pulse">
    <div className="p-5 border-b border-[var(--color-outline)] flex justify-between">
      <div className="skeleton h-6 w-40" />
      <div className="skeleton h-10 w-32" />
    </div>
    <div className="p-4 space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="skeleton h-12 w-full" />
      ))}
    </div>
  </div>
);

export const PageError = ({ message, onRetry }) => (
  <div className="ds-card border-red-200 bg-[var(--color-error-light)] p-6 text-center max-w-lg mx-auto">
    <p className="text-[var(--color-error)] font-semibold mb-1">Không tải được dữ liệu</p>
    <p className="text-sm text-[var(--color-on-surface-variant)] mb-4">{message}</p>
    {onRetry && (
      <button type="button" onClick={onRetry} className="btn-secondary">
        Thử lại
      </button>
    )}
  </div>
);

export default PageLoader;
