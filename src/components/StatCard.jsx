import { motion } from 'framer-motion';

function StatCard({ title, value, icon: Icon, accent = 'primary', delay = 0 }) {
  const accentMap = {
    primary: 'bg-[var(--color-primary)] text-white',
    secondary: 'bg-[var(--color-secondary)] text-white',
    available: 'bg-emerald-500 text-white',
    rented: 'bg-blue-500 text-white',
    warning: 'bg-amber-500 text-white',
    revenue: 'bg-indigo-700 text-white',
  };

  const iconClass = accentMap[accent] || accentMap.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="ds-card p-4 md:p-5 flex items-center gap-4 min-w-0"
    >
      <div
        className={`w-11 h-11 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${iconClass}`}
      >
        {Icon && <Icon size={22} strokeWidth={2} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-[var(--color-on-surface-variant)] font-medium truncate">
          {title}
        </p>
        <p className="text-xl md:text-2xl font-bold text-[var(--color-on-surface)] tabular-nums mt-0.5">
          {value}
        </p>
      </div>
    </motion.div>
  );
}

export default StatCard;
