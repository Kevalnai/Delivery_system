require("dotenv").config();
const mongoose = require("mongoose");
const Cart = require("../models/cart");
const Product = require("../models/Product");
const connectDB = require("./db"); // Import your connection function

const insertCartData = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Assume you have a valid Product ID and User ID
    const product = await Product.findOne(); // Just for simplicity, use the first product
    const userId = "some-user-id"; // Replace with an actual user ID

    // Insert data into the Cart collection
    const cartItem = await Cart.create({
      user: userId,
      product: product._id,
      quantity: 2, // Add 2 quantities of the product
      totalPrice: product.price * 2, // Calculate total price
    });

    console.log("Cart item added:", cartItem);
  } catch (error) {
    console.error("Error inserting cart data:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the insertion function
insertCartData();
