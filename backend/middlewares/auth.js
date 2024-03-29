var jwt = require("jsonwebtoken");
const { UserModel } = require("../models/user");
require("dotenv").config();

// Middleware function for authentication and authorization
const authMiddleware = (role) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    // Verify JWT token and check expiration
    const data = jwt.verify(token, process.env.JWT_SECRETE_KEY);
    // Decode JWT payload to get user role
    const payload = jwt.decode(token);
    if (!payload) {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }
    // Check if user role is authorized for the route
    if (role.includes(payload.role)) {
      const user = await UserModel.findById(payload.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      if(!user.token) {
        return res.status(404).json({ success: false, message: "You are logged out" });
      }
      req.user = user; // Attach user object to request for use in subsequent middleware or route handlers
      next();
    } else {
      res.status(403).json({ success: false, message: "Forbidden" });
    }
  } catch (err) {
    console.error("Authentication error:", err.message);
    res.status(403).json({ success: false, message: "Forbidden" });
  }
};

module.exports = { authMiddleware }; // Export authMiddleware for use in other parts of the application
