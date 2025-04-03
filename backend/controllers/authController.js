// backend/controllers/authController.js
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'qwertyAsDfGhJKl1z2x3c4v5b6n7m8$fdr@gdt';

const sampleProducts = [
    { id: 1, name: "Samsung Galaxy S21 Ultra", image: "/images/samsung.jpg", price: 999, description: "A flagship Android phone." },
    { id: 2, name: "iPhone", image: "/images/phone2.jpg", price: 1099, description: "The latest iPhone with dynamic island design." },
    { id: 3, name: "iPad 10th Gen (M2, 2022)", image: "/images/ipad.jpg", price: 1200, description: "Lightweight laptop powered by the M2 chip." },
    { id: 4, name: "Truck", image: "/images/truck.jpg", price: 499, description: "Next-gen gaming console." },
    { id: 5, name: "Bose Headphones", image: "/images/headphones.jpg", price: 299, description: "Noise-cancelling headphones." },
    { id: 6, name: "Nothing Phone1", image: "/images/phone2.jpg", price: 399, description: "Stylish smartwatch with health monitoring." },
    { id: 7, name: "Electric Bicycle", image: "/images/bicycle.jpg", price: 899, description: "Eco-friendly e-bike with pedal assist." },
    { id: 8, name: "Logitech Headphones", image: "/images/headphone2.jpg", price: 99, description: "Ergonomic mouse with customizable buttons." }
];

// Registration logic
exports.register = async (req, res) => {
    try {
        const { email, password, gender, age, profession } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
            gender,
            age,
            profession,
        });

        await user.save();
        res.redirect('/auth/login');  // Redirect to login after registration
    } catch (err) {
        res.status(400).send('Error registering user: ' + err.message);
    }
};

// Login logic
exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log('Email:', email);
console.log('Password:', password);
console.log(user.password);

    if (user && await bcrypt.compare(password, user.password)) {
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        
        // Set the token as a cookie
        res.cookie('token', token, { httpOnly: true });
        res.render('product-list', { products: sampleProducts });  // Redirect to homepage or dashboard
    } else {
        res.status(400).send('Invalid credentials');
    }
};

// Middleware to authenticate JWT
exports.authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};
