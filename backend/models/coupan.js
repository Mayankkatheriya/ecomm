const mongoose = require("mongoose");

const CoupanSchema = new mongoose.Schema({
  coupanCode: {
    type: String,
    required: true,
    unique: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  maxDiscountInRs: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const CoupanModel = mongoose.model("coupans", CoupanSchema);

module.exports = { CoupanModel };
