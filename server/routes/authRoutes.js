const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const TaskLog = require("../models/TaskLog");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password, referralCode } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newReferralCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    user = new User({
      username,
      email,
      password: hashedPassword,
      referralCode: newReferralCode,
      referredBy: referralCode || null,
    });

    await user.save();

    // 💰 Give referral reward
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });

      if (referrer) {
        referrer.coins += 500;
        await referrer.save();

        await TaskLog.create({
          userId: referrer._id,
          type: "referral-bonus",
          coinsEarned: 500,
        });
      }
    }

    res.json({ message: "Registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        referralCode: user.referralCode,
        role: user.role,
        lastSpin: user.lastSpin,
        lastScratch: user.lastScratch,
        completedMissions: user.completedMissions,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOAD USER (Fix for "refresh it gone")
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
