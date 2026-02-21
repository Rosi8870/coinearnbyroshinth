import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import AdminPanel from "./pages/AdminPanel";
import WatchVideo from "./pages/WatchVideo";
import Poll from "./pages/Poll";
import SpinWheel from "./pages/SpinWheel";
import TapGame from "./pages/TapGame";
import ScratchCard from "./pages/ScratchCard";
import Missions from "./pages/Missions";
import Jackpot from "./pages/Jackpot";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import Disclaimer from "./pages/Disclaimer";

import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <div className="bg-[#0f172a] min-h-screen text-white">
      <Router>

        {/* 🔔 Toast Notifications */}
        <Toaster position="top-right" />

        <Routes>

          {/* 🌍 Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/disclaimer" element={<Disclaimer />} />

          {/* 🔒 Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/watch-video"
            element={
              <PrivateRoute>
                <WatchVideo />
              </PrivateRoute>
            }
          />

          <Route
            path="/poll"
            element={
              <PrivateRoute>
                <Poll />
              </PrivateRoute>
            }
          />

          <Route
            path="/spin-wheel"
            element={
              <PrivateRoute>
                <SpinWheel />
              </PrivateRoute>
            }
          />

          <Route
            path="/tap-game"
            element={
              <PrivateRoute>
                <TapGame />
              </PrivateRoute>
            }
          />

          <Route
            path="/scratch-card"
            element={
              <PrivateRoute>
                <ScratchCard />
              </PrivateRoute>
            }
          />

          <Route
            path="/missions"
            element={
              <PrivateRoute>
                <Missions />
              </PrivateRoute>
            }
          />

          <Route
            path="/jackpot"
            element={
              <PrivateRoute>
                <Jackpot />
              </PrivateRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <PrivateRoute>
                <Leaderboard />
              </PrivateRoute>
            }
          />

          {/* 👑 Admin Only */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />

        </Routes>
      </Router>
    </div>
  );
}

export default App;
