# Habitual — Production-Grade Habit Tracker

A modern, full-stack MERN habit tracking SaaS application with glassmorphism UI, Framer Motion animations, Chart.js analytics, and JWT authentication.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Chart.js
- **Auth**: JWT access + refresh token pattern, bcrypt password hashing

---

## Project Structure

```
habit-tracker/
├── backend/
│   ├── controllers/      # Business logic
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── utils/             # Helpers (tokens, streaks)
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── animations/    # Framer Motion variants
    │   ├── components/    # Reusable UI components
    │   │   ├── analytics/ # Heatmap
    │   │   ├── habits/    # HabitCard, AddHabitModal
    │   │   ├── layout/    # Sidebar layout
    │   │   └── ui/        # Modal, StatCard, ProgressBar, Skeleton
    │   ├── context/       # AuthContext, HabitsContext
    │   ├── pages/         # Dashboard, Analytics, HabitDetail, Settings
    │   ├── services/      # Axios API client
    │   └── utils/         # Confetti
    └── package.json
```

---

## Setup Instructions

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
```

**`.env` configuration:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/habittracker
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_change_in_production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
# Start the backend
npm run dev      # Development (with nodemon)
npm start        # Production
```

Backend runs on `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start the frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/profile` | Update profile |

### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | List all habits |
| POST | `/api/habits` | Create a habit |
| GET | `/api/habits/:id` | Get single habit |
| PATCH | `/api/habits/:id` | Update habit |
| DELETE | `/api/habits/:id` | Archive habit |

### Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/logs` | Get logs (filterable) |
| POST | `/api/logs` | Log/update a habit check-in |
| GET | `/api/logs/today` | Get today's logs |
| DELETE | `/api/logs/:id` | Delete a log |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Dashboard overview stats |
| GET | `/api/analytics/all` | All habits summary analytics |
| GET | `/api/analytics/habit/:id` | Per-habit analytics + heatmap |

### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders` | List reminders |
| POST | `/api/reminders` | Create reminder |
| PATCH | `/api/reminders/:id` | Update reminder |
| DELETE | `/api/reminders/:id` | Delete reminder |

### Export/Import
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export?format=json` | Export all data as JSON |
| GET | `/api/export?format=csv` | Export logs as CSV |
| POST | `/api/export/import` | Import habits JSON |

---

## MongoDB Schemas

### User
```js
{ name, email, password(hashed), theme, accentColor, timezone, achievements[], onboardingComplete }
```

### Habit
```js
{ user, name, description, frequency(daily/weekly), targetDays[], goalTarget, intensity(0-4), color, icon, category, difficulty, isArchived, order }
```

### Log
```js
{ habit, user, date('YYYY-MM-DD'), status(completed/skipped/partial), intensity(0-4), value, notes, mood(1-5) }
```
> Compound unique index on `{ habit, date }` prevents duplicate logs per day.

### Reminder
```js
{ user, habit, time('HH:MM'), days[], isEnabled, message }
```

---

## Key Features

- **JWT Auth** with access + refresh token rotation
- **Streak algorithm** — current & longest streaks, handles gaps
- **Habit Strength Score** — compound metric (completion rate 40% + current streak 30% + longest streak 20% + consistency 10%)
- **GitHub-style Heatmap** — 13/26/52 week modes, intensity-based color
- **Framer Motion** page transitions, card animations, modal animations
- **Confetti** celebration when all habits are completed
- **Skeleton loaders** for async states
- **Glassmorphism** dark UI with custom CSS utilities
- **Achievement system** — streak milestones (3, 7, 30, 100 days)
- **Export** — JSON and CSV data export
- **Browser Notifications** — permission-aware reminder system

---

## Production Deployment

### Environment Variables (Production)
```
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=<strong-random-64-char-string>
JWT_REFRESH_SECRET=<different-strong-random-64-char-string>
FRONTEND_URL=https://yourdomain.com
```

### Build Frontend
```bash
cd frontend
npm run build
# Serve dist/ folder with a static server or CDN
```

### Serve with nginx (example)
```nginx
server {
    listen 80;
    root /path/to/frontend/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /api { proxy_pass http://localhost:5000; }
}
```
