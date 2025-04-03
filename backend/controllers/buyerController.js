// controllers/buyerController.js
const Product = require("../models/Product");
const Cart = require('../models/cart');
const mongoose = require("mongoose");
require("dotenv").config();
const nodemailer = require('nodemailer');

const DEMO_USER_ID = process.env.DEMO_USER_ID;

// View as Buyer Page
exports.viewAsBuyerPage = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.error("❌ MongoDB is NOT connected!");
      return res.status(500).send("Database connection error");
    }

    const product = await Product.find();
    if (!product) {
      return res.status(404).send("No products found");
    }

    res.render("buyer/homepage", { products: [product] });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Server Error");
  }
};

// Add to Cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = DEMO_USER_ID;

    if (!productId || !quantity) {
      return res.status(400).send('Product ID and quantity are required');
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    const existingCartItem = await Cart.findOne({ user: userId, product: productId });
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      existingCartItem.totalPrice = existingCartItem.quantity * product.price;
      await existingCartItem.save();
    } else {
      await Cart.create({
        product: productId,
        quantity,
        totalPrice: product.price * quantity,
        user: userId,
      });
    }

    res.redirect('/buyer/cart');
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).send('Server Error');
  }
};

// View Cart
// View Cart
exports.viewCart = async (req, res) => {
  try {
    const userId = DEMO_USER_ID;
    const cartItems = await Cart.find({ user: userId }).populate('product');

    if (!cartItems.length) {
      return res.render('buyer/add-to-cart', { cart: { items: [], message: 'Your cart is empty' } });
    }

    res.render('buyer/add-to-cart', { cart: { items: cartItems } });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).send('Server Error');
  }
};



exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = DEMO_USER_ID;

    if (!productId) {
      return res.status(400).send('Product ID is required');
    }

    // Remove the item from the cart
    const result = await Cart.findOneAndDelete({ user: userId, product: productId });

    if (!result) {
      return res.status(404).send('Product not found in cart');
    }

    res.redirect('/buyer/cart'); // Redirect to the cart page after removal
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).send('Server Error');
  }
};

// checkout function
exports.viewCheckout = async (req, res) => {
  try {
    const userId = DEMO_USER_ID; // Use the demo user or the logged-in user's ID
    const cartItems = await Cart.find({ user: userId }).populate('product');

    res.render('buyer/checkout', { cart: { items: cartItems } });
  } catch (error) {
    console.error('Error fetching checkout details:', error);
    res.status(500).send('Server Error');
  }
};



exports.processPayment = async (req, res) => {
  try {
      const { email, name, deliveryType, deliveryTime } = req.body;

      // Check if the email and name are provided
      if (!email || !name) {
          return res.status(400).send('Email and Name are required');
      }

      // Prepare the email details
      const orderDetails = `
          <h2>Order Confirmation</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Delivery Type:</strong> ${deliveryType}</p>
          <p><strong>Preferred Delivery Time:</strong> ${deliveryTime}</p>
      `;

      // Setup Nodemailer
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          },
      });

      // Send email
      await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email, // Ensure this is a valid email
          subject: 'Order Confirmation',
          html: orderDetails,
      });

      //req.flash('success', 'Payment processed successfully! A confirmation email has been sent.');
      res.redirect('/marketplace');
      
  } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).send('Server Error');
  }
};

exports.trackOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    // Check if orderNumber is provided
    if (!orderNumber) {
      return res.status(400).send('Order Number is required');
    }

    // Mocking order data from the database (replace with actual database query)
    // In a real application, this data would come from an 'Order' collection in your database
    const order = await Order.findOne({ orderNumber });

    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Assuming the order contains status, tracking info, and delivery date
    const orderStatus = {
      orderNumber: order.orderNumber,
      status: order.status,
      deliveryDate: order.deliveryDate,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      location: order.location,
    };

    res.render('buyer/trackorder', { orderStatus });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).send('Server Error');
  }
};