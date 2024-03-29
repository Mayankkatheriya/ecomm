const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const coupanRoutes = require("./routes/coupan");
const orderRoutes = require("./routes/order");
const { authMiddleware } = require("./middlewares/auth");
const rateLimit = require("express-rate-limit");
const MongoStore = require("rate-limit-mongo");

dotenv.config();
const app = express();

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.log("conection failed"));

// const limiter = rateLimit({
//   windowMs: 5 * 60 * 1000, // 1 mins
//   max: 2, // limit each IP to 10 requests per window
// });

var limiter = rateLimit({
  store: new MongoStore({
    uri: process.env.DB_URL,
    expireTimeMs: 1 * 60 * 1000,
    message: {
      messgae: "You can only make 50 requests every hour.",
    },
  }),
  max: 50,
  // should match expireTimeMs
  windowMs: 1 * 60 * 1000,
});

app.use(limiter);
app.use(cors());
app.use(express.json());
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/cart",authMiddleware(["admin", "seller", "buyer"]), cartRoutes);
app.use("/api/v1/coupan", coupanRoutes);
app.use("/api/v1/order", authMiddleware(["admin", "buyer"]), orderRoutes);

app.listen(process.env.PORT, () => {
  console.log(`server is up and running on port ${process.env.PORT}`);
});
