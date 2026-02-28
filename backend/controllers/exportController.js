const Habit = require('../models/Habit');
const Log = require('../models/Log');
const Reminder = require('../models/Reminder');
const ExcelJS = require('exceljs');

/* =========================
   EXPORT DATA
========================= */

const exportData = async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    /* -------------------------
       JSON EXPORT
    -------------------------- */
    if (format === 'json') {
      const habits = await Habit.find({ user: req.user._id }).lean();
      const logs = await Log.find({ user: req.user._id }).lean();
      const reminders = await Reminder.find({ user: req.user._id }).lean();

      const data = {
        exportedAt: new Date().toISOString(),
        user: {
          name: req.user.name,
          email: req.user.email
        },
        habits,
        logs,
        reminders
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=habit-tracker-data.json'
      );

      return res.json(data);
    }

    /* -------------------------
       XLSX EXPORT (Professional)
    -------------------------- */

    const logs = await Log.find({ user: req.user._id })
      .populate('habit', 'name category frequency')
      .lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Habit Logs');

    // Define columns
    worksheet.columns = [
      { header: 'Habit Name', key: 'habitName', width: 20 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Frequency', key: 'frequency', width: 12 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Intensity', key: 'intensity', width: 10 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Mood', key: 'mood', width: 10 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add rows
    logs.forEach(l => {
      worksheet.addRow({
        habitName: l.habit?.name || 'Deleted Habit',
        category: l.habit?.category || '',
        frequency: l.habit?.frequency || '',
        date: new Date(l.date),
        status: l.status,
        intensity: l.intensity,
        notes: l.notes || '',
        mood: l.mood || ''
      });
    });

    // Format date column properly
    worksheet.getColumn('date').numFmt = 'dd-mm-yyyy';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=habit-tracker-logs.xlsx'
    );

    await workbook.xlsx.write(res);
    return res.end();

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Error exporting data' });
  }
};


/* =========================
   IMPORT DATA
========================= */

const importData = async (req, res) => {
  try {
    const { habits: importHabits } = req.body;

    if (!Array.isArray(importHabits)) {
      return res.status(400).json({
        message: 'Invalid import data: habits must be an array'
      });
    }

    let habitsCreated = 0;

    for (const habitData of importHabits) {
      if (!habitData.name) continue;

      await Habit.create({
        user: req.user._id,
        name: habitData.name,
        description: habitData.description || '',
        frequency: habitData.frequency || 'daily',
        color: habitData.color || '#6366f1',
        icon: habitData.icon || '⭐',
        category: habitData.category || 'other'
      });

      habitsCreated++;
    }

    res.json({
      message: 'Import successful',
      habitsCreated
    });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Error importing data' });
  }
};

module.exports = { exportData, importData };