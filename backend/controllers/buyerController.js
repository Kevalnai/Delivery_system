// controllers/buyerController.js
const Product = require("../models/Product");
const Cart = require("../models/cart");
const nodemailer = require("nodemailer");

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Cart items whose product was deleted would crash the templates, so drop them.
const getCartItems = async (userId) => {
  const items = await Cart.find({ user: userId }).populate("product");
  return items.filter((item) => item.product);
};

// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { productId } = req.body;
    const quantity = parseInt(req.body.quantity, 10);

    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).send("Product ID and a quantity of at least 1 are required");
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    const existingCartItem = await Cart.findOne({ user: userId, product: productId });
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      existingCartItem.totalPrice = existingCartItem.quantity * product.price;
      await existingCartItem.save();
    } else {
      await Cart.create({
        user: userId,
        product: productId,
        quantity,
        totalPrice: product.price * quantity,
      });
    }

    res.redirect("/buyer/cart");
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).send("Server Error");
  }
};

// View Cart
exports.viewCart = async (req, res) => {
  try {
    const items = await getCartItems(req.session.user.id);
    res.render("buyer/add-to-cart", { cart: { items } });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).send("Server Error");
  }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).send("Product ID is required");
    }

    await Cart.findOneAndDelete({ user: req.session.user.id, product: productId });
    res.redirect("/buyer/cart");
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).send("Server Error");
  }
};

// Checkout
exports.viewCheckout = async (req, res) => {
  try {
    const items = await getCartItems(req.session.user.id);
    res.render("buyer/checkout", { cart: { items } });
  } catch (error) {
    console.error("Error fetching checkout details:", error);
    res.status(500).send("Server Error");
  }
};

// Process payment (demo: no real card is charged)
exports.processPayment = async (req, res) => {
  try {
    const { email, name, deliveryType, deliveryTime } = req.body;

    if (!email || !name) {
      return res.status(400).send("Email and Name are required");
    }

    // Email is optional: only send when Gmail credentials are configured.
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Order Confirmation",
          html: `
            <h2>Order Confirmation</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Delivery Type:</strong> ${escapeHtml(deliveryType)}</p>
            <p><strong>Preferred Delivery Time:</strong> ${escapeHtml(deliveryTime)}</p>
          `,
        });
      } catch (mailError) {
        // Don't fail the order just because the email couldn't be sent.
        console.error("⚠️ Could not send confirmation email:", mailError.message);
      }
    } else {
      console.log("ℹ️ EMAIL_USER/EMAIL_PASS not set; skipping confirmation email.");
    }

    // Order placed: empty the cart and show delivery status
    await Cart.deleteMany({ user: req.session.user.id });
    res.redirect("/buyer/trackorder");
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).send("Server Error");
  }
};
