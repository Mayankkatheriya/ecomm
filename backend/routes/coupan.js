const express = require("express");
const { createCoupan, getCoupan } = require("../controllers/coupan");
const { authMiddleware } = require("../middlewares/auth");

const router = express.Router();

router.post("/", authMiddleware(["admin"]), createCoupan);

router.get("/", getCoupan);

module.exports = router;
