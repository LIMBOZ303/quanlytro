import { Inbox } from 'lucide-react';

function EmptyState({ title = 'Chưa có dữ liệu', description, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--color-surface-container-low)] flex items-center justify-center mb-4">
        <Icon size={28} className="text-[var(--color-muted)]" />
      </div>
      <p className="text-sm font-semibold text-[var(--color-on-surface)]">{title}</p>
      {description && (
        <p className="text-[13px] text-[var(--color-on-surface-variant)] mt-1 max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}

export default EmptyState;
