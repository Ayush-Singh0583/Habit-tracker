const express = require('express');
const router = express.Router();
const { exportData, importData } = require('../controllers/exportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', exportData);
router.post('/import', importData);

module.exports = router;
