const mongoose = require("mongoose");
const { CartProductSchema } = require("./cart");
const { AddressSchema } = require("./user");

const CartSchema = new mongoose.Schema({
    products: {
      type: [CartProductSchema],
    },
  });

const OrderSchema = new mongoose.Schema({
  cart: {
    type: CartSchema,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  coupan: {
    type: [mongoose.Schema.Types.ObjectId],
    required: false,
    default: null,
  },
  deliveryAddress: {
    type: AddressSchema,
    required: true,
  },
  orderPlacadAt: {
    type: Date,
    required: true,
  },
  deliveryDate: {
    type: Date,
    required: true,
  },
  orderStatus: {
    type: String,
    required: true,
  },
  modeOfPayment: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: false,
    default: ""
  },
});

const OrderModel = mongoose.model("orders", OrderSchema);

module.exports = { OrderModel };
