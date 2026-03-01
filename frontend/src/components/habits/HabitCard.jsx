import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MoreHorizontal, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cardVariants, checkmarkVariants } from '../../animations/variants';
import { fireCompletionGlow } from '../../utils/confetti';
import { format } from 'date-fns';
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";

export default function HabitCard({ habit, log, onLog, onEdit, onDelete }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  /* ================= LOCAL OPTIMISTIC STATE ================= */

  const [localStatus, setLocalStatus] = useState(log?.status || null);

  // keep local state synced if backend updates externally
  useEffect(() => {
    setLocalStatus(log?.status || null);
  }, [log?.status]);

  const isCompleted = localStatus === 'completed';
  const isSkipped = localStatus === 'skipped';

  /* ================= VERSION CONTROL ================= */

  const versionRef = useRef(0);

  const handleComplete = () => {
    const nextStatus = isCompleted ? 'skipped' : 'completed';

    // 🔥 instant UI update
    setLocalStatus(nextStatus);

    if (nextStatus === 'completed') {
      fireCompletionGlow();
    }

    // increase version
    const currentVersion = ++versionRef.current;

    // fire backend without blocking UI
    onLog(
      habit._id,
      today,
      nextStatus,
      { intensity: habit.intensity }
    ).then(() => {
      // only apply if this is latest click
      if (versionRef.current !== currentVersion) return;
    }).catch(() => {
      // rollback only if this is latest request
      if (versionRef.current !== currentVersion) return;
      setLocalStatus(log?.status || null);
    });
  };

  return (
    <>
      <motion.div
        layout
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit={{
          opacity: 0,
          height: 0,
          marginBottom: 0,
          transition: { duration: 0.25 }
        }}
        whileHover={{
          y: -3,
          boxShadow: "0 12px 30px rgba(0,0,0,0.25)"
        }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={`card relative overflow-visible cursor-pointer group ${
          menuOpen ? 'z-50' : 'z-0'
        }`}
        style={{
          borderColor: isCompleted
            ? habit.color + '40'
            : 'rgba(255,255,255,0.9)'
        }}
      >
        {/* Accent Bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full transition-opacity duration-300"
          style={{
            background: habit.color,
            opacity: isCompleted ? 1 : 0.3
          }}
        />

        {/* Completion Glow */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0.2 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at center, ${habit.color}0a 0%, transparent 70%)`
              }}
            />
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4 pl-3 py-3">

          {/* Complete Button */}
          <motion.button
            onClick={handleComplete}
            variants={checkmarkVariants}
            animate={isCompleted ? 'checked' : 'unchecked'}
            whileTap={{ scale: 0.9 }}
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
              isCompleted
                ? 'border-transparent text-white'
                : 'border-white/20 hover:border-white/50 text-transparent'
            }`}
            style={
              isCompleted
                ? {
                    background: habit.color,
                    boxShadow: `0 0 14px ${habit.color}40`
                  }
                : {}
            }
          >
            <Check size={16} strokeWidth={3} />
          </motion.button>

          {/* Habit Info */}
          <div
            className="flex-1 min-w-0"
            onClick={() => navigate(`/habit/${habit._id}`)}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-base">{habit.icon}</span>
              <h3
                className={`font-display font-semibold text-sm truncate transition-colors ${
                  isCompleted
                    ? 'text-white/50 line-through'
                    : 'text-white'
                }`}
              >
                {habit.name}
              </h3>
            </div>

            {habit.description && (
              <p className="text-xs text-white/30 truncate">
                {habit.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${
                  isCompleted
                    ? 'bg-green-500/10 text-green-400'
                    : isSkipped
                    ? 'bg-yellow-500/10 text-yellow-400'
                    : 'bg-white/5 text-white/30'
                }`}
              >
                {isCompleted
                  ? 'Done'
                  : isSkipped
                  ? 'Skipped'
                  : habit.frequency}
              </span>

              <span className="text-xs text-white/20">
                {habit.category}
              </span>
            </div>
          </div>

          {/* Menu */}
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
            >
              <MoreHorizontal size={14} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 glass rounded-xl py-1 min-w-[140px] z-[100]"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/habit/${habit._id}`);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 w-full"
                  >
                    <TrendingUp size={13} /> Analytics
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(habit);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 w-full"
                  >
                    <Edit2 size={13} /> Edit
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      setDeleteOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <ConfirmDeleteModal
        open={deleteOpen}
        habitName={habit.name}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDelete(habit._id);
          setDeleteOpen(false);
        }}
      />
    </>
  );
}