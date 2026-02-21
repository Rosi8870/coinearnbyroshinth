const mongoose = require("mongoose");

const jackpotSchema = new mongoose.Schema({
  pot: { type: Number, default: 15000 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  winners: [{
    username: String,
    amount: Number,
    date: Date
  }]
});

module.exports = mongoose.model("Jackpot", jackpotSchema);