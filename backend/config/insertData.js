require("dotenv").config();
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/Product"); // This should work if your models folder is at backend/models/Product.js
const connectDB = require("./db"); // Adjusted from "./db" to "../db" because db.js is in the parent folder

const insertInitialData = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Insert some products
    const product1 = await Product.create({
      image: "product1.jpg",
      title: "Sample Product 1",
      category: "Electronics",
      description: "This is a sample electronic product.",
      price: 99.99,
    });

    const product2 = await Product.create({
      image: "product2.jpg",
      title: "Sample Product 2",
      category: "Furniture",
      description: "This is a sample furniture product.",
      price: 199.99,
    });

    console.log("Products inserted successfully:", product1, product2);
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the insertion function
insertInitialData();
