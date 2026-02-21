const User = require("../models/User");
const Jackpot = require("../models/Jackpot");

const upgrades = {
  multitap: [
    { level: 1, cost: 0, value: 1 },
    { level: 2, cost: 500, value: 2 },
    { level: 3, cost: 2500, value: 3 },
    { level: 4, cost: 10000, value: 4 },
    { level: 5, cost: 50000, value: 5 },
  ],
  energyLimit: [
    { level: 1, cost: 0, value: 1000 },
    { level: 2, cost: 1000, value: 2000 },
    { level: 3, cost: 5000, value: 3000 },
    { level: 4, cost: 15000, value: 4000 },
    { level: 5, cost: 40000, value: 5000 },
  ],
};

exports.buyUpgrade = async (req, res) => {
  try {
    const { type } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    let currentLevel = 1;
    let upgradeList = [];
    let dbField = "";

    if (type === "multitap") {
      currentLevel = user.multitapLevel || 1;
      upgradeList = upgrades.multitap;
      dbField = "multitapLevel";
    } else if (type === "energyLimit") {
      currentLevel = user.energyLimitLevel || 1;
      upgradeList = upgrades.energyLimit;
      dbField = "energyLimitLevel";
    } else {
      return res.status(400).json({ message: "Invalid upgrade type" });
    }

    const nextLevelObj = upgradeList.find(u => u.level === currentLevel + 1);

    if (!nextLevelObj) {
      return res.status(400).json({ message: "Max level reached" });
    }

    if (user.coins < nextLevelObj.cost) {
      return res.status(400).json({ message: "Not enough coins" });
    }

    user.coins -= nextLevelObj.cost;
    user[dbField] = currentLevel + 1;
    await user.save();

    res.json({ 
      message: "Upgrade successful", 
      coins: user.coins, 
      [dbField]: user[dbField] 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getJackpot = async (req, res) => {
    try {
        // Find latest active jackpot or create
        let jackpot = await Jackpot.findOne().sort({ startTime: -1 });
        
        // Simple logic: if no jackpot or expired (24h), create new
        if (!jackpot || (Date.now() > new Date(jackpot.endTime).getTime())) {
             jackpot = await Jackpot.create({
                 pot: 15000,
                 startTime: Date.now(),
                 endTime: new Date(Date.now() + 24*60*60*1000), // 24 hours
                 participants: []
             });
        }

        const userTickets = jackpot.participants.filter(id => id.toString() === req.user.id).length;

        res.json({
            pot: jackpot.pot,
            endTime: jackpot.endTime,
            tickets: userTickets,
            totalTickets: jackpot.participants.length,
            winners: jackpot.winners 
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.buyTicket = async (req, res) => {
    try {
        const TICKET_PRICE = 100;
        const user = await User.findById(req.user.id);
        if (user.coins < TICKET_PRICE) {
            return res.status(400).json({ message: "Not enough coins" });
        }

        let jackpot = await Jackpot.findOne().sort({ startTime: -1 });
        if (!jackpot) return res.status(404).json({ message: "No active jackpot" });

        user.coins -= TICKET_PRICE;
        await user.save();

        jackpot.participants.push(user._id);
        jackpot.pot += TICKET_PRICE;
        await jackpot.save();

        res.json({ message: "Ticket purchased", coins: user.coins, tickets: jackpot.participants.filter(id => id.toString() === req.user.id).length, pot: jackpot.pot });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
