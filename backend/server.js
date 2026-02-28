require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const logRoutes = require('./routes/logs');
const analyticsRoutes = require('./routes/analytics');
const reminderRoutes = require('./routes/reminders');
const exportRoutes = require('./routes/export');

const app = express();

/* ================= CORS FIX ================= */

const allowedOrigins = [
  "https://habit-tracker-dusky-beta.vercel.app",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

/* ================= BODY PARSER ================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= ROOT ROUTES ================= */

app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* ================= API ROUTES ================= */

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/export', exportRoutes);

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

/* ================= DB + START ================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });