// Seeds demo users and products. Safe to run more than once.
//   npm run seed
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("./db");
const User = require("../models/user");
const Product = require("../models/Product");

const users = [
  { email: "user1@example.com", password: "password1" },
  { email: "user2@example.com", password: "password2" },
  { email: "user3@example.com", password: "password3" },
];

// Images already exist in backend/public/uploads
const products = [
  { title: "Samsung Galaxy S21 Ultra", category: "electronics", price: 999, image: "uploads/samsung.jpg", condition: ["Used"], description: "A flagship Android phone." },
  { title: "iPad 10th Gen", category: "electronics", price: 450, image: "uploads/ipad.jpg", condition: ["New"], description: "Lightweight tablet, great for notes and video." },
  { title: "Bose Headphones", category: "electronics", price: 299, image: "uploads/headphones.jpg", condition: ["Refurbished"], description: "Noise-cancelling headphones." },
  { title: "Electric Bicycle", category: "sports", price: 899, image: "uploads/bicycle.jpg", condition: ["Used"], description: "Eco-friendly e-bike with pedal assist." },
  { title: "Smart TV", category: "home", price: 650, image: "uploads/TV.jpg", condition: ["New"], description: "55-inch 4K smart TV." },
  { title: "Pickup Truck", category: "home", price: 15000, image: "uploads/truck.jpg", condition: ["Used"], description: "Reliable truck, well maintained." },
];

const seed = async () => {
  try {
    await connectDB();

    for (const { email, password } of users) {
      if (await User.findOne({ email })) {
        console.log(`User ${email} already exists.`);
        continue;
      }
      await User.create({
        email,
        password: await bcrypt.hash(password, 10),
        gender: "other",
        age: 25,
        profession: "Not specified",
      });
      console.log(`User ${email} created (password: ${password}).`);
    }

    for (const product of products) {
      if (await Product.findOne({ title: product.title })) {
        console.log(`Product "${product.title}" already exists.`);
        continue;
      }
      await Product.create(product);
      console.log(`Product "${product.title}" created.`);
    }
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seed();
