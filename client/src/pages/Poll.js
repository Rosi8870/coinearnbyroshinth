import { useEffect, useState, useContext } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Poll() {
  const { user } = useContext(AuthContext);

  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    fetchPoll();
  }, []);

  const fetchPoll = async () => {
    try {
      const res = await API.get("/poll");
      setPoll(res.data);
    } catch {
      toast.error("No poll available");
    }
  };

  const handleVote = async () => {
    if (selected === null) {
      toast.error("Select an option");
      return;
    }

    try {
      const res = await API.post("/poll/vote", {
        optionIndex: selected
      });

      toast.success(res.data.message);

      const updated = { ...user, coins: res.data.coins };
      localStorage.setItem("user", JSON.stringify(updated));

      setVoted(true);
      fetchPoll();
    } catch (err) {
      toast.error(err.response?.data?.message);
      setVoted(true);
      fetchPoll();
    }
  };

  if (!poll) return null;

  const totalVotes = poll.options.reduce(
    (sum, opt) => sum + opt.votes,
    0
  );

  return (
    <Layout>
      <h2 className="text-cyan-400 text-2xl font-semibold mb-8">
        🗳 Daily Poll
      </h2>

      <div className="bg-[#1e293b] p-8 rounded-2xl shadow-lg">

        <h3 className="text-xl font-semibold mb-8">
          {poll.question}
        </h3>

        <div className="space-y-6">
          {poll.options.map((opt, index) => {
            const percent =
              totalVotes > 0
                ? ((opt.votes / totalVotes) * 100).toFixed(1)
                : 0;

            return (
              <div key={index}>

                {/* Option Button */}
                <div
                  onClick={() => !voted && setSelected(index)}
                  className={`p-4 rounded-xl cursor-pointer transition duration-300 border ${
                    selected === index
                      ? "border-cyan-400 bg-[#0f172a]"
                      : "border-gray-700 bg-[#111827] hover:border-cyan-400"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">
                      {opt.text}
                    </span>

                    {voted && (
                      <span className="text-sm text-gray-400">
                        {percent}%
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {voted && (
                    <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-2 bg-cyan-500 transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  )}

                  {voted && (
                    <p className="text-xs text-gray-500 mt-2">
                      {opt.votes} votes
                    </p>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {!voted && (
          <button
            onClick={handleVote}
            className="mt-8 w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-semibold transition"
          >
            Submit Vote (+10 Coins)
          </button>
        )}
      </div>
    </Layout>
  );
}
