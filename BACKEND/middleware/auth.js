const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    console.log("No token found");
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, "your_jwt_secret");
    console.log("Token decoded:", decoded);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      console.log("User not found");
      return res.status(401).json({ message: "Not authorized" });
    }
    next();
  } catch (err) {
    console.log("Token error:", err);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = auth;
