const express = require("express");

const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add single product - Admin only
router.post("/", protect, adminOnly, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add multiple products - Admin only
router.post("/bulk", protect, adminOnly, async (req, res) => {
    try {
        const products = await Product.insertMany(req.body);

        res.status(201).json({
            message: "Products added successfully",
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add product review - Logged-in user
router.post("/:id/reviews", protect, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const userName = req.user.name || "User";

        const alreadyReviewed = product.reviews.find(
            (review) => review.user === userName
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                message: "You already reviewed this product"
            });
        }

        const review = {
            user: userName,
            rating: Number(rating),
            comment
        };

        product.reviews.push(review);

        product.totalReviews = product.reviews.length;

        product.averageRating =
            product.reviews.reduce((total, item) => total + item.rating, 0) /
            product.reviews.length;

        await product.save();

        res.status(201).json({
            message: "Review added successfully",
            averageRating: product.averageRating,
            totalReviews: product.totalReviews,
            reviews: product.reviews
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update product - Admin only
router.put("/:id", protect, adminOnly, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete product - Admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;