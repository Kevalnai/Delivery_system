const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  image: { type: String },
  title: { type: String, required: [true, "Title is required"] },
  category: { type: String, required: [true, "Category is required"] },
  condition: { type: [String], default: [] },
  description: { type: String, required: [true, "Description is required"] },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be a positive number"]
  },
  status: { type: String, default: "Available" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
