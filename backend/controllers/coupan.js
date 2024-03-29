const { CoupanModel } = require("../models/coupan");
const cron = require("node-cron");

//TODO Function to expire coupons
const expireCoupons = async () => {
  try {
    // Find coupons with end date less than current date and update isActive to false
    const result = await CoupanModel.updateMany({ endDate: { $lt: new Date() } }, { $set: { isActive: false } });
    console.log("Expired coupons updated successfully:", result);
  } catch (error) {
    console.error("Error expiring coupons:", error);
  }
};

//TODO Schedule the expireCoupons function to run every hour
cron.schedule("0 * * * *", expireCoupons);

//TODO Controller function to create a new coupon
const createCoupan = async (req, res) => {
  try {
    const body = req.body;
    // Create a new coupon using data from the request body
    const newCoupan = await CoupanModel.create(body);
    res.json({
      status: true,
      message: "Coupon Created Successfully",
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    // Send an error response in case of failure
    res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};

//TODO Controller function to get active coupons
const getCoupan = async (req, res) => {
  try {
    // Find all active coupons
    const coupanLists = await CoupanModel.find({ isActive: true });
    res.json({
      status: true,
      message: "Get coupon api",
      results: coupanLists
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    // Send an error response in case of failure
    res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { createCoupan, getCoupan };
