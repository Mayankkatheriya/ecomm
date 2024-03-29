const mongoose = require("mongoose"); // Importing mongoose for MongoDB schema modeling
const bcrypt = require("bcrypt"); // Importing bcrypt for password hashing

// Defining the schema for user address
const AddressSchema = new mongoose.Schema({
  address: {
    type: String,
    required: false,
    default: "",
  },
  city: {
    type: String,
    required: false,
    default: "",
  },
  state: {
    type: String,
    required: false,
    default: "",
  },
  pincode: {
    type: String,
    required: false,
    default: "",
  },
});

// Defining the schema for user
const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  wishlist: {
    type: [mongoose.Schema.Types.ObjectId], // Array of ObjectIds referencing products
    default: [], // Default value is an empty array
    ref: "products", // Referencing the "products" collection
  },
  address: {
    type: AddressSchema // Embedding the AddressSchema into the UserSchema
  },
  token: {
    type: String,
  }
  //for multiple login [token1, token2]
  // token: {
  //   type: [String],
  //   validate: {
  //     validator: function(tokens) {
  //       return tokens.length <= 2;
  //     },
  //     message: "Token array length cannot be greater than 2"
  //   }
  // }
});

// Middleware to hash the password before saving
UserSchema.pre("save", function (next) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(this.password, salt);
  this.password = hash;
  next(); // Call next to proceed to the next middleware or save operation
});

// Method to compare entered password with hashed password
UserSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Creating a mongoose model for the UserSchema
const UserModel = mongoose.model("users", UserSchema);

module.exports = { UserModel, AddressSchema }; // Exporting UserModel and AddressSchema for use in other files
