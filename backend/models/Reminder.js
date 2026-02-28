const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  time: {
    type: String, // 'HH:MM' format
    required: true
  },
  days: {
    type: [Number], // 0=Sun, 1=Mon, ..., 6=Sat
    default: [0, 1, 2, 3, 4, 5, 6]
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    default: 'Time to build your habit! 💪'
  }
}, {
  timestamps: true
});

reminderSchema.index({ user: 1, habit: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
