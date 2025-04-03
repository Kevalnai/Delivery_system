// routes/accessRoutes.js (with debugging)

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
const authController = require('../controllers/authController');
const { authenticateToken } = authController;

// ✅ Import Controllers
const { homePage, getMarketplace, addItem } = require("../controllers/homePageController");
const { loginPage, registerPage, registerUser, loginUser, logoutUser } = require("../controllers/loginController");
const { authMiddleware } = require("../middleware/loginMiddleware");
const productController = require("../controllers/productController");
const {getProducts , manageProducts, updateProductStatus} = require("../controllers/productController")
const { viewAsBuyerPage, addToCart, viewCart, removeFromCart, viewCheckout, processPayment, trackOrder } = require("../controllers/buyerController");

// ✅ Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/uploads");
    console.log("📂 Upload destination path:", uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    console.log("📸 Uploaded file:", filename);
    cb(null, filename);
  },
});
const upload = multer({ storage });

// ✅ Public Routes
router.get("/", homePage);
// router.get("/login", loginPage);
// router.get("/register", registerPage);
// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.get("/logout", logoutUser);


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


// ✅ Product Routes
router.get("/add-products", productController.getAddProduct);
router.post("/add-products", productController.postAddProduct);

// ✅ Marketplace Routes (Protected)
router.get("/marketplace", authMiddleware, getMarketplace);
router.post("/marketplace", authMiddleware, addItem);

// ✅ Product List
router.get("/product-list", authMiddleware, async (req, res) => {
  try {
    console.log("📦 Fetching product list...");
    const products = await Product.find();
    res.render("product-list", { products, user: req.session.user });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
});

// ✅ Buyer Routes
router.get("/buyer/homepage", getProducts);
router.post("/buyer/add-to-cart", addToCart);
router.get("/buyer/cart", viewCart);
router.post("/buyer/remove-from-cart", removeFromCart);

// Seller Routes
router.get("/buyer/manage", manageProducts);
router.post('/update-product', productController.updateProductStatus);
router.get("/buyer/trackorder", (req, res) => {
  // Mock order data
  const orderStatus = {
    orderNumber: "12345",
    status: "Ready for Departure",
    deliveryDate: "2025-04-10",
    carrier: "FedEx",
    location: "Toronto, ON"
  };

  res.render("trackorder", { orderStatus });
});


// ✅ Checkout Routes
console.log("viewCheckout:", viewCheckout ? "✅ Loaded" : "❌ Undefined");
router.get("/buyer/checkout", viewCheckout);

router.get('/payment-details', (req, res) => {
  res.render('payment-details'); // Render the payment details view
});
router.get('/buyer/process-payment', (req, res) => {
  res.render('buyer/payment-details');
});

  router.post("/buyer/process-payment", processPayment);
router.post('/buyer/process-payment', (req, res) => {
  // Handle payment processing here
  const { cardNumber, expiryDate, cvv } = req.body;
  // Process payment with the provided data
  res.send('Payment processed successfully!');
});



// ✅ Status Update Route
router.post("/update-status", async (req, res) => {
  const { id, status } = req.body;
  try {
    console.log(`🔄 Updating product status for ID: ${id} to '${status}'`);
    await Product.findByIdAndUpdate(id, { status });
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Status update failed:", error);
    res.status(500).json({ success: false, message: "Error updating product status" });
  }
});

module.exports = router;