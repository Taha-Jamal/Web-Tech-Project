const mongoose = require('mongoose');

const WeeklyHoursSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weekStart: {
    type: Date,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
});

const WeeklyHours = mongoose.model('WeeklyHours', WeeklyHoursSchema);

module.exports = WeeklyHours;
