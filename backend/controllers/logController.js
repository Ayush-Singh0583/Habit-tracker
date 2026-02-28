const Log = require('../models/Log');
const Habit = require('../models/Habit');
const User = require('../models/User');

/* =====================================
   Helper: Get Local Date (NOT UTC)
===================================== */
const getLocalDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/* =====================================
   GET LOGS
===================================== */
const getLogs = async (req, res) => {
  try {
    const { habitId, startDate, endDate, limit = 90 } = req.query;

    const filter = { user: req.user._id };

    if (habitId) filter.habit = habitId;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const logs = await Log.find(filter)
      .populate('habit', 'name color icon')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs' });
  }
};

/* =====================================
   CREATE OR UPDATE LOG
===================================== */
const createOrUpdateLog = async (req, res) => {
  try {
    const { habitId, date, status, intensity, value, notes, mood } = req.body;

    const habit = await Habit.findOne({
      _id: habitId,
      user: req.user._id
    });

    if (!habit)
      return res.status(404).json({ message: 'Habit not found' });

    // Always store date exactly as sent from frontend
    const safeDate = date;

    const log = await Log.findOneAndUpdate(
      { habit: habitId, user: req.user._id, date: safeDate },
      {
        habit: habitId,
        user: req.user._id,
        date: safeDate,
        status,
        intensity,
        value,
        notes,
        mood
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    await checkAndGrantAchievements(req.user._id, habitId);

    res.json({ log });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving log' });
  }
};

/* =====================================
   DELETE LOG
===================================== */
const deleteLog = async (req, res) => {
  try {
    const log = await Log.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!log)
      return res.status(404).json({ message: 'Log not found' });

    res.json({ message: 'Log deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting log' });
  }
};

/* =====================================
   GET TODAY LOGS (FIXED)
===================================== */
const getTodayLogs = async (req, res) => {
  try {
    const today = getLocalDateString(); // 🔥 FIXED

    const logs = await Log.find({
      user: req.user._id,
      date: today
    }).populate('habit', 'name color icon');

    res.json({ logs, date: today });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today logs' });
  }
};

/* =====================================
   ACHIEVEMENT CHECKER
===================================== */
const checkAndGrantAchievements = async (userId, habitId) => {
  try {
    const { calculateStreaks } = require('../utils/streaks');

    const completedLogs = await Log.find({
      habit: habitId,
      status: 'completed'
    }).select('date');

    const dates = completedLogs.map(l => l.date).sort();

    const { currentStreak } = calculateStreaks(dates);

    const user = await User.findById(userId);
    const existingIds = user.achievements.map(a => a.id);

    const milestones = [
      { id: 'streak_3', streak: 3, name: '3-Day Streak', icon: '🔥', desc: 'Completed 3 days in a row!' },
      { id: 'streak_7', streak: 7, name: '1-Week Warrior', icon: '⚡', desc: '7-day streak achieved!' },
      { id: 'streak_30', streak: 30, name: 'Monthly Master', icon: '🏆', desc: '30-day streak!' },
      { id: 'streak_100', streak: 100, name: 'Century Club', icon: '💎', desc: '100-day streak!' }
    ];

    const newAchievements = [];

    for (const milestone of milestones) {
      if (
        currentStreak >= milestone.streak &&
        !existingIds.includes(milestone.id)
      ) {
        newAchievements.push({
          id: milestone.id,
          name: milestone.name,
          description: milestone.desc,
          icon: milestone.icon,
          unlockedAt: new Date()
        });
      }
    }

    if (newAchievements.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $push: { achievements: { $each: newAchievements } }
      });
    }
  } catch (err) {
    console.error('Achievement check error:', err);
  }
};

module.exports = {
  getLogs,
  createOrUpdateLog,
  deleteLog,
  getTodayLogs
};