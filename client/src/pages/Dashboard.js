import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import InstallPrompt from "../components/InstallPrompt";
import ActivityFeed from "../components/ActivityFeed";
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
    <>
      <InstallPrompt />
      <Layout>
        <ActivityFeed />
        <div className="max-w-2xl mx-auto w-full px-2 sm:px-4 md:px-0">
          {/* Welcome & Coins */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 mb-6">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white mb-1">Welcome <span className="text-cyan-400">{user?.username}</span></h2>
              {/* Coin balance and logout button are now only in the sidebar/topbar, not here */}
            </div>
            <button onClick={() => navigate("/leaderboard")} className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-semibold transition text-white w-full sm:w-auto">View Leaderboard</button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard title="Total Coins" value={user?.coins} color="bg-yellow-500 text-black" />
            <StatCard title="Daily Streak" value={`🔥 ${user?.dailyStreak || 0}`} color="bg-orange-500 text-white" />
            <StatCard title="Today's Tasks" value="5 Available" color="bg-cyan-500 text-white" />
          </div>

          {/* Referral Code */}
          <div className="mb-6 bg-[#232b3b] p-4 rounded-xl shadow flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Your Referral Code</span>
              <button onClick={copyReferral} className="bg-gray-700 p-2 rounded hover:bg-gray-600 transition ml-2">
                <Copy size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold text-xl tracking-widest">{user?.referralCode}</span>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <FeatureCard
              title="Daily Login"
              desc="Earn streak rewards"
              action={dailyLogin}
              icon={<span className="text-orange-400">🔥</span>}
              buttonText="Claim"
            />
            <FeatureCard
              title="Watch Video"
              desc="Earn 40 coins"
              action={() => navigate("/watch-video")}
              icon={<span className="text-cyan-400">▶️</span>}
              buttonText="Watch"
            />
            <FeatureCard
              title="Poll"
              desc="Earn 10 coins"
              action={() => navigate("/poll")}
              icon={<span className="text-pink-400">📊</span>}
              buttonText="Vote"
            />
            <FeatureCard
              title="Spin Wheel"
              desc="Win up to 50 coins"
              action={() => navigate("/spin-wheel")}
              icon={<span className="text-purple-400">🎡</span>}
              buttonText="Spin"
            />
            <FeatureCard
              title="Tap & Earn"
              desc="Tap to earn coins"
              action={() => navigate("/tap-game")}
              icon={<span className="text-yellow-400"></span>}
              buttonText="Play"
            />
            <FeatureCard
              title="Scratch Card"
              desc="Scratch to win"
              action={() => navigate("/scratch-card")}
              icon={<span className="text-gray-400">🎫</span>}
              buttonText="Scratch"
            />
            <FeatureCard
              title="Missions"
              desc="Complete tasks"
              action={() => navigate("/missions")}
              icon={<span className="text-red-400">🚀</span>}
              buttonText="View"
            />
            <FeatureCard
              title="Jackpot"
              desc="Win 15,000+ coins"
              action={() => navigate("/jackpot")}
              icon={<span className="text-yellow-500">🎰</span>}
              buttonText="Buy Ticket"
            />
          </div>
        </div>
      </Layout>
    </>
  );
}

// Stat Card
function StatCard({ title, value, color }) {
  return (
    <div className={`${color} p-4 rounded-xl shadow flex flex-col items-center min-h-[90px]`}>
      <span className="text-xs font-medium opacity-80 mb-1">{title}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}

// Feature Card
function FeatureCard({ title, desc, action, icon, buttonText }) {
  return (
    <div className="bg-[#1e293b] p-5 rounded-xl shadow hover:scale-[1.03] hover:shadow-xl transition duration-300 flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-2xl">{icon}</span>}
        <span className="text-lg font-semibold">{title}</span>
      </div>
      <span className="text-gray-400 text-sm mb-2">{desc}</span>
      <button
        onClick={action}
        className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded-lg font-semibold transition text-white mt-auto"
      >
        {buttonText || "Start"}
      </button>
    </div>
  );
}
