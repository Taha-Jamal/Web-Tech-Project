const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/data");
const userRoutes = require("./routes/user");
const weeklyHoursRoutes = require("./routes/weeklyHours");
// const checkExpiredTokens = require("./tasks/checkExpiration");

const PORT = process.env.PORT || 5001;

const app = express();

connectDB();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/data", dataRoutes);

app.use(logger("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/weekly-hours", weeklyHoursRoutes);
// app.use("/api", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // checkExpiredTokens();
});

module.exports = app;
