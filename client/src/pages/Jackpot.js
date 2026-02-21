import { useState, useEffect, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Ticket, Clock, Trophy } from 'lucide-react';
import API from "../services/api";

export default function Jackpot() {
  const { user, setUser } = useContext(AuthContext);
  const [tickets, setTickets] = useState(0);
  const [pot, setPot] = useState(15000);
  const [timeLeft, setTimeLeft] = useState(86400); // 24 hours in seconds

  const TICKET_PRICE = 100;

  useEffect(() => {
    fetchJackpot();
  }, []);

  const fetchJackpot = async () => {
    try {
      const res = await API.get('/game/jackpot');
      setPot(res.data.pot);
      setTickets(res.data.tickets);
      const secondsLeft = Math.floor((new Date(res.data.endTime) - Date.now()) / 1000);
      setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
    } catch (err) {
      console.error("Failed to fetch jackpot");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleBuyTicket = async () => {
    if (user.coins < TICKET_PRICE) {
      toast.error("Not enough coins!");
      return;
    }

    try {
        const res = await API.post('/game/jackpot/buy');
        
        setUser(prev => ({ ...prev, coins: res.data.coins }));
        setTickets(res.data.tickets);
        setPot(res.data.pot);
        toast.success("Ticket purchased! Good luck! 🍀");
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to buy ticket");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center min-h-[80vh] py-8 px-4">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
          🎰 Daily Jackpot
        </h2>
        <p className="text-gray-400 mb-8">Win big every 24 hours!</p>

        {/* Pot Display */}
        <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-yellow-500/30 w-full max-w-md text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            
            <div className="flex justify-center mb-4">
                <Trophy size={48} className="text-yellow-400 animate-bounce" />
            </div>
            
            <h3 className="text-gray-400 text-sm uppercase tracking-widest mb-2">Current Pot</h3>
            <div className="text-5xl font-black text-white mb-6 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                {pot.toLocaleString()} <span className="text-2xl text-yellow-500">Coins</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-300 bg-gray-800/50 py-2 rounded-lg mb-6">
                <Clock size={18} />
                <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
            </div>

            <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700">
                <div className="text-left">
                    <p className="text-xs text-gray-400">Your Tickets</p>
                    <p className="text-2xl font-bold text-cyan-400">{tickets}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Win Chance</p>
                    <p className="text-2xl font-bold text-green-400">{tickets > 0 ? ((tickets / (pot/100)) * 100).toFixed(2) : 0}%</p>
                </div>
            </div>

            <button 
                onClick={handleBuyTicket}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
            >
                <Ticket size={24} />
                Buy Ticket ({TICKET_PRICE} Coins)
            </button>
        </div>

        {/* Recent Winners */}
        <div className="mt-12 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-yellow-500">🏆</span> Last Winners
            </h3>
            <div className="space-y-3">
                {[
                    { name: 'Rahul K.', amount: 12500, time: 'Yesterday' },
                    { name: 'Priya S.', amount: 8900, time: '2 days ago' },
                    { name: 'Amit B.', amount: 15200, time: '3 days ago' },
                ].map((winner, i) => (
                    <div key={i} className="bg-gray-800/50 p-3 rounded-lg flex justify-between items-center border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                                {winner.name[0]}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{winner.name}</p>
                                <p className="text-xs text-gray-500">{winner.time}</p>
                            </div>
                        </div>
                        <span className="text-yellow-400 font-bold">+{winner.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </Layout>
  );
}