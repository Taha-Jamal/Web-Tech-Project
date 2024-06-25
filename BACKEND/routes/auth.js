const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const User = require("../models/user");
const WeeklyHours = require("../models/weeklyHours");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",
  })
);

// Generate Tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id }, "your_jwt_secret", {
    expiresIn: "0.5m",
  });

  const refreshToken = jwt.sign({ id: user._id }, "your_jwt_refresh_secret", {
    expiresIn: "1d",
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn: jwt.decode(accessToken).exp * 1000,
    refreshTokenExpiresIn: jwt.decode(refreshToken).exp * 1000,
  };
};

// In-memory store for login times
const loginTimes = {};

const getWeekStartDate = (dateString) => {
  const givenDate = new Date(dateString);
  const dayOfWeek = givenDate.getUTCDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek; // Days to subtract to get to the previous Sunday
  const weekStart = new Date(givenDate);
  weekStart.setDate(givenDate.getDate() - daysToSubtract);
  weekStart.setUTCHours(0, 0, 0, 0); // Ensure the time is set to 00:00:00.000 UTC
  return weekStart;
};

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

    // const { accessToken, refreshToken } = generateTokens(user);

    // user.refreshToken = refreshToken;
    // await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    } = generateTokens(user);

    user.refreshToken = refreshToken;

    // Store login time
    loginTimes[user._id] = new Date();

    await user.save();

    res.status(200).json({
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Refresh Token route
router.post("/token", async (req, res) => {
  const { token } = req.body; // Get the refresh token from the request body

  if (!token) {
    return res.status(401).json({ message: "No token provided" }); // If no token is provided, return an error
  }

  try {
    const decoded = jwt.verify(token, "your_jwt_refresh_secret"); // Verify the refresh token

    const user = await User.findById(decoded.id); // Find the user by the ID in the token

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: "Invalid token" }); // If the token is invalid or does not match, return an error
    }

    const {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    } = generateTokens(user); // Generate new access and refresh tokens

    user.refreshToken = refreshToken; // Update the user's refresh token
    await user.save(); // Save the user

    res.status(200).json({
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    }); // Send the new tokens to the client
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(403)
        .json({ message: "Refresh token expired, please log in again" });
    }
    res.status(401).json({ message: "Invalid token" }); // If there is an error verifying the token, return an error
  }
});

// Logout route
router.post("/logout", auth, async (req, res) => {
  const userId = req.user.id;
  const loginTime = loginTimes[userId];
  const logoutTime = new Date();

  if (!loginTime) {
    return res.status(400).json({ message: "No active session found" });
  }

  const duration = (logoutTime - loginTime) / 1000 / 3600; // duration in hours

  // Calculate the start of the week using the login date
  const weekStart = getWeekStartDate(loginTime);

  try {
    // Update or create the weekly hours entry
    const weeklyHours = await WeeklyHours.findOneAndUpdate(
      { user: userId, weekStart: weekStart },
      { $inc: { hours: duration } },
      { new: true, upsert: true }
    );

    // Clear login time
    delete loginTimes[userId];

    // Invalidate the refresh token
    const user = await User.findById(userId);
    user.refreshToken = null;
    await user.save();

    res.json({ message: "Logged out successfully", duration });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
