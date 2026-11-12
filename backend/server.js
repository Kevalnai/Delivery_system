const path = require("path");
// Load backend/.env no matter which directory the server is started from.
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const accessRoutes = require("./routes/accessRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

if (!process.env.SESSION_SECRET) {
  console.warn("⚠️  SESSION_SECRET is not set in backend/.env; using an insecure development secret.");
}

app.set("trust proxy", 1);

// Body parsing, cookies and sessions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-only-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax" },
  })
);

// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));

// Make the logged-in user available to every template
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Static files
//   /uploads/...           -> backend/public/uploads (product images)
//   /js/..., /assets/...   -> frontend/public
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Routes
app.use("/", accessRoutes);
app.use("/auth", authRoutes);

// 404
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Error handler (catches errors passed to next(err))
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).send("Server Error");
});

// Only connect and listen when run directly (not when required by tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || "http://localhost";

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running at ${HOST}:${PORT}`);
    });
  });
}

module.exports = app;
