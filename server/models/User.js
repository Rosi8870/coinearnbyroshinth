const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
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

    coins: {
      type: Number,
      default: 0,
    },

    referralCode: {
      type: String,
      unique: true,
    },

    referredBy: {
      type: String,
      default: null,
    },

    lastDailyLogin: {
      type: Date,
    },

    dailyStreak: {
      type: Number,
      default: 0,
    },

    // 🔥 Video Reward Control
    lastVideoReward: {
      type: Date,
    },
    lastPollVote: Date,
    
    lastSpin: Date,
    lastScratch: Date,
    completedMissions: [{
        missionId: String,
        completedAt: Date
    }],

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
