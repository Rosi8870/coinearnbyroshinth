import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import AdminPanel from "./pages/AdminPanel";
import WatchVideo from "./pages/WatchVideo";
import Poll from "./pages/Poll";

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
