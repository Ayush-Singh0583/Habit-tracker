const Habit = require('../models/Habit');
const Log = require('../models/Log');

const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id, isArchived: false }).sort('order');
    res.json({ habits });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching habits' });
  }
};

const createHabit = async (req, res) => {
  try {
    const { name, description, frequency, targetDays, goalTarget, intensity, color, icon, category, difficulty } = req.body;

    const count = await Habit.countDocuments({ user: req.user._id, isArchived: false });

    const habit = await Habit.create({
      user: req.user._id,
      name,
      description,
      frequency,
      targetDays,
      goalTarget,
      intensity,
      color,
      icon,
      category,
      difficulty,
      order: count
    });

    res.status(201).json({ habit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating habit' });
  }
};

const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const allowed = ['name', 'description', 'frequency', 'targetDays', 'goalTarget', 'intensity', 'color', 'icon', 'category', 'difficulty', 'order'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) habit[field] = req.body[field];
    });

    await habit.save();
    res.json({ habit });
  } catch (error) {
    res.status(500).json({ message: 'Error updating habit' });
  }
};

const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    habit.isArchived = true;
    await habit.save();

    res.json({ message: 'Habit archived successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting habit' });
  }
};

const getHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ habit });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching habit' });
  }
};

module.exports = { getHabits, createHabit, updateHabit, deleteHabit, getHabit };
