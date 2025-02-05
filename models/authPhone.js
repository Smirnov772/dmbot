const mongoose = require("mongoose");
const authPhoneScheme = new mongoose.Schema({
  phone: {type: Number},
});
// определяем модель User
module.exports = mongoose.model("authPhone", authPhoneScheme);
