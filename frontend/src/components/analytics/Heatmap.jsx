import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';

const getIntensityColor = (data, color, maxIntensity = 4) => {
  if (!data) return 'rgba(255,255,255,0.04)';
  if (data.status === 'skipped') return 'rgba(234,179,8,0.2)';
  
  const intensity = data.intensity || 1;
  const alpha = 0.2 + (intensity / maxIntensity) * 0.8;
  return color + Math.round(alpha * 255).toString(16).padStart(2, '0');
};

export default function Heatmap({ data = {}, color = '#6366f1', weeks = 13 }) {
  const [tooltip, setTooltip] = useState(null);
  
  const days = useMemo(() => {
    const end = new Date();
    const start = subDays(end, weeks * 7 - 1);
    return eachDayOfInterval({ start, end });
  }, [weeks]);

  const grid = useMemo(() => {
    // Group by week columns
    const columns = [];
    let currentWeek = [];
    days.forEach(day => {
      currentWeek.push(day);
      if (day.getDay() === 6) {
        columns.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) columns.push(currentWeek);
    return columns;
  }, [days]);

  const months = useMemo(() => {
    const monthLabels = [];
    let lastMonth = null;
    grid.forEach((week, i) => {
      const month = format(week[0], 'MMM');
      if (month !== lastMonth) {
        monthLabels.push({ month, idx: i });
        lastMonth = month;
      }
    });
    return monthLabels;
  }, [grid]);

  return (
    <div className="relative">
      {/* Month labels */}
      <div className="flex mb-1 ml-6">
        {months.map(({ month, idx }) => (
          <span
            key={month + idx}
            className="text-xs text-white/30 font-mono"
            style={{ position: 'absolute', left: `${24 + idx * 13}px` }}
          >
            {month}
          </span>
        ))}
      </div>
      
      <div className="flex gap-1 mt-5">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
            <div key={i} className="h-[10px] text-xs text-white/20 font-mono leading-none" style={{ fontSize: '9px' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {[0,1,2,3,4,5,6].map(dayOfWeek => {
              const day = week.find(d => d.getDay() === dayOfWeek);
              if (!day) return <div key={dayOfWeek} className="w-[10px] h-[10px]" />;
              
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayData = data[dateStr];
              const isFuture = day > new Date();

              return (
                <motion.div
                  key={dayOfWeek}
                  className={`w-[10px] h-[10px] rounded-sm cursor-pointer transition-all duration-150 ${isFuture ? 'opacity-20' : 'hover:scale-125 hover:z-10'}`}
                  style={{ background: isFuture ? 'rgba(255,255,255,0.04)' : getIntensityColor(dayData, color) }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: wi * 0.01, duration: 0.2 }}
                  onMouseEnter={(e) => {
                    const rect = e.target.getBoundingClientRect();
                    setTooltip({ dateStr, dayData, x: rect.left, y: rect.top });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs text-white/20 font-mono">Less</span>
        {[0.1, 0.3, 0.5, 0.7, 0.9].map(alpha => (
          <div
            key={alpha}
            className="w-[10px] h-[10px] rounded-sm"
            style={{ background: color + Math.round(alpha * 255).toString(16).padStart(2, '0') }}
          />
        ))}
        <span className="text-xs text-white/20 font-mono">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 glass rounded-lg px-3 py-2 text-xs pointer-events-none"
          style={{ left: tooltip.x + 15, top: tooltip.y - 10, transform: 'translateY(-100%)' }}
        >
          <p className="font-display font-semibold text-white">{tooltip.dateStr}</p>
          <p className="text-white/50 mt-0.5">
            {tooltip.dayData
              ? `${tooltip.dayData.status} · intensity ${tooltip.dayData.intensity}`
              : 'No activity'
            }
          </p>
        </div>
      )}
    </div>
  );
}
