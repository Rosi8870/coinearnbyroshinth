import { useEffect, useRef, useState, useContext } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function WatchVideo() {
  const { earnCoins } = useContext(AuthContext);

  const playerRef = useRef(null);
  const timerRef = useRef(null);

  const [watchTime, setWatchTime] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  const REQUIRED_TIME = 120; // 2 minutes

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Load YouTube API
  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("youtube-player", {
        videoId: "6aYL1T4J9es", // 🔁 Replace with your video ID
        playerVars: {
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onStateChange: onPlayerStateChange,
        },
      });
    };
  }, []);

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      startTimer();
    } else {
      stopTimer();
    }
  };

  const startTimer = () => {
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      setWatchTime((prev) => {
        const newTime = prev + 1;

        if (newTime >= REQUIRED_TIME) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setCompleted(true);
          toast.success("🎉 2 Minutes Completed! Claim reward.");
        }

        return newTime;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const handleClaim = async () => {
    if (!completed) {
      toast.error("Watch full 2 minutes");
      return;
    }

    try {
      await earnCoins("video", watchTime);
      setAlreadyClaimed(true);
    } catch {
      toast.error("Already claimed today");
    }
  };

  const progressPercent = Math.min(
    (watchTime / REQUIRED_TIME) * 100,
    100
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">

        <h2 className="text-2xl font-semibold text-cyan-400 mb-6">
          🎥 Watch & Earn
        </h2>

        <div className="bg-[#111827] p-6 md:p-8 rounded-2xl shadow-xl">

          {/* Video */}
          <div className="aspect-video mb-6 rounded-xl overflow-hidden">
            <div
              id="youtube-player"
              className="w-full h-full"
            ></div>
          </div>

          {/* Progress Section */}
          <div className="mb-6">

            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>
                {formatTime(watchTime)} / {formatTime(REQUIRED_TIME)}
              </span>
            </div>

            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-3 bg-cyan-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={!completed || alreadyClaimed}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              completed && !alreadyClaimed
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            {alreadyClaimed
              ? "Already Claimed Today"
              : completed
              ? "Claim 40 Coins"
              : "Watch Full Video to Unlock"}
          </button>

        </div>
      </div>
    </Layout>
  );
}
