const express = require('express');
const router = express.Router();
const { getLogs, createOrUpdateLog, deleteLog, getTodayLogs } = require('../controllers/logController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getLogs);
router.post('/', createOrUpdateLog);
router.get('/today', getTodayLogs);
router.delete('/:id', deleteLog);

module.exports = router;
