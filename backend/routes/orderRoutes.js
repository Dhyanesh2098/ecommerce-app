const express = require("express");

const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Create Order
router.post("/", protect, async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        message: "No products in order",
      });
    }

    // Check stock before creating order
    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} has only ${product.stock} items left in stock`,
        });
      }
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      products: products.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
      totalAmount,
      status: "Processing",
      estimatedDelivery: "30 minutes",
    });

    await order.save();

    // Reduce stock after successful order
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get logged in user orders
router.get("/myorders", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).populate("products.product");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Admin - Get all orders
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Admin - Update order status
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;