import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, CheckCircle, Target, TrendingUp, Plus } from 'lucide-react';
import { useHabits } from '../context/HabitsContext';
import { analyticsAPI } from '../services/api';
import { pageTransition, staggerContainer } from '../animations/variants';
import HabitCard from '../components/habits/HabitCard';
import StatCard from '../components/ui/StatCard';
import MotivationalQuote from '../components/ui/MotivationalQuote';
import ProgressBar from '../components/ui/ProgressBar';
import AddHabitModal from '../components/habits/AddHabitModal';
import { SkeletonCard } from '../components/ui/Skeleton';
import { format } from 'date-fns';
import { fireStreakConfetti } from '../utils/confetti';

export default function Dashboard() {
  const {
    habits,
    loading,
    fetchHabits,
    logHabit,
    getTodayLog,
    deleteHabit
  } = useHabits();

  const [overview, setOverview] = useState(null);
  const [editHabit, setEditHabit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [prevCompletedToday, setPrevCompletedToday] = useState(0);

  /* -------------------------------
     Load habits + overview
  --------------------------------*/
  const loadDashboard = useCallback(async () => {
    try {
      await fetchHabits();
      const { data } = await analyticsAPI.getOverview();
      setOverview(data.overview);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  }, [fetchHabits]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* -------------------------------
     Completion Logic
  --------------------------------*/
  const today = format(new Date(), 'yyyy-MM-dd');

  const completedCount = habits.filter(
    h => getTodayLog(h._id)?.status === 'completed'
  ).length;

  const completionPct =
    habits.length > 0
      ? Math.round((completedCount / habits.length) * 100)
      : 0;

  /* Fire confetti when all habits done */
  useEffect(() => {
    if (
      completedCount > prevCompletedToday &&
      completedCount === habits.length &&
      habits.length > 0
    ) {
      fireStreakConfetti();
    }
    setPrevCompletedToday(completedCount);
  }, [completedCount, habits.length, prevCompletedToday]);

  /* -------------------------------
     Delete Handler
  --------------------------------*/
  const handleDelete = async (id) => {
    await deleteHabit(id);
    await loadDashboard(); // 🔥 ensures UI stays synced
  };

  /* -------------------------------
     Render
  --------------------------------*/
  return (
    <motion.div {...pageTransition} className="p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">
            {getGreeting()}
          </h1>
          <p className="text-white/40 text-sm">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={15} />
          New Habit
        </motion.button>
      </div>

      {/* Daily Progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/40 text-xs font-display uppercase tracking-wider mb-0.5">
              Today's Progress
            </p>
            <p className="font-display font-bold text-xl">
              {completedCount} / {habits.length} habits
            </p>
          </div>
          <div className="text-3xl font-display font-bold text-gradient">
            {completionPct}%
          </div>
        </div>

        <ProgressBar
          value={completedCount}
          max={Math.max(habits.length, 1)}
          color="#818cf8"
          height="h-2"
        />

        {completedCount === habits.length && habits.length > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-400 text-sm mt-2 font-display"
          >
            🎉 All habits complete for today!
          </motion.p>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <StatCard label="Total Habits" value={habits.length} icon={Target} color="#818cf8" />
        <StatCard label="Done Today" value={completedCount} icon={CheckCircle} color="#22c55e" />
        <StatCard
          label="Best Streak"
          value={overview ? `${overview.bestStreak}d` : '—'}
          icon={Flame}
          color="#f97316"
        />
        <StatCard
          label="This Month"
          value={overview ? `${overview.completionRate}%` : '—'}
          icon={TrendingUp}
          color="#06b6d4"
          sub="completion rate"
        />
      </motion.div>

      {/* Quote */}
      <div className="mb-6">
        <MotivationalQuote />
      </div>

      {/* Habit List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-white">
            Today's Habits
          </h2>
          <span className="text-xs text-white/30 font-mono">
            {format(new Date(), 'MMM d')}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : habits.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="font-display font-semibold text-white mb-1">
              No habits yet
            </h3>
            <p className="text-white/40 text-sm mb-4">
              Start building your first habit today
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              <Plus size={14} />
              Create a Habit
            </button>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {habits.map(habit => (
                <HabitCard
                  key={habit._id}
                  habit={habit}
                  log={getTodayLog(habit._id)}
                  onLog={logHabit}
                  onEdit={setEditHabit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddHabitModal
          onClose={() => setShowAddModal(false)}
          onSuccess={loadDashboard}
        />
      )}

      {editHabit && (
        <AddHabitModal
          editHabit={editHabit}
          onClose={() => setEditHabit(null)}
          onSuccess={loadDashboard}
        />
      )}
    </motion.div>
  );
}

/* Greeting */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 🌅';
  if (hour < 17) return 'Good afternoon ☀️';
  return 'Good evening 🌙';
}