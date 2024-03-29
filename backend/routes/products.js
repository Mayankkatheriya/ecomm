const express = require('express');
const { createProduct, getProduct, editProduct, likeDislikeController, productDetailsController, reviewProductController, deleteProduct, getProductByCategory } = require('../controllers/products');
const { authMiddleware } = require('../middlewares/auth');


const router = express.Router();

router.post("/", authMiddleware(["admin", "seller"]), createProduct);

router.patch("/:productId", authMiddleware(["seller", "admin"]), editProduct);

router.delete("/:productId", authMiddleware(["seller", "admin"]), deleteProduct);

router.get("/", authMiddleware(["buyer", "admin", "seller"]), getProduct);

router.get("/product-by-category", authMiddleware(["buyer", "admin", "seller"]), getProductByCategory);

router.post("/:productId/review", authMiddleware(["admin", "buyer", "seller"]), reviewProductController);

router.post("/:productId/:action(likes|dislikes)", authMiddleware(["buyer", "admin", "seller"]), likeDislikeController);

router.get("/product-by-id", productDetailsController);

module.exports = router