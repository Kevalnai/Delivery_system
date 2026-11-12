// backend/routes/authRoutes.js
// Old /auth/* URLs; they redirect to the main routes so there is one login flow.
const express = require("express");
const { authenticateToken } = require("../controllers/authController");

const router = express.Router();

router.get("/register", (req, res) => res.redirect("/register"));
router.get("/login", (req, res) => res.redirect("/login"));

router.get("/protected", authenticateToken, (req, res) => {
  res.send("This is a protected route");
});

module.exports = router;
