const Log = require('../models/Log');
const Habit = require('../models/Habit');
const { calculateStreaks, calculateStrengthScore } = require('../utils/streaks');

/* =========================
   DATE HELPERS
========================= */

const getTodayString = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.toISOString().split('T')[0];
};

/* =========================
   OVERVIEW (Dashboard)
   Lifetime Based
========================= */

const getOverview = async (req, res) => {
  try {
    const habits = await Habit.find({
      user: req.user._id,
      isArchived: false
    });

    const habitIds = habits.map(h => h._id);
    const todayStr = getTodayString();

    const logs = await Log.find({
      user: req.user._id,
      habit: { $in: habitIds }
    });

    const todayLogs = logs.filter(l => l.date === todayStr);
    const completedToday = todayLogs.filter(l => l.status === 'completed').length;

    const totalCompleted = logs.filter(l => l.status === 'completed').length;

    // Lifetime possible days = number of days since first habit created
    const firstHabitDate =
      habits.length > 0
        ? habits.reduce((min, h) =>
            new Date(h.createdAt) < new Date(min.createdAt) ? h : min
          ).createdAt
        : new Date();

    const totalDays =
      Math.ceil(
        (Date.now() - new Date(firstHabitDate).getTime()) / 86400000
      ) + 1;

    const totalPossible = habits.length * totalDays;

    const completionRate =
      totalPossible > 0
        ? Math.round((totalCompleted / totalPossible) * 100)
        : 0;

    let bestStreak = 0;
    let totalCurrentStreak = 0;

    for (const habit of habits) {
      const habitLogs = logs
        .filter(l => l.habit.toString() === habit._id.toString())
        .filter(l => l.status === 'completed');

      const dates = habitLogs.map(l => l.date).sort();
      const { currentStreak, longestStreak } = calculateStreaks(dates);

      bestStreak = Math.max(bestStreak, longestStreak);
      totalCurrentStreak += currentStreak;
    }

    res.json({
      overview: {
        totalHabits: habits.length,
        completedToday,
        completionRate,
        bestStreak,
        avgCurrentStreak:
          habits.length > 0
            ? Math.round(totalCurrentStreak / habits.length)
            : 0,
        totalCompleted
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching overview' });
  }
};

/* =========================
   SINGLE HABIT ANALYTICS
   Lifetime Based
========================= */

const getHabitAnalytics = async (req, res) => {
  try {
    const { habitId } = req.params;

    const habit = await Habit.findOne({
      _id: habitId,
      user: req.user._id
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const logs = await Log.find({
      habit: habitId,
      user: req.user._id
    }).sort('date');

    const completedLogs = logs.filter(l => l.status === 'completed');
    const completedDates = completedLogs.map(l => l.date);

    const { currentStreak, longestStreak } =
      calculateStreaks(completedDates);

    const totalDays =
      Math.ceil(
        (Date.now() - new Date(habit.createdAt).getTime()) / 86400000
      ) + 1;

    const completionRate =
      totalDays > 0
        ? Math.round((completedLogs.length / totalDays) * 100)
        : 0;

    const strengthScore =
      calculateStrengthScore(
        completionRate / 100,
        currentStreak,
        longestStreak,
        completedLogs.length
      );

    /* ===== Heatmap ===== */

    const heatmapData = {};
    logs.forEach(log => {
      heatmapData[log.date] = {
        status: log.status,
        intensity: log.intensity,
        count: 1
      };
    });

    /* ===== Weekly Trend (Lifetime) ===== */

    const weeklyTrend = [];
    const weeksCount = Math.ceil(totalDays / 7);

    for (let i = weeksCount - 1; i >= 0; i--) {
      const weekStart = new Date(
        new Date(habit.createdAt).getTime() + i * 7 * 86400000
      );

      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      const weekCompleted = completedLogs.filter(
        l => l.date >= weekStartStr && l.date < weekEndStr
      ).length;

      weeklyTrend.push({
        week: weekStartStr,
        completed: weekCompleted,
        rate: Math.round((weekCompleted / 7) * 100)
      });
    }

    /* ===== Monthly Breakdown ===== */

    const monthlyBreakdown = {};
    completedLogs.forEach(log => {
      const month = log.date.substring(0, 7);
      monthlyBreakdown[month] =
        (monthlyBreakdown[month] || 0) + 1;
    });

    res.json({
      analytics: {
        habit,
        currentStreak,
        longestStreak,
        completionRate,
        strengthScore,
        totalCompleted: completedLogs.length,
        heatmapData,
        monthlyBreakdown,
        weeklyTrend,
        avgIntensity:
          completedLogs.length > 0
            ? (
                completedLogs.reduce((s, l) => s + l.intensity, 0) /
                completedLogs.length
              ).toFixed(1)
            : 0
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

/* =========================
   ALL HABITS ANALYTICS
   Lifetime Based
========================= */

const getAllAnalytics = async (req, res) => {
  try {
    const habits = await Habit.find({
      user: req.user._id,
      isArchived: false
    });

    const analyticsData = await Promise.all(
      habits.map(async (habit) => {

        const logs = await Log.find({
          habit: habit._id,
          user: req.user._id,
          status: 'completed'
        }).select('date intensity');

        const dates = logs.map(l => l.date);

        const { currentStreak, longestStreak } =
          calculateStreaks(dates);

        const totalDays =
          Math.ceil(
            (Date.now() - new Date(habit.createdAt).getTime()) / 86400000
          ) + 1;

        const completionRate =
          totalDays > 0
            ? Math.round((dates.length / totalDays) * 100)
            : 0;

        const strengthScore =
          calculateStrengthScore(
            completionRate / 100,
            currentStreak,
            longestStreak,
            dates.length
          );

        return {
          habitId: habit._id,
          name: habit.name,
          color: habit.color,
          icon: habit.icon,
          currentStreak,
          longestStreak,
          completionRate,
          strengthScore,
          totalCompleted: dates.length
        };
      })
    );

    res.json({ analytics: analyticsData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

module.exports = {
  getOverview,
  getHabitAnalytics,
  getAllAnalytics
};