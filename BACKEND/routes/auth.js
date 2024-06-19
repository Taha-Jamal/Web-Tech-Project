const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const User = require("../models/user");
const auth = require("../middleware/auth");

const app = express();
const router = express.Router();

// Use CORS middleware
app.use(cors({
    origin: 'http://localhost:5173', // Adjust this to match your frontend's origin
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
}));

// Use JSON middleware
app.use(express.json());

// Signup route
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.status(201).json({ token, redirectUrl: `/api/user/${user.username}` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Logout route
router.post("/logout", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.loginTime) {
      return res.status(400).json({ message: "No active session found" });
    }

    const loginTime = new Date(user.loginTime);
    const logoutTime = new Date();
    const duration = (logoutTime - loginTime) / 1000 / 3600; // duration in hours

    // Determine the start of the current week
    const currentWeekStart = new Date(logoutTime);
    currentWeekStart.setHours(0, 0, 0, 0);
    currentWeekStart.setDate(
      currentWeekStart.getDate() - currentWeekStart.getDay()
    );

    // Find or create the current week's entry
    let currentWeek = user.weeklyHours.find(
      (week) => week.weekStart.getTime() === currentWeekStart.getTime()
    );

    if (currentWeek) {
      currentWeek.hours += duration;
    } else {
      user.weeklyHours.push({
        weekStart: currentWeekStart,
        hours: duration,
      });
    }

    // Update weeklyHoursCompleted status
    const totalHours = user.weeklyHours.find(
      (week) => week.weekStart.getTime() === currentWeekStart.getTime()
    ).hours;
    user.weeklyHoursCompleted = totalHours >= 40;

    // Clear loginTime
    user.loginTime = null;

    await user.save();

    res.json({
      message: "Logged out successfully",
      duration: `${duration} hours`,
      totalHours,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Mount the router
app.use('/api/auth', router);

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = router;
