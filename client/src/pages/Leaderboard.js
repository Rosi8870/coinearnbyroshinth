import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import { Crown } from "lucide-react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    API.get("/rewards/leaderboard")
      .then((res) => setLeaders(res.data))
      .catch(() => console.log("Error loading leaderboard"));
  }, []);

  return (
    <Layout>

      <div className="max-w-4xl mx-auto">

        <h2 className="text-2xl font-semibold text-cyan-400 mb-8">
          🏆 Leaderboard
        </h2>

        <div className="bg-[#111827] rounded-2xl shadow-xl overflow-hidden">

          {leaders.map((user, index) => {

            const rank = index + 1;

            const medalColor =
              rank === 1
                ? "text-yellow-400"
                : rank === 2
                ? "text-gray-300"
                : rank === 3
                ? "text-orange-400"
                : "text-gray-500";

            const bgHighlight =
              rank <= 3 ? "bg-gray-800/40" : "";

            return (
              <div
                key={user._id}
                className={`flex items-center justify-between px-6 py-4 border-b border-gray-800 ${bgHighlight}`}
              >

                {/* Left Section */}
                <div className="flex items-center gap-4">

                  <span className={`font-bold text-lg ${medalColor}`}>
                    {rank <= 3 ? (
                      <Crown size={20} className={medalColor} />
                    ) : (
                      `#${rank}`
                    )}
                  </span>

                  <span className="text-white font-medium">
                    {user.username}
                  </span>

                </div>

                {/* Coins */}
                <div className="bg-yellow-500 text-black px-4 py-1 rounded-lg font-semibold text-sm">
                  {user.coins} Coins
                </div>

              </div>
            );
          })}

        </div>

      </div>

    </Layout>
  );
}
