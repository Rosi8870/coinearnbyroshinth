import { useEffect, useState } from 'react';

const activities = [
  "🔥 Rahul just earned 500 coins!",
  "💸 Priya withdrew ₹50",
  "🎡 Amit won 50 coins on Spin Wheel",
  "🎫 Sneha bought a Jackpot ticket",
  "🚀 Vikram completed a mission",
  "🔥 Anjali reached a 7-day streak",
  "💸 Rohit withdrew ₹100",
  "🐹 Karan is playing Tap & Earn",
];

export default function ActivityFeed() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#1e293b]/50 border-y border-gray-700/50 py-2 overflow-hidden mb-4">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-center">
        <p className="text-sm text-gray-300 animate-fade-in-up transition-all duration-500 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
           {activities[current]}
        </p>
      </div>
      <style>{`
        @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(10px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}