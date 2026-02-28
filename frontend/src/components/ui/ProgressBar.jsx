import { motion } from 'framer-motion';

export default function ProgressBar({ value = 0, max = 100, color = '#6366f1', height = 'h-1.5', showLabel = false, className = '' }) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-white/40 mb-1 font-mono">
          <span>{value} / {max}</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-white/5 rounded-full overflow-hidden`}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
          style={{ background: color, boxShadow: pct > 0 ? `0 0 8px ${color}50` : 'none' }}
        />
      </div>
    </div>
  );
}
