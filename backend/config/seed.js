// seed.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config(); // Ensure to load the .env file
const connectDB = require("./db");
const User = require("../models/user"); // Adjust path as needed

// Seed data
const seedData = async () => {
  try {
    // Connect to the database
    await connectDB();

    // List of users to seed
    const users = [
      { email: "user1@example.com", password: "password1" },
      { email: "user2@example.com", password: "password2" },
      { email: "user3@example.com", password: "password3" },
      { email: "user4@example.com", password: "password4" },
      { email: "user5@example.com", password: "password5" },
    ];

    // Loop over each user and insert into the database
    for (const userData of users) {
      const { email, password } = userData;

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
          email,
          password: hashedPassword,
          gender: "Not specified", // Default value
          age: 25, // Default age
          profession: "Not specified", // Default profession
        });

        // Save the user to the database
        await newUser.save();
        console.log(`User ${email} created successfully.`);
      } else {
        console.log(`User ${email} already exists.`);
      }
    }

    // Disconnect from the database
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

// Run the seed function
seedData();
