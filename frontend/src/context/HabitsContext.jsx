import { createContext, useContext, useState, useCallback } from 'react';
import { habitsAPI, logsAPI } from '../services/api';

const HabitsContext = createContext(null);

export const HabitsProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */

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

  /* ================= CREATE ================= */

  const createHabit = useCallback(async (data) => {
    const { data: res } = await habitsAPI.create(data);
    setHabits(prev => [...prev, res.habit]);
    return res.habit;
  }, []);

  /* ================= UPDATE ================= */

  const updateHabit = useCallback(async (id, data) => {
    const { data: res } = await habitsAPI.update(id, data);
    setHabits(prev =>
      prev.map(h => h._id === id ? res.habit : h)
    );
    return res.habit;
  }, []);

  /* ================= DELETE ================= */

  const deleteHabit = useCallback(async (id) => {
    await habitsAPI.delete(id);
    setHabits(prev => prev.filter(h => h._id !== id));
  }, []);

  /* ================= OPTIMISTIC LOG ================= */

  const logHabit = useCallback(async (habitId, date, status, extra = {}) => {

    // 🔥 Create optimistic log
    const optimisticLog = {
      _id: `temp-${habitId}-${Date.now()}`,
      habit: habitId,
      date,
      status,
      ...extra
    };

    // 1️⃣ Instant UI update
    setTodayLogs(prev => {
      const existingIndex = prev.findIndex(l => {
        const logHabitId = l.habit?._id || l.habit;
        return logHabitId?.toString() === habitId?.toString();
      });

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = optimisticLog;
        return updated;
      }

      return [...prev, optimisticLog];
    });

    try {
      // 2️⃣ Backend call
      const { data: res } = await logsAPI.save({
        habitId,
        date,
        status,
        ...extra
      });

      // 3️⃣ Replace optimistic log with real log
      setTodayLogs(prev =>
        prev.map(l =>
          l._id === optimisticLog._id ? res.log : l
        )
      );

      return res.log;

    } catch (error) {

      // 4️⃣ Rollback on failure
      setTodayLogs(prev =>
        prev.filter(l => l._id !== optimisticLog._id)
      );

      console.error("Log failed:", error);
      throw error;
    }

  }, []);

  /* ================= GET TODAY LOG ================= */

  const getTodayLog = useCallback((habitId) => {
    return todayLogs.find(l => {
      const logHabitId = l.habit?._id || l.habit;
      return logHabitId?.toString() === habitId?.toString();
    });
  }, [todayLogs]);

  return (
    <HabitsContext.Provider value={{
      habits,
      todayLogs,
      loading,
      fetchHabits,
      createHabit,
      updateHabit,
      deleteHabit,
      logHabit,
      getTodayLog
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