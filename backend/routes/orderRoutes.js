const express = require("express");

const Order = require("../models/Order");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Create Order
router.post("/", protect, async (req, res) => {
    try {
        const order = new Order({
            user: req.user.id,
            products: req.body.products,
            totalAmount: req.body.totalAmount
        });

        await order.save();

        res.status(201).json(order);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Get logged in user orders
router.get("/myorders", protect, async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.id
        }).populate("products.product");

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            error: error.message
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
            error: error.message
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
            error: error.message
        });
    }
});

module.exports = router;