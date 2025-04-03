// routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/Product');

// Add product to cart
router.post('/add', async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find cart item for the user and product
    let cartItem = await Cart.findOne({ user: userId, product: productId });

    if (cartItem) {
      // If the item exists, update the quantity and total price
      cartItem.quantity += quantity;
      cartItem.totalPrice = cartItem.quantity * product.price; // Assuming the product has a price field
      await cartItem.save();
    } else {
      // If it doesn't exist, create a new cart item
      cartItem = new Cart({
        user: userId,
        product: productId,
        quantity: quantity,
        totalPrice: product.price * quantity
      });
      await cartItem.save();
    }

    res.status(200).json(cartItem);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cart items for a user
router.get('/:userId', async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.params.userId }).populate('product');
    res.status(200).json(cartItems);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
