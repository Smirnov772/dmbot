const mongoose = require("mongoose");
const bestQuestionScheme = new mongoose.Schema({
  question: String,
  message: Number,
});
// определяем модель User
module.exports = mongoose.model("bestQuestion", bestQuestionScheme);
