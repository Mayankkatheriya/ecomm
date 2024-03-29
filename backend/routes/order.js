const express = require("express");
const { createOrder, getOrder } = require("../controllers/order");

const router = express.Router();

router.post("/", createOrder);

router.get("/", getOrder);

// router.post('/payement/payment-status' )

module.exports = router;
