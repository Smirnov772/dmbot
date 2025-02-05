const mongoose = require("mongoose");
const callCenterScheme = new mongoose.Schema({
  question: String,

  userId: String,
  question: String,
  userMessageId: String,
  admin: {
    // adminChatId: String,
    // adminMessageId: String,
  },
});
// определяем модель User
module.exports = mongoose.model("callCenter", callCenterScheme);
