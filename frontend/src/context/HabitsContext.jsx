import { createContext, useContext, useState, useCallback } from 'react';
import { habitsAPI, logsAPI } from '../services/api';

const HabitsContext = createContext(null);

export const HabitsProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    try {
      const [habitsRes, logsRes] = await Promise.all([
        habitsAPI.getAll(),
        logsAPI.getToday()
      ]);
      setHabits(habitsRes.data.habits);
      setTodayLogs(logsRes.data.logs);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createHabit = useCallback(async (data) => {
    const { data: res } = await habitsAPI.create(data);
    setHabits(prev => [...prev, res.habit]);
    return res.habit;
  }, []);

  const updateHabit = useCallback(async (id, data) => {
    const { data: res } = await habitsAPI.update(id, data);
    setHabits(prev => prev.map(h => h._id === id ? res.habit : h));
    return res.habit;
  }, []);

  const deleteHabit = useCallback(async (id) => {
    await habitsAPI.delete(id);
    setHabits(prev => prev.filter(h => h._id !== id));
  }, []);

  const logHabit = useCallback(async (habitId, date, status, extra = {}) => {
    const { data: res } = await logsAPI.save({ habitId, date, status, ...extra });
    setTodayLogs(prev => {
      const existing = prev.findIndex(l => l.habit?._id === habitId || l.habit === habitId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = res.log;
        return updated;
      }
      return [...prev, res.log];
    });
    return res.log;
  }, []);

  const getTodayLog = useCallback((habitId) => {
    return todayLogs.find(l => {
      const logHabitId = l.habit?._id || l.habit;
      return logHabitId === habitId || logHabitId?.toString() === habitId?.toString();
    });
  }, [todayLogs]);

  return (
    <HabitsContext.Provider value={{
      habits, todayLogs, loading,
      fetchHabits, createHabit, updateHabit, deleteHabit, logHabit, getTodayLog
    }}>
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = () => {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
};
