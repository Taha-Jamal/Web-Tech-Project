const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      //  "mongodb+srv://umer:Ernstormia1!@cluster.bg8edgv.mongodb.net/WEEKLYHOURS",
      "mongodb://127.0.0.1:27017/WEEKLY-HOURS",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
