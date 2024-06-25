const express = require("express");
const WeeklyHours = require("../models/weeklyHours");
const auth = require("../middleware/auth");

const router = express.Router();

const cors = require("cors");
router.use(
  cors({
    origin: "http://localhost:5173", // Adjust this to match your frontend's origin
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",
  })
);

// Utility function to calculate the start of the week
const getWeekStartDate = (dateString) => {
  const givenDate = new Date(dateString);
  const dayOfWeek = givenDate.getUTCDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek; // Days to subtract to get to the previous Sunday
  const weekStart = new Date(givenDate);
  weekStart.setDate(givenDate.getDate() - daysToSubtract);
  weekStart.setUTCHours(0, 0, 0, 0); // Ensure the time is set to 00:00:00.000 UTC
  return weekStart;
};

// Route to add or update weekly hours
router.post("/add", auth, async (req, res) => {
  const userId = req.user.id;
  const { weekStart, hours } = req.body;

  if (!weekStart || hours === undefined) {
    return res
      .status(400)
      .json({ message: "weekStart and hours are required" });
  }

  try {
    const weekStartDate = getWeekStartDate(weekStart);

    // Update or create the weekly hours entry
    const weeklyHours = await WeeklyHours.findOneAndUpdate(
      { user: userId, weekStart: weekStartDate },
      { $inc: { hours: hours } },
      { new: true, upsert: true }
    );

    res.json({ message: "Weekly hours updated successfully", weeklyHours });
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
router.post("/date", auth, async (req, res) => {
  const userId = req.user.id;
  const { selectedDate } = req.body;

  if (!selectedDate) {
    return res.status(400).json({ message: "No date provided" });
  }

  try {
    const weekStartDate = getWeekStartDate(selectedDate);

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
module.exports = router;
