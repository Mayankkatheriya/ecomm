const express = require("express"); // Importing Express framework
const {
  userRegister,
  userLogin,
  userLogout,
  userForgotPassword,
  addProductToWishlist,
  getWishlist,
  saveUserAddress,
  userResetPassword,
  userChangePassword,
} = require("../controllers/user"); // Importing user controller functions
const { authMiddleware } = require("../middlewares/auth"); // Importing authentication middleware

const router = express.Router(); // Creating a new Express router instance

// Route for user registration
router.post("/register", userRegister);

// Route for user login
router.post("/login", userLogin);

// Route for user logout
router.post(
  "/logout",
  authMiddleware(["admin", "buyer", "seller"]),
  userLogout
);

// Route for adding a product to wishlist
router.post(
  "/add-to-wishlist",
  authMiddleware(["buyer", "admin", "seller"]), // Middleware to ensure user authentication
  addProductToWishlist
);

// Route for getting user's wishlist
router.get(
  "/add-to-wishlist",
  authMiddleware(["buyer", "admin", "seller"]), // Middleware to ensure user authentication
  getWishlist
);

// Route for saving user address
router.post(
  "/address",
  authMiddleware(["admin", "buyer", "seller"]), // Middleware to ensure user authentication
  saveUserAddress
);

// Route for handling forgot password functionality
router.post("/forgotPassword", userForgotPassword);

router.post("/resetPassword/:resetToken", userResetPassword);

router.post("/changePassword",authMiddleware(["admin", "buyer", "seller"]), userChangePassword);

module.exports = router; // Exporting the router instance for use in other files
