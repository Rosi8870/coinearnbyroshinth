import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user, dailyLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect admin to their panel
  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
    }
  }, [user, navigate]);

  const copyReferral = () => {
    navigator.clipboard.writeText(user?.referralCode);
    toast.success("Referral code copied!");
  };

  return (
    <Layout>

      {/* 🔥 Top Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">

        <StatCard
          title="Total Coins"
          value={user?.coins}
          color="bg-yellow-500 text-black"
        />

        <StatCard
          title="Daily Streak"
          value={`🔥 ${user?.dailyStreak || 0}`}
          color="bg-orange-500"
        />

        <StatCard
          title="Today's Tasks"
          value="3 Available"
          color="bg-cyan-500"
        />

      </div>

      {/* 🔥 Referral Box */}
      <div className="mb-10 bg-[#1e293b] p-6 md:p-8 rounded-2xl shadow-lg flex flex-col md:flex-row md:justify-between md:items-center gap-6">

        <div>
          <p className="text-gray-400 mb-2">
            Your Referral Code
          </p>

          <div className="flex items-center gap-3">
            <p className="text-cyan-400 font-bold text-2xl">
              {user?.referralCode}
            </p>

            <button
              onClick={copyReferral}
              className="bg-gray-700 p-2 rounded hover:bg-gray-600 transition"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate("/leaderboard")}
          className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl font-semibold transition"
        >
          View Leaderboard
        </button>
      </div>

      {/* 🔥 Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <FeatureCard
          title="Daily Login"
          desc="Earn streak rewards"
          action={dailyLogin}
        />

        <FeatureCard
          title="Watch Video"
          desc="Earn 40 coins"
          action={() => navigate("/watch-video")}
        />

        <FeatureCard
          title="Poll"
          desc="Earn 10 coins"
          action={() => navigate("/poll")}
        />

      </div>

    </Layout>
  );
}

/* 🔥 Stat Card Component */
function StatCard({ title, value, color }) {
  return (
    <div className={`${color} p-6 rounded-2xl shadow-lg`}>
      <p className="text-sm opacity-80 mb-2">
        {title}
      </p>
      <h2 className="text-2xl font-bold">
        {value}
      </h2>
    </div>
  );
}

/* 🔥 Feature Card Component */
function FeatureCard({ title, desc, action }) {
  return (
    <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg hover:scale-105 hover:shadow-xl transition duration-300">

      <h3 className="text-xl font-semibold mb-2">
        {title}
      </h3>

      <p className="text-gray-400 mb-6">
        {desc}
      </p>

      <button
        onClick={action}
        className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded-lg font-semibold transition"
      >
        Start
      </button>

    </div>
  );
}
