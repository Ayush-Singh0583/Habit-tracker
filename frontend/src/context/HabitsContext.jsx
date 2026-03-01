import { createContext, useContext, useState, useCallback, useRef } from "react";
import { habitsAPI, logsAPI } from "../services/api";

const HabitsContext = createContext(null);

export const HabitsProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Track latest request per habit
  const logVersions = useRef(new Map());

  /* ================= FETCH ================= */

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    try {
      const [habitsRes, logsRes] = await Promise.all([
        habitsAPI.getAll(),
        logsAPI.getToday(),
      ]);

      setHabits(habitsRes.data.habits);
      setTodayLogs(logsRes.data.logs);
    } catch (err) {
      console.error("Error fetching habits:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= CREATE ================= */

  const createHabit = useCallback(async (data) => {
    const { data: res } = await habitsAPI.create(data);
    setHabits((prev) => [...prev, res.habit]);
    return res.habit;
  }, []);

  /* ================= UPDATE ================= */

  const updateHabit = useCallback(async (id, data) => {
    const { data: res } = await habitsAPI.update(id, data);
    setHabits((prev) =>
      prev.map((h) => (h._id === id ? res.habit : h))
    );
    return res.habit;
  }, []);

  /* ================= DELETE ================= */

  const deleteHabit = useCallback(async (id) => {
    await habitsAPI.delete(id);
    setHabits((prev) => prev.filter((h) => h._id !== id));
  }, []);

  /* ================= PRODUCTION-GRADE LOGGING ================= */

  const logHabit = useCallback(
    async (habitId, date, status, extra = {}) => {
      const version =
        (logVersions.current.get(habitId) || 0) + 1;

      logVersions.current.set(habitId, version);

      const optimisticLog = {
        _id: `temp-${habitId}`,
        habit: habitId,
        date,
        status,
        ...extra,
      };

      // 🔥 Instant optimistic update
      setTodayLogs((prev) => {
        const index = prev.findIndex((l) => {
          const id = l.habit?._id || l.habit;
          return id?.toString() === habitId?.toString();
        });

        if (index >= 0) {
          const updated = [...prev];
          updated[index] = optimisticLog;
          return updated;
        }

        return [...prev, optimisticLog];
      });

      try {
        const { data: res } = await logsAPI.save({
          habitId,
          date,
          status,
          ...extra,
        });

        // 🧠 Ignore outdated responses
        if (logVersions.current.get(habitId) !== version)
          return;

        setTodayLogs((prev) => {
          const index = prev.findIndex((l) => {
            const id = l.habit?._id || l.habit;
            return id?.toString() === habitId?.toString();
          });

          if (index >= 0) {
            const updated = [...prev];
            updated[index] = res.log;
            return updated;
          }

          return prev;
        });

        return res.log;
      } catch (error) {
        console.error("Log failed:", error);

        // rollback only if latest
        if (logVersions.current.get(habitId) !== version)
          return;

        setTodayLogs((prev) =>
          prev.filter(
            (l) =>
              (l.habit?._id || l.habit)?.toString() !==
              habitId?.toString()
          )
        );
      }
    },
    []
  );

  /* ================= GET TODAY LOG ================= */

  const getTodayLog = useCallback(
    (habitId) => {
      return todayLogs.find((l) => {
        const id = l.habit?._id || l.habit;
        return id?.toString() === habitId?.toString();
      });
    },
    [todayLogs]
  );

  return (
    <HabitsContext.Provider
      value={{
        habits,
        todayLogs,
        loading,
        fetchHabits,
        createHabit,
        updateHabit,
        deleteHabit,
        logHabit,
        getTodayLog,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
};

export const useHabits = () => {
  const ctx = useContext(HabitsContext);
  if (!ctx)
    throw new Error("useHabits must be used within HabitsProvider");
  return ctx;
};