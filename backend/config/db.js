const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log("MONGO_URI:", process.env.MONGO_URI); // Ensure correct URI is loaded

    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is not set in .env file");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit on failure
  }
};

module.exports = connectDB;
