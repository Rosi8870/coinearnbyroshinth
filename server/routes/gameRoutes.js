const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { buyUpgrade, getJackpot, buyTicket } = require("../controllers/gameController");

router.post("/upgrade", protect, buyUpgrade);
router.get("/jackpot", protect, getJackpot);
router.post("/jackpot/buy", protect, buyTicket);

module.exports = router;