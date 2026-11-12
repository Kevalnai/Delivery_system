// routes/accessRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

const authController = require("../controllers/authController");
const { homePage, getMarketplace, addItem } = require("../controllers/homePageController");
const { authMiddleware } = require("../middleware/loginMiddleware");
const productController = require("../controllers/productController");
const {
  addToCart,
  viewCart,
  removeFromCart,
  viewCheckout,
  processPayment,
} = require("../controllers/buyerController");

// ---------- Public ----------
router.get("/", homePage);

router.get("/register", (req, res) => res.render("register"));
router.post("/register", authController.register);

router.get("/login", (req, res) => res.render("login"));
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// JWT example route
router.get("/protected", authController.authenticateToken, (req, res) => {
  res.send("This is a protected route");
});

// ---------- Everything below requires login ----------

// Seller: add products
router.get("/add-products", authMiddleware, productController.getAddProduct);
router.post("/add-products", authMiddleware, productController.postAddProduct);

// Marketplace JSON API
router.get("/marketplace", authMiddleware, getMarketplace);
router.post("/marketplace", authMiddleware, addItem);

// Product list (landing page after login)
router.get("/product-list", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.render("product-list", { products });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
});

// Buyer
router.get("/buyer/homepage", authMiddleware, productController.getProducts);
router.post("/buyer/add-to-cart", authMiddleware, addToCart);
router.get("/buyer/cart", authMiddleware, viewCart);
router.post("/buyer/remove-from-cart", authMiddleware, removeFromCart);
router.get("/buyer/checkout", authMiddleware, viewCheckout);
router.get("/buyer/process-payment", authMiddleware, (req, res) => res.render("buyer/payment-details"));
router.post("/buyer/process-payment", authMiddleware, processPayment);
router.get("/payment-details", authMiddleware, (req, res) => res.redirect("/buyer/process-payment"));

// Order tracking (mock data until an Order model / carrier API exists)
router.get("/buyer/trackorder", authMiddleware, (req, res) => {
  const orderStatus = {
    orderNumber: "12345",
    status: "Ready for Departure",
    deliveryDate: "2025-04-10",
    carrier: "FedEx",
    location: "Toronto, ON",
  };
  res.render("trackorder", { orderStatus });
});

// Seller: manage listings and update status
router.get("/buyer/manage", authMiddleware, productController.manageProducts);
router.post("/update-product", authMiddleware, productController.updateProductStatus);
router.post("/update-status", authMiddleware, async (req, res) => {
  const { id, status } = req.body;
  try {
    const product = await Product.findByIdAndUpdate(id, { status }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Status update failed:", error);
    res.status(500).json({ success: false, message: "Error updating product status" });
  }
});

module.exports = router;
