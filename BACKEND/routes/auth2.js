const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // const existingUser = await User.findOne({ email });
    // if (existingUser) {
    //   return res.status(400).json({ message: "Email already exists" });
    // }

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
    res.status(400).json({ message: "User already exists" });
  }
});

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

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// async function login(email, password) {
//     const response = await fetch('http://localhost:5000/api/auth/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email, password }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       sessionStorage.setItem('jwtToken', data.token);
//     } else {
//       console.error(data.message);
//     }
//   }

router.get("/logout", auth, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
