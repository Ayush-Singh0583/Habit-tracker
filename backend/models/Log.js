const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  habit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String, // 'YYYY-MM-DD' format for efficient querying
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['completed', 'skipped', 'partial'],
    required: true
  },
  intensity: {
    type: Number,
    min: 0,
    max: 4,
    default: 0
  },
  value: {
    type: Number,
    default: 1
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  mood: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Compound index for efficient streak calculation and date-based queries
logSchema.index({ habit: 1, date: 1 }, { unique: true });
logSchema.index({ user: 1, date: 1 });
logSchema.index({ habit: 1, status: 1, date: 1 });

module.exports = mongoose.model('Log', logSchema);
