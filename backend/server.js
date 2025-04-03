require("dotenv").config();
const express = require("express");
const db = require("./config/db"); // MongoDB connection
const path = require("path");
const multer = require("multer");
const accessRoutes = require("./routes/accessRoutes");
const Product = require("./models/Product"); // Import the Product model
const authRoutes = require('./routes/authRoutes');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();



const app = express();

// Debug: Show environment variables
console.log("📌 MONGO_URI:", process.env.MONGO_URI || "❌ Not Found");
console.log("📌 PORT:", process.env.PORT || 3005);

// Ensure MongoDB URI is available
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file. Exiting...");
  process.exit(1);
}

// Set up the app to trust the first proxy (useful if behind Nginx, etc.)
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './views');  // Set views directory
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Use cookie-parser middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(cookieParser()); // Use cookie-parser middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

// Multer File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "public/uploads");
    console.log("📂 Upload Destination:", uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const newFileName = Date.now() + path.extname(file.originalname);
    console.log("📸 Uploaded File:", newFileName);
    cb(null, newFileName);
  },
});

const upload = multer({ storage });

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../backend/public/uploads")));
console.log("🖼️ Serving static images from /uploads");

// Use routes
app.use("/", accessRoutes);
app.use('/auth', authRoutes);


// Connect to MongoDB
db(); // MongoDB connection setup

// Start the server
const PORT = process.env.PORT || 3005;
const HOST = process.env.HOST || "http://localhost";
const serverUrl = `${HOST}:${PORT}`;

app.listen(PORT, () => {
  console.log(`🚀 Server running at ${serverUrl}`);
});
