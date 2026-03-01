import { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '../ui/Modal';
import { useHabits } from '../../context/HabitsContext';

const ICONS = ['⭐', '💪', '🧠', '🏃', '📚', '🧘', '💧', '🍎', '💤', '✍️', '🎯', '🌱', '🎵', '💰', '🤝'];
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#0ea5e9', '#14b8a6'];
const CATEGORIES = ['health', 'fitness', 'learning', 'mindfulness', 'productivity', 'social', 'creativity', 'finance', 'other'];

export default function AddHabitModal({ onClose, onSuccess, editHabit }) {
  const { createHabit, updateHabit } = useHabits();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    name: editHabit?.name || '',
    description: editHabit?.description || '',
    frequency: editHabit?.frequency || 'daily',
    goalTarget: editHabit?.goalTarget || 1,
    intensity: editHabit?.intensity || 2,
    color: editHabit?.color || '#6366f1',
    icon: editHabit?.icon || '⭐',
    category: editHabit?.category || 'other',
    difficulty: editHabit?.difficulty || 'medium'
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Habit name is required'); return; }
    setLoading(true);
    setError('');
   try {
      if (editHabit) {
        await updateHabit(editHabit._id, form);
      } else {
        await createHabit(form);
      }

      onSuccess?.();  // update list if needed
      onClose();      // ✅ THIS closes the modal

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <Modal onClose={onClose} title={editHabit ? 'Edit Habit' : 'Create New Habit'}>
      <div className="p-6 space-y-5">
        {/* Icon + Name */}
        <div className="flex gap-3">
          <div className="relative">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl cursor-pointer hover:scale-105 transition-transform"
              style={{ background: form.color + '25', border: `1px solid ${form.color}40` }}
            >
              {form.icon}
            </div>
          </div>
          <div className="flex-1">
            <label className="label">Habit Name</label>
            <input
              className="input"
              placeholder="e.g. Morning run, Read 30 mins..."
              value={form.name}
              onChange={e => set('name', e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Icon picker */}
        <div>
          <label className="label">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(icon => (
              <button
                key={icon}
                onClick={() => set('icon', icon)}
                className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                  form.icon === icon ? 'bg-accent/20 scale-110 ring-1 ring-accent/50' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <label className="label">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => set('color', color)}
                className={`w-7 h-7 rounded-lg transition-all ${form.color === color ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'}`}
                style={{ background: color }}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description (optional)</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="What's this habit about?"
            value={form.description}
            onChange={e => set('description', e.target.value)}
          />
        </div>

        {/* Frequency + Category row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Frequency</label>
            <select className="input" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Difficulty + Intensity row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Difficulty</label>
            <select className="input" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="label">Default Intensity (0–4)</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min="0" max="4" step="1"
                value={form.intensity}
                onChange={e => set('intensity', parseInt(e.target.value))}
                className="flex-1 accent-indigo-500"
              />
              <span className="font-mono text-sm text-accent w-4">{form.intensity}</span>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
          <motion.button
            className="btn-primary flex-1"
            onClick={handleSubmit}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? 'Saving...' : editHabit ? 'Update Habit' : 'Create Habit'}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
