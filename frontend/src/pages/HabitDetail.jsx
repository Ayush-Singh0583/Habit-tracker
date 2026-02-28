import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, Award, Target, TrendingUp, Edit2 } from 'lucide-react';
import { analyticsAPI, logsAPI } from '../services/api';
import { habitsAPI } from '../services/api';
import Heatmap from '../components/analytics/Heatmap';
import ProgressBar from '../components/ui/ProgressBar';
import AddHabitModal from '../components/habits/AddHabitModal';
import { pageTransition } from '../animations/variants';
import { format, subDays } from 'date-fns';

export default function HabitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [weeks, setWeeks] = useState(13);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [habitRes, analyticsRes, logsRes] = await Promise.all([
        habitsAPI.get(id),
        analyticsAPI.getHabit(id, { weeks }),
        logsAPI.getAll({ habitId: id, limit: 30 })
      ]);
      setHabit(habitRes.data.habit);
      setAnalytics(analyticsRes.data.analytics);
      setRecentLogs(logsRes.data.logs);
    } catch (err) {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id, weeks]);

  if (loading) return (
    <div className="p-8">
      <div className="space-y-4">
        <div className="h-8 w-48 shimmer-bg rounded-xl" />
        <div className="h-64 shimmer-bg rounded-2xl" />
      </div>
    </div>
  );

  if (!habit) return null;

  const stats = [
    { label: 'Current Streak', value: `${analytics?.currentStreak ?? 0}`, unit: 'days', icon: Flame, color: '#f97316' },
    { label: 'Longest Streak', value: `${analytics?.longestStreak ?? 0}`, unit: 'days', icon: Award, color: '#eab308' },
    { label: 'Completion Rate', value: `${analytics?.completionRate ?? 0}`, unit: '%', icon: Target, color: habit.color },
    { label: 'Strength Score', value: `${analytics?.strengthScore ?? 0}`, unit: '/100', icon: TrendingUp, color: '#22c55e' },
    { label: 'Total Completed', value: `${analytics?.totalCompleted ?? 0}`, unit: 'times', icon: Award, color: '#06b6d4' },
    { label: 'Avg Intensity', value: `${analytics?.avgIntensity ?? 0}`, unit: '/4', icon: TrendingUp, color: '#8b5cf6' },
  ];

  return (
    <motion.div {...pageTransition} className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: habit.color + '20', border: `1px solid ${habit.color}40` }}
        >
          {habit.icon}
        </div>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl text-white">{habit.name}</h1>
          <p className="text-white/40 text-sm">{habit.description || habit.category}</p>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <Edit2 size={13} /> Edit
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map(stat => (
          <motion.div key={stat.label} className="card" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={13} style={{ color: stat.color }} />
              <span className="text-xs text-white/30 font-display uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="font-display font-bold text-2xl" style={{ color: stat.color }}>
              {stat.value}<span className="text-sm text-white/30 font-normal ml-0.5">{stat.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Strength score bar */}
      <div className="card mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-display text-white/70">Habit Strength</span>
          <span className="text-sm font-mono text-accent">{analytics?.strengthScore ?? 0}/100</span>
        </div>
        <ProgressBar value={analytics?.strengthScore ?? 0} max={100} color={habit.color} height="h-2.5" />
        <p className="text-xs text-white/25 mt-1.5">Based on completion rate, streaks, and consistency</p>
      </div>

      {/* Heatmap */}
      <div className="card mb-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-white">Activity Heatmap</h2>
          <div className="flex gap-1.5">
            {[13, 26, 52].map(w => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                className={`text-xs px-2.5 py-1 rounded-lg font-mono transition-colors ${weeks === w ? 'bg-accent/20 text-accent' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
              >
                {w}w
              </button>
            ))}
          </div>
        </div>
        <Heatmap data={analytics?.heatmapData || {}} color={habit.color} weeks={weeks} />
      </div>

      {/* Recent logs */}
      <div className="card">
        <h2 className="font-display font-semibold text-white mb-4">Recent Activity</h2>
        {recentLogs.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-6">No logs yet. Start tracking today!</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map(log => (
              <div key={log._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: log.status === 'completed' ? habit.color : log.status === 'skipped' ? '#eab308' : '#ef4444' }}
                  />
                  <span className="text-sm text-white/60 font-mono">{log.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    log.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    log.status === 'skipped' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {log.status}
                  </span>
                  {log.status === 'completed' && (
                    <div className="flex gap-0.5">
                      {[0,1,2,3,4].map(i => (
                        <div key={i} className="w-1 h-3 rounded-full" style={{ background: i <= log.intensity ? habit.color : 'rgba(255,255,255,0.08)' }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editOpen && (
        <AddHabitModal
          editHabit={habit}
          onClose={() => setEditOpen(false)}
          onSuccess={() => { fetchData(); setEditOpen(false); }}
        />
      )}
    </motion.div>
  );
}
