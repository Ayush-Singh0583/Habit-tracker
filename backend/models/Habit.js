const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  targetDays: {
    type: [Number], // 0=Sun, 1=Mon, ..., 6=Sat (for weekly)
    default: [0, 1, 2, 3, 4, 5, 6]
  },
  goalTarget: {
    type: Number,
    default: 1,
    min: 1
  },
  intensity: {
    type: Number,
    min: 0,
    max: 4,
    default: 2
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  icon: {
    type: String,
    default: '⭐'
  },
  category: {
    type: String,
    enum: ['health', 'fitness', 'learning', 'mindfulness', 'productivity', 'social', 'creativity', 'finance', 'other'],
    default: 'other'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

habitSchema.index({ user: 1, isArchived: 1 });
habitSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Habit', habitSchema);
