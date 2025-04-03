// backend/routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = authController; // Import the authentication middleware

const router = express.Router();

// Register routes
router.get('/register', (req, res) => {
    res.render('register');  // Render register view
});

router.post('/register', authController.register);  // Use controller for registration

// Login routes
router.get('/login', (req, res) => {
    res.render('login');  // Render login view
});

router.post('/login', authController.login);  // Use controller for login

// Protected route example
router.get('/protected', authenticateToken, (req, res) => {
    res.send('This is a protected route');
});

module.exports = router;
