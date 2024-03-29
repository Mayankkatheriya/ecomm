const mongoose = require("mongoose");

const CartProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  quantity: {
    type: Number,
  },
  color: {
    type: String,
  },
  price: {
    type: Number,
  }
});

const CartSchema = new mongoose.Schema({
  products: {
    type: [CartProductSchema],
  },
  cartTotal: {
    type: Number,
    required: false,
    default: 0,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const CartModel = mongoose.model("cart", CartSchema);

module.exports = { CartModel, CartProductSchema };
