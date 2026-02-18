const express = require("express");
const User = require("../models/User");
const TaskLog = require("../models/TaskLog");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Daily Login
router.post("/daily-login", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const today = new Date();
    const todayStr = today.toDateString();

    if (
      user.lastDailyLogin &&
      new Date(user.lastDailyLogin).toDateString() === todayStr
    ) {
      return res.json({ message: "Already claimed today" });
    }

    // Calculate streak
    let newStreak = 1;
    if (user.lastDailyLogin) {
      const last = new Date(user.lastDailyLogin);
      const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        newStreak = (user.dailyStreak || 0) + 1;
      } else {
        newStreak = 1;
      }
    }

    user.coins += 10;
    user.lastDailyLogin = today;
    user.dailyStreak = newStreak;

    await user.save();

    await TaskLog.create({
      userId: user._id,
      type: "daily-login",
      coinsEarned: 10,
    });

    res.json({ coins: user.coins, dailyStreak: user.dailyStreak, message: `Daily login successful! Streak: ${user.dailyStreak}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generic Reward
router.post("/earn", auth, async (req, res) => {
  const { type, watchTime } = req.body;

  const user = await User.findById(req.user.id);
  let coinsToEarn = 0;

  if (type === "video") {
    coinsToEarn = 40; // Define reward amount on the server

    // Must watch 2 minutes
    if (watchTime < 120) {
      return res.status(400).json({
        message: "Watch at least 2 minutes"
      });
    }

    const today = new Date().toDateString();

    if (
      user.lastVideoReward &&
      new Date(user.lastVideoReward).toDateString() === today
    ) {
      return res.status(400).json({
        message: "Video reward already claimed today"
      });
    }

    user.lastVideoReward = new Date();
  }

  user.coins += coinsToEarn;
  await user.save();

  res.json({
    coins: user.coins,
    message: "Reward credited successfully"
  });
});


// LEADERBOARD
router.get("/leaderboard", async (req, res) => {
  try {
    const topUsers = await User.find({ role: "user" })
      .sort({ coins: -1 })
      .limit(10)
      .select("username coins");

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
