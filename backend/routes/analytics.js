const express = require('express');
const router = express.Router();
const { getOverview, getHabitAnalytics, getAllAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/overview', getOverview);
router.get('/all', getAllAnalytics);
router.get('/habit/:habitId', getHabitAnalytics);

module.exports = router;
