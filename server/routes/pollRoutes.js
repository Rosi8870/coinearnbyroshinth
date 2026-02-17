const express = require("express");
const Poll = require("../models/Poll");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Get active poll
router.get("/", auth, async (req, res) => {
  const poll = await Poll.findOne().sort({ createdAt: -1 });
  res.json(poll);
});

// Vote
router.post("/vote", auth, async (req, res) => {
  const { optionIndex } = req.body;

  const user = await User.findById(req.user.id);

  const today = new Date().toDateString();

  if (
    user.lastPollVote &&
    new Date(user.lastPollVote).toDateString() === today
  ) {
    return res.status(400).json({
      message: "Already voted today"
    });
  }

  const poll = await Poll.findOne().sort({ createdAt: -1 });

  if (!poll)
    return res.status(404).json({ message: "No poll found" });

  poll.options[optionIndex].votes += 1;
  await poll.save();

  user.coins += 10;
  user.lastPollVote = new Date();
  await user.save();

  res.json({
    message: "Vote submitted +10 coins",
    coins: user.coins
  });
});

module.exports = router;
