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
  try {
    const { type, watchTime, amount, missionId } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    let coinsToEarn = 0;
    const today = new Date().toDateString();

    if (type === "video") {
      coinsToEarn = 40; // Define reward amount on the server

      // Must watch 2 minutes
      if (watchTime < 120) {
        return res.status(400).json({
          message: "Watch at least 2 minutes"
        });
      }
 
      if (
        user.lastVideoReward &&
        new Date(user.lastVideoReward).toDateString() === today
      ) {
        return res.status(400).json({
          message: "Video reward already claimed today"
        });
      }
 
      user.lastVideoReward = new Date();
    } else if (type === "spin") {
        if (user.lastSpin && new Date(user.lastSpin).toDateString() === today) {
            return res.status(400).json({ message: "Already spun today" });
        }
        coinsToEarn = parseInt(amount) || 0;
        if (coinsToEarn > 50) coinsToEarn = 50; // Server-side cap
        user.lastSpin = new Date();
    } else if (type === "scratch") {
        if (user.lastScratch && new Date(user.lastScratch).toDateString() === today) {
            return res.status(400).json({ message: "Already scratched today" });
        }
        coinsToEarn = parseInt(amount) || 0;
        if (coinsToEarn > 100) coinsToEarn = 100; // Server-side cap
        user.lastScratch = new Date();
    } else if (type === "tap") {
        coinsToEarn = parseInt(amount) || 0;
        // Optional: Add rate limiting logic here
    } else if (type === "mission") {
        if (!missionId) return res.status(400).json({ message: "Mission ID required" });
        
        const alreadyDone = user.completedMissions.some(m => m.missionId === missionId && new Date(m.completedAt).toDateString() === today);
        if (alreadyDone) return res.status(400).json({ message: "Mission already claimed today" });
 
        coinsToEarn = parseInt(amount) || 0;
        user.completedMissions.push({ missionId, completedAt: new Date() });
    }

    user.coins += coinsToEarn;
    await user.save();
    
    // Log task
    if (coinsToEarn > 0) {
        await TaskLog.create({
            userId: user._id,
            type: type,
            coinsEarned: coinsToEarn,
        });
    }

    res.json({
      coins: user.coins,
      lastSpin: user.lastSpin,
      lastScratch: user.lastScratch,
      completedMissions: user.completedMissions,
      message: "Reward credited successfully"
    });
  } catch (error) {
    console.error("Earn Error:", error);
    res.status(500).json({ message: "Server error processing reward" });
  }
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
