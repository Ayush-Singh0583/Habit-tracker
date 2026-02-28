const Reminder = require('../models/Reminder');

const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).populate('habit', 'name icon');
    res.json({ reminders });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reminders' });
  }
};

const createReminder = async (req, res) => {
  try {
    const { habitId, time, days, message } = req.body;
    const reminder = await Reminder.create({
      user: req.user._id,
      habit: habitId,
      time,
      days,
      message
    });
    res.status(201).json({ reminder });
  } catch (error) {
    res.status(500).json({ message: 'Error creating reminder' });
  }
};

const updateReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json({ reminder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating reminder' });
  }
};

const deleteReminder = async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting reminder' });
  }
};

module.exports = { getReminders, createReminder, updateReminder, deleteReminder };
