import { motion } from 'framer-motion';
import { staggerItem } from '../../animations/variants';

export default function StatCard({ label, value, sub, icon: Icon, color = '#818cf8', trend }) {
  return (
    <motion.div
      variants={staggerItem}
      className="card group hover:border-white/15 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: color + '20', color }}
        >
          <Icon size={18} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="font-display font-bold text-3xl text-white leading-none mb-1">
        {value}
      </div>
      <div className="text-white/40 text-xs font-display uppercase tracking-wider">{label}</div>
      {sub && <div className="text-white/25 text-xs mt-0.5">{sub}</div>}
    </motion.div>
  );
}
