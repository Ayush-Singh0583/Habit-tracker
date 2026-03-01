const Habit = require('../models/Habit');
const Log = require('../models/Log');

/* ================= GET ALL HABITS ================= */

const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({
      user: req.user._id,
      isArchived: false
    }).sort('order');

    res.json({ habits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching habits' });
  }
};

/* ================= CREATE HABIT ================= */

const createHabit = async (req, res) => {
  try {
    const {
      name,
      description,
      frequency,
      targetDays,
      goalTarget,
      intensity,
      color,
      icon,
      category,
      difficulty
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Habit name is required'
      });
    }

    const normalizedName = name.trim().toLowerCase();

    // Check duplicate (only active habits)
    const existingHabit = await Habit.findOne({
      user: req.user._id,
      name: normalizedName,
      isArchived: false
    });

    if (existingHabit) {
      return res.status(400).json({
        message: 'Habit already exists'
      });
    }

    const count = await Habit.countDocuments({
      user: req.user._id,
      isArchived: false
    });

    const habit = await Habit.create({
      user: req.user._id,
      name: normalizedName,
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

    // Handle unique index error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Habit already exists'
      });
    }

    res.status(500).json({
      message: 'Error creating habit'
    });
  }
};

/* ================= UPDATE HABIT ================= */

const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!habit) {
      return res.status(404).json({
        message: 'Habit not found'
      });
    }

    const allowedFields = [
      'name',
      'description',
      'frequency',
      'targetDays',
      'goalTarget',
      'intensity',
      'color',
      'icon',
      'category',
      'difficulty',
      'order'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'name') {
          habit.name = req.body.name.trim().toLowerCase();
        } else {
          habit[field] = req.body[field];
        }
      }
    });

    await habit.save();

    res.json({ habit });

  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Habit with this name already exists'
      });
    }

    res.status(500).json({
      message: 'Error updating habit'
    });
  }
};

/* ================= ARCHIVE HABIT ================= */

const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!habit) {
      return res.status(404).json({
        message: 'Habit not found'
      });
    }

    habit.isArchived = true;
    await habit.save();

    res.json({
      message: 'Habit archived successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error deleting habit'
    });
  }
};

/* ================= GET SINGLE HABIT ================= */

const getHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!habit) {
      return res.status(404).json({
        message: 'Habit not found'
      });
    }

    res.json({ habit });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error fetching habit'
    });
  }
};

module.exports = {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  getHabit
};