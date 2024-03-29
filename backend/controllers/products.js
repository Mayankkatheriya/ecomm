const { ProductModel } = require("../models/products");

//TODO: Controller to create a new product
const createProduct = async (req, res) => {
  try {
    const body = req.body; // Extract the product data from the request body
    const newProduct = await ProductModel.create(body); // Create a new product using the ProductModel
    res.json({
      status: true,
      message: "Product created successfully",
      productId: newProduct._id,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

//TODO: Controller to get all products or by title
const getProduct = async (req, res) => {
  try {
    let products;
    const titleQuery = req.query.title;
    if (titleQuery) {
      const regex = new RegExp(titleQuery, "i");
      products = await ProductModel.find({ title: regex });
    } else {
      // Retrieve all products from the database
      products = await ProductModel.find({});
    }
    res.json({
      status: true,
      message: "Products retrieved successfully",
      result: products,
      total: products.length,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: false,
      message: "Error retrieving products",
      error: error.message,
    });
  }
};

//TODO: Controller to get all products by category
const getProductByCategory = async (req, res) => {
  try {
    let products;
    const category = req.query.category;
    console.log(category);
    if (category) {
      const regex = new RegExp(category, "i");
      products = await ProductModel.find({ category: regex });
    } else {
      // Retrieve all products from the database
      products = await ProductModel.find({});
    }
    res.json({
      status: true,
      message: "Products retrieved successfully",
      result: products,
      total: products.length,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: false,
      message: "Error retrieving products",
      error: error.message,
    });
  }
};

//TODO: Controller to edit product details
const editProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const updatedFields = req.body;
    // Update the product with the provided ID using the updated fields
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $set: updatedFields }, // Using $set to update specific fields
      { new: true } // Return the updated product
    );
    res.json({
      status: true,
      message: "Product updated successfully",
      updatedProduct: updatedProduct,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

//TODO: Controller to delete product details
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    // delete the product with the provided ID
    await ProductModel.findByIdAndDelete(productId);
    res.json({
      status: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

//TODO: Controller to handle like/dislike actions on a product
const likeDislikeController = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;
    const action = req.params.action;

    // Define update operations based on the action
    let updateObject = {
      $addToSet: { likes: userId }, // Push the user ID to likes array
      $pull: { dislikes: userId }, // Remove the user ID from dislikes array
      // $inc: { likesCount: 1 }, // Increment likesCount
    };

    if (action === "dislikes") {
      // If action is dislike, adjust update operations accordingly
      updateObject = {
        $addToSet: { dislikes: userId },
        $pull: { likes: userId },
        // $inc: { likesCount: -1 }, // Decrement likesCount
      };
    }

    // Perform the update operation on the product
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      updateObject,
      { new: true } // Return the updated product
    );

    // Send success response
    res.json({
      status: true,
      message: `Product ${action} successfully`,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      status: false,
      message: `Error processing ${action} action`,
      error: error.message,
    });
  }
};

//TODO: Controller to get details of a product
const productDetailsController = async (req, res) => {
  try {
    const id = req.query.productid;
    // Retrieve the product details from the database and populate related fields
    const product = await ProductModel.findById(id)
      .populate({
        path: "likes",
        select: "-password -token -wishlist -role -address", // Exclude password field from populated likes
      })
      .populate({
        path: "dislikes",
        select: "firstname lastname email",
      })
      .populate({
        path: "reviews",
        populate: {
          path: "userId",
          select: "firstname lastname email",
        },
      });

    // Send the product details as a response
    res.json({
      status: true,
      message: "Get product by Id",
      result: product,
    });
  } catch (error) {
    // Handle errors if product details retrieval fails
    console.log(error.message);
    res.status(500).json({
      status: false,
      message: "Error getting product details",
      error: error.message,
    });
  }
};

//TODO: Controller to add or update a review for a product
const reviewProductController = async (req, res) => {
  try {
    const body = req.body; // Extract the review data from the request body
    const productId = req.params.productId; // Extract the product ID from the request parameters
    const userId = req.user._id; // Extract the user ID from the request

    // Find the product by ID
    const product = await ProductModel.findById(productId);
    // Check if the user has already reviewed the product
    const review = product.reviews.find(
      (review) => review.userId.toString() === userId.toString()
    );

    if (review) {
      // If the user has already reviewed, update the existing review
      const findObject = {
        reviews: {
          $elemMatch: {
            userId: userId,
            rating: review.rating,
          },
        },
      };

      const updateObject = {
        $set: {
          "reviews.$.rating": body.rating, // Update the rating of the existing review
          "reviews.$.comment": body.comment, // Update the comment of the existing review
        },
      };

      await ProductModel.updateOne(findObject, updateObject);
    } else {
      // If the user has not reviewed, add a new review
      const updatedObject = {
        $push: {
          reviews: {
            rating: body.rating, // Add the rating to the new review
            comment: body.comment, // Add the comment to the new review
            userId: userId, // Add the user ID to the new review
          },
        },
      };

      // Update the product with the new review
      await ProductModel.findByIdAndUpdate(productId, updatedObject, {
        new: true,
      });
    }

    // Send success response
    res.json({
      status: true,
      message: "Review added successfully",
    });
  } catch (error) {
    // Handle errors if adding or updating review fails
    console.log(error.message);
    res.status(500).json({
      status: false,
      message: "Error reviewing product",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProduct,
  editProduct,
  likeDislikeController,
  productDetailsController,
  reviewProductController,
  deleteProduct,
  getProductByCategory,
};
