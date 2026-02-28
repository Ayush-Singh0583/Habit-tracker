/**
 * Calculate current and longest streaks from sorted log dates
 * @param {string[]} completedDates - Array of 'YYYY-MM-DD' strings (sorted ascending)
 * @returns {{ currentStreak: number, longestStreak: number }}
 */
const calculateStreaks = (completedDates) => {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const uniqueDates = [...new Set(completedDates)].sort();
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Calculate longest streak
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]);
    const curr = new Date(uniqueDates[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    
    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate current streak (from today backwards)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = new Date(today - 86400000).toISOString().split('T')[0];

  const lastDate = uniqueDates[uniqueDates.length - 1];
  
  if (lastDate !== todayStr && lastDate !== yesterdayStr) {
    return { currentStreak: 0, longestStreak };
  }

  currentStreak = 1;
  for (let i = uniqueDates.length - 2; i >= 0; i--) {
    const curr = new Date(uniqueDates[i + 1]);
    const prev = new Date(uniqueDates[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
    
    if (diff === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
};

/**
 * Calculate habit strength score (0-100)
 */
const calculateStrengthScore = (completionRate, currentStreak, longestStreak, totalLogs) => {
  const rateScore = completionRate * 40;         // 40% weight
  const streakScore = Math.min(currentStreak / 30, 1) * 30; // 30% weight
  const longestScore = Math.min(longestStreak / 60, 1) * 20; // 20% weight
  const consistencyScore = Math.min(totalLogs / 90, 1) * 10; // 10% weight
  
  return Math.round(rateScore + streakScore + longestScore + consistencyScore);
};

module.exports = { calculateStreaks, calculateStrengthScore };
