const express = require('express');
const router = express.Router();
const { getHabits, createHabit, updateHabit, deleteHabit, getHabit } = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getHabits);
router.post('/', createHabit);
router.get('/:id', getHabit);
router.patch('/:id', updateHabit);
router.delete('/:id', deleteHabit);

module.exports = router;
