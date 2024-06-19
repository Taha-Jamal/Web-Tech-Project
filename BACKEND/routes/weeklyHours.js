const express = require("express");
const WeeklyHours = require("../models/weeklyHours");
const auth = require("../middleware/auth");

const router = express.Router();

// Utility function to calculate the start of the week
const getWeekStartDate = (date) => {
  const givenDate = new Date(date);
  const day = givenDate.getUTCDay();
  const diff = givenDate.getUTCDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(givenDate.setUTCDate(diff));
};

// Route to add weekly hours for a user
router.post("/", auth, async (req, res) => {
  const { weekStart, hours } = req.body;

  try {
    const weeklyHours = new WeeklyHours({
      user: req.user._id,
      weekStart,
      hours,
    });

    await weeklyHours.save();

    res.status(201).json(weeklyHours);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get all weekly hours for the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const weeklyHours = await WeeklyHours.find({ user: userId });

    if (!weeklyHours) {
      return res
        .status(404)
        .json({ message: "No weekly hours found for the user" });
    }

    res.json(weeklyHours);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get weekly hours for a specific date
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const weeklyHours = await WeeklyHours.find({ user: userId });

    if (!weeklyHours) {
      return res
        .status(404)
        .json({ message: "No weekly hours found for the user" });
    }

    res.json(weeklyHours);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get weekly hours for a specific date
router.get("/date/:date", auth, async (req, res) => {
  const { date } = req.params;
  const userId = req.user._id;

  // Validate date format (MM-DD-YYYY)
  const datePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
  if (!datePattern.test(date)) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  const [day, month, year] = date.split("-").map(Number);

  // Validate if the date is a valid date
  const isValidDate = (m, d, y) => {
    const date = new Date(y, m - 1, d);
    return (
      date.getDate() === d &&
      date.getMonth() === m - 1 &&
      date.getFullYear() === y
    );
  };

  if (!isValidDate(month, day, year)) {
    return res.status(400).json({ message: "Invalid date" });
  }

  // Calculate the start of the week
  const inputDate = new Date(year, month - 1, day);
  const weekStartDate = getWeekStartDate(inputDate);
  console.log(`Week start date calculated as: ${weekStartDate}`);

  try {
    const weeklyHours = await WeeklyHours.findOne({
      user: userId,
      weekStart: weekStartDate,
    });

    if (!weeklyHours) {
      return res
        .status(404)
        .json({ message: "No hours found for the specified week" });
    }

    res.json(weeklyHours);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route to get weekly hours for a user
// router.get("/weekly-hours", auth, async (req, res) => {
//   try {
//     const weeklyHours = await WeeklyHours.find({ user: req.user._id });

//     res.json(weeklyHours);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Route to get weekly hours for a specific date
// router.get("/weekly-hours/date/:date", auth, async (req, res) => {
//   const { date } = req.params;

//   // Validate date format (Day/Month/Year)
//   const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
//   if (!datePattern.test(date)) {
//     return res.status(400).json({ message: "Invalid date format" });
//   }

//   const [day, month, year] = date.split("/").map(Number);

//   // Validate if the date is a valid date
//   const isValidDate = (d, m, y) => {
//     const date = new Date(y, m - 1, d);
//     return (
//       date.getDate() === d &&
//       date.getMonth() === m - 1 &&
//       date.getFullYear() === y
//     );
//   };

//   if (!isValidDate(day, month, year)) {
//     return res.status(400).json({ message: "Invalid date" });
//   }

//   // Calculate the start of the week
//   const inputDate = new Date(year, month - 1, day);
//   const weekStartDate = getWeekStartDate(inputDate);

//   try {
//     const weeklyHours = await WeeklyHours.findOne({
//       user: req.user._id,
//       weekStart: weekStartDate,
//     });

//     if (!weeklyHours) {
//       return res
//         .status(404)
//         .json({ message: "No hours found for the specified week" });
//     }

//     res.json(weeklyHours);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

module.exports = router;
