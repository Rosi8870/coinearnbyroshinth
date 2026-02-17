require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const pollRoutes = require("./routes/pollRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// 🔥 Connect MongoDB
connectDB();

// 🔐 Security Middlewares
app.use(cors({
  origin: "http://localhost:3000", // change in production
  credentials: true
}));

app.use(express.json());

// 🚫 Rate Limiting (Anti-Spam)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: "Too many requests. Try again later."
});

app.use(limiter);

// 📌 Routes
app.use("/api/auth", authRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/poll", pollRoutes);
app.use("/api/admin", adminRoutes);

// 🏠 Root Route
app.get("/", (req, res) => {
  res.send("CoinApp API Running 🚀");
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
