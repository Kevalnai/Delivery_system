// backend/controllers/authController.js
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-jwt-secret";

// Registration logic
exports.register = async (req, res) => {
  try {
    const { email, password, gender, age, profession } = req.body;

    if (!email || !password) {
      return res.status(400).render("register", { errorMessage: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render("register", { errorMessage: "A user with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword, gender, age, profession });

    res.redirect("/login");
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(400).render("register", { errorMessage: "Error registering user: " + err.message });
  }
};

// Login logic
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = email ? await User.findOne({ email }) : null;

    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(400).render("login", { errorMessage: "Invalid email or password." });
    }

    // Session is what protected pages check
    req.session.user = { id: user._id.toString(), email: user.email };

    // JWT cookie kept for the /protected example route
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

    res.redirect("/product-list");
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).render("login", { errorMessage: "Server error, please try again." });
  }
};

// Logout
exports.logout = (req, res) => {
  res.clearCookie("token");
  req.session.destroy(() => res.redirect("/login"));
};

// Middleware to authenticate JWT
exports.authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
