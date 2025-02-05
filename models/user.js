const mongoose = require("mongoose");
const userScheme = new mongoose.Schema({
  name: { type: String, required: true },
  phone: Number,
  message: Number,
});
// определяем модель User
module.exports = mongoose.model("user", userScheme);
