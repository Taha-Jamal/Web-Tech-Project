const express = require("express");
const User = require("../models/user"); // Assuming you're using the User model
const router = express.Router();

// Route to get all data
router.get("/allData", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all user data from the database
    res.json(users); // Send the data as a JSON response
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
