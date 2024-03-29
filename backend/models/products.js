const mongoose = require("mongoose");

var ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  stock: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: "users"
  },
  dislikes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: "users"
  },
  // likesCount: {
  //   type: Number,
  //   default: 0
  // },
  reviews: {
    type: [{
      rating: Number,
      comment: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
      }
    }],
  }
});

const ProductModel = mongoose.model("products", ProductSchema);

module.exports = { ProductModel };
