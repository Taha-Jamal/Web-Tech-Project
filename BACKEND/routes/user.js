const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/user/:username", auth, async (req, res) => {
  const { username } = req.params;

  try {
    // Check if the username in the URL matches the authenticated user's username
    if (req.user.username !== username) {
      return res
        .status(403)
        .json({ message: "Access forbidden: Not your profile" });
    }

    // Fetch user data (excluding sensitive information like password)
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
