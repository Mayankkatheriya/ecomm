const { CartModel } = require("../models/cart");
const { ProductModel } = require("../models/products");

//TODO Controller to create or update user cart
const createCart = async (req, res) => {
  try {
    // Extract products and user ID from request
    const { products } = req.body;
    const userId = req.user._id;

    // Find the user's cart in the database
    let userCart = await CartModel.findOne({ userId });

    // Retrieve details of all products in the request
    const productIds = products.map(product => product.productId);
    const productDetails = await ProductModel.find({ _id: { $in: productIds } });

    // Check if all products in the request are found in the database
    if (productDetails.length !== productIds.length) {
      return res.status(400).json({
        status: false,
        message: "Some products are not found.",
      });
    }

    // Update products with their prices from the database
    const updatedProducts = products.map(product => {
      const foundProduct = productDetails.find(p => p._id.toString() === product.productId.toString());
      if (!foundProduct) {
        throw new Error(`Product with ID ${product.productId} not found.`);
      }
      return {
        ...product,
        price: foundProduct.price
      };
    });

    // Retrieve existing products in the user's cart
    const updatedProductIds = updatedProducts.map(product => product.productId);
    const existingProducts = userCart ? userCart.products.filter(product => updatedProductIds.includes(product.productId.toString())) : [];

    // Identify new products to be added to the cart
    const newProducts = updatedProducts.filter(product => !existingProducts.some(p => p.productId.toString() === product.productId.toString()));

    // Calculate the total price of the cart
    const cartTotal = updatedProducts.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);

    // Create or update the user's cart in the database
    if (!userCart) {
      userCart = await CartModel.create({
        products: updatedProducts,
        cartTotal,
        userId
      });
    } else {
      existingProducts.forEach(existingProduct => {
        const updatedProduct = updatedProducts.find(product => product.productId.toString() === existingProduct.productId.toString());
        existingProduct.quantity += updatedProduct.quantity;
      });

      userCart.products.push(...newProducts);
      userCart.cartTotal += cartTotal;

      await userCart.save();
    }

    // Send success response
    res.json({
      status: true,
      message: "User cart updated successfully",
    });
  } catch (error) {
    // Handle errors
    console.error("Error creating cart:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};

//TODO Controller to get user cart
const getCart = async (req, res) => {
  try {
    // Extract user ID from request
    const userId = req.user._id;

    // Find user's cart details in the database
    const cartDetails = await CartModel.find({ userId });

    // Send cart details in the response
    res.json({
      status: true,
      message: "getCart api",
      result: cartDetails
    });
  } catch (error) {
    // Handle errors
    console.error("Error fetching cart:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { createCart, getCart };
