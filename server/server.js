require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const pollRoutes = require("./routes/pollRoutes");
const adminRoutes = require("./routes/adminRoutes");
const gameRoutes = require("./routes/gameRoutes");

const app = express();

// Trust proxy is required for rate limiting and secure cookies on platforms like Render
app.set('trust proxy', 1);

// 🔥 Connect MongoDB
connectDB();

// 🔐 Security Middlewares
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://coinearnnow.vercel.app',
    'https://www.coinearnbyroshinth.vercel.app'
  ],
  credentials: true
}));


app.use(express.json());

// 🚫 Rate Limiting (Anti-Spam)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: "Too many requests. Try again later."
});

app.use(limiter);

// 📌 Routes
app.use("/api/auth", authRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/poll", pollRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/game", gameRoutes);

// 🏠 Root Route
app.get("/", (req, res) => {
  res.send("CoinApp API Running 🚀");
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
