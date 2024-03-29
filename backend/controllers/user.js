const { UserModel } = require("../models/user"); // Importing the UserModel from the user model
const jwt = require("jsonwebtoken"); // Importing jsonwebtoken for creating and verifying tokens
const { sendEmailHandler } = require("../utils/sendMail");
require("dotenv").config(); // Loading environment variables from .env file

//TODO: Controller function for user registration
const userRegister = async (req, res) => {
  const body = req.body;
  try {
    const newUser = new UserModel(body); // Creating a new user instance
    await newUser.save(); // Saving the new user to the database
    res.json({
      status: true,
      message: "User registered successfully. Please login to continue.",
    });
  } catch (err) {
    console.error("Error registering user:", err.message); // Logging error to console
    res.status(500).json({
      status: false,
      message: "Registration failed. Please try again later.",
    });
  }
};

// SIGNLE user login
// 1. fetch user
// 2. get token from db
// 2.1 if token is null
// allow that user to procced with login
// 2.2 token is not null
// 2.2.1 verify the token
// *if suessfull then send msg := you are already logged in
// else procced and geneate new token

// SIGN USER logout
// set token as null inside user document

// more than one login at a time
// 1. fetch user
// 2. get token list from db
// 3. traverse each token and remove all expired token
// 4. check the size of remaining token list
//  if size < limit
// then allow login
// else send error msg

// more than one logout

//TODO: Controller function for user login
const userLogin = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({
        // Unauthorized user
        success: false,
        message: "Invalid username or password",
      });
    }
    const isPasswordCorrect = await user.isPasswordMatched(req.body.password); // Checking if password matches
    if (user.token !== null) {
      try {
        jwt.verify(user.token, process.env.JWT_SECRETE_KEY); //checking expiry
        return res.status(400).json({
          success: false,
          message: "you are already logged in",
        });
      } catch (error) {
        console.log(error.message);
      }
    }
    const expiryDateTime = Math.floor(new Date().getTime() / 1000) + 7200; // Token expiry time (2 hours)
    if (isPasswordCorrect) {
      const payload = {
        id: user._id,
        name: user.firstname,
        role: user.role,
        exp: expiryDateTime,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRETE_KEY); // Creating JWT token
      await UserModel.findByIdAndUpdate(
        user._id,
        { token },
        { new: true } // To return the updated user document
      );
      return res.json({
        success: true,
        message: "Logged in successfully",
        token: token,
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  } catch (err) {
    console.error("Error logging in user:", err); // Log the error
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
    });
  }
};

//TODO: Controller function for user logout
const userLogout = async (req, res) => {
  //set token to null in DB
  try {
    await UserModel.findByIdAndUpdate(
      req.user._id,
      { token: null },
      { new: true } // To return the updated user document
    );
    res.status(200).json({
      status: true,
      message: "User logout",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: "internal server error please try again after some time",
      success: false,
    });
  }
};

//TODO: Controller function for handling forgot password functionality
const userForgotPassword = async (req, res) => {
  try {
    const email = req.body.email; // Extracting email from request body
    const user = await UserModel.findOne({ email: email }); // Finding user by email
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid Email",
      });
    }
    const expiresIn = 5 * 60; // 5 minutes in seconds
    const resetToken = jwt.sign({ email }, process.env.JWT_RESET_SECRET, { expiresIn });
    const resetLink = `http://localhost:10000/api/v1/user/resetPassword/${resetToken}`;
    sendEmailHandler(email, "Reset Password", resetLink)
    res.status(200).json({
      status: true,
      message: "Link send Successfully",
    });
  } catch (err) {
    console.error("Error in forgot password:", err); // Log the error
    res.status(500).json({
      // Send internal server error response
      success: false,
      message: "Forgot password failed. Please try again later.",
    });
  }
};

//TODO: Controller function for handling reset password functionality
const userResetPassword = async (req, res) => {
  try {
    const newPassword = req.body.password
    const resetToken = req.params.resetToken;

    // Verify reset token
    const decodedToken = jwt.verify(resetToken, process.env.JWT_RESET_SECRET);
    if (!decodedToken || !decodedToken.email) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset password link",
      });
    }

    const email = decodedToken.email;

    // Find the user by email
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid Email",
      });
    }

    // Update user's password
    user.password = newPassword; // Assuming password is already hashed in the model
    await user.save();

    // Send response
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Error in reset password:", err.message); // Log the error
    res.status(500).json({
      // Send internal server error response
      success: false,
      message: "Failed to reset password. Please try again later.",
    });
  }
};

//TODO: Controller function for handling reset password functionality
const userChangePassword = async (req, res) => {
  try {
    const newPassword = req.body.password;
    const email = req.user.email;

    // Find the user by email
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid Email",
      });
    }

    // Update user's password
    user.password = newPassword; // Assuming password is already hashed in the model
    await user.save();

    // Send response
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Error in Change password:", err.message); // Log the error
    res.status(500).json({
      // Send internal server error response
      success: false,
      message: "Failed to Change password. Please try again later.",
    });
  }
};

//TODO: Controller function for adding a product to user's wishlist
const addProductToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedObject = {
      $push: {
        wishlist: req.body.productId,
      },
    };
    await UserModel.findByIdAndUpdate(userId, updatedObject); // Updating user document with new wishlist
    // Sending success response
    res.json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (err) {
    console.error("Error adding product to wishlist:", err.message); // Log the error
    res.status(500).json({
      // Send internal server error response
      success: false,
      message: "Failed to add product to wishlist. Please try again later.",
    });
  }
};

//TODO: Controller function for getting user's wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id, "wishlist").populate(
      "wishlist",
      "title price"
    );
    res.json({
      success: true,
      result: user,
    });
  } catch (err) {
    console.error("Error getting wishlist:", err.message); // Log the error
    res.status(500).json({
      success: false,
      message: "Failed to get wishlist. Please try again later.",
    });
  }
};

//TODO: Controller function for saving user's address
const saveUserAddress = async (req, res) => {
  try {
    const address = req.body; // Extracting address details from request body
    let setObj = {};
    if (address.address) {
      setObj["address.address"] = address.address; // Updating address fields if provided
    }
    if (address.city) {
      setObj["address.city"] = address.city;
    }
    if (address.state) {
      setObj["address.state"] = address.state;
    }
    if (address.pincode) {
      setObj["address.pincode"] = address.pincode;
    }
    const updatedObject = {
      $set: setObj, // Creating $set object for updating address fields
    };
    // Updating user document with new address details
    const updatedAddress = await UserModel.findByIdAndUpdate(
      req.user._id,
      updatedObject,
      { new: true }
    );
    res.json({
      status: true,
      message: "User address saved",
    });
  } catch (err) {
    console.error("Error saving user address:", err.message);
    res.status(500).json({
      status: false,
      message: "Failed to save user address. Please try again later.",
    });
  }
};

module.exports = {
  userLogin,
  userLogout,
  userRegister,
  userForgotPassword,
  addProductToWishlist,
  getWishlist,
  saveUserAddress,
  userResetPassword,
  userChangePassword,
};
