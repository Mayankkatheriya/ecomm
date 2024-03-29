const { CartModel } = require("../models/cart");
const { CoupanModel } = require("../models/coupan");
const dayjs = require("dayjs");
const { OrderModel } = require("../models/order");
const Razorpay = require("razorpay");
require("dotenv").config();

var razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  const body = req.body;
  const user = req.user;
  const userCart = await CartModel.findOne({ userId: user._id });
  if (!userCart) {
    return res.status(400).json({
      success: false,
      message: "Empty cart, please add items to cart",
    });
  }

  const coupanCode = body.coupan;
  const coupan = await CoupanModel.findOne({ coupanCode, isActive: true });
  if (!coupan) {
    return res.status(400).json({
      success: false,
      message: "Invalid coupan",
    });
  }

  const coupanStartDate = dayjs(coupan.startDate);
  const coupanEndDate = dayjs(coupan.endDate);
  const currentDateTime = dayjs();

  if (
    !(
      currentDateTime.isAfter(coupanStartDate) &&
      currentDateTime.isBefore(coupanEndDate)
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Coupan Expired",
    });
  }

  const cartTotal = userCart.cartTotal;
  const discountPercentage = coupan.discountPercentage;
  const maxDiscountInRs = coupan.maxDiscountInRs;

  let coupanDiscount = ((discountPercentage / 100) * cartTotal).toFixed(2);

  if (coupanDiscount > maxDiscountInRs) {
    coupanDiscount = maxDiscountInRs;
  }

  const totalPayableAmount = cartTotal - coupanDiscount;

  let deliveryAddress = body.deliveryAddress;
  if (!deliveryAddress) {
    deliveryAddress = user.address;
  }

  const deliveryDate = dayjs().add(7, "day");
  //Order Status Values => PALCED, PACKED, SHIPPED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, RETURNED, REFUND_AWAITED, REFUND_INITATED, REFUND_RECEIVED
  const orderDetails = {
    cart: userCart,
    userId: user._id,
    amount: totalPayableAmount,
    coupon: coupan._id,
    deliveryAddress,
    orderPlacadAt: currentDateTime,
    deliveryDate,
    orderStatus: "PALCED",
    modeOfPayment: body.modeOfPayment,
  };

  const newOrder = await OrderModel.create(orderDetails);
  let response;
  let transactionId;

  if (body.modeOfPayment === "COD") {
    // Don't generate transaction ID and don't redirect to payment gateway
  } else {
    // TODO : Redirect the user to payment gateway

    const options = {
      amount: totalPayableAmount * 100,
      currency: "INR",
      receipt: newOrder._id,
      payment_capture: 1,
    };

    console.log("options: ", options);

    try {
      response = await razorpay.orders.create(options);
      console.log("response: ", response);
      transactionId = response.id;
    } catch (err) {
      console.log(err);
    }
  }

  if (transactionId) {
    await OrderModel.findByIdAndUpdate(newOrder._id, { transactionId });
  }

  res.json({
    success: true,
    message: "Order placed successfully",
    orderId: newOrder._id,
    paymentInformation: {
      amount: totalPayableAmount,
      transactionId: transactionId || "", // Include transaction ID in response
      currency: "INR", // Assuming the currency is always INR for your case
    },
  });
};

const getOrder = async (req, res) => {
  const userId = req.user._id;
  const order = await OrderModel.find({ userId: userId });
  res.json({
    success: true,
    message: order,
  });
};

module.exports = { createOrder, getOrder };
