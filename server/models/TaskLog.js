const mongoose = require("mongoose");

const taskLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String,
  coinsEarned: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TaskLog", taskLogSchema);
