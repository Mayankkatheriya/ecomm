const express = require("express");
const { createCart, getCart } = require("../controllers/cart");

const router = express.Router();

router.post("/", createCart);

router.get("/", getCart);

module.exports = router;