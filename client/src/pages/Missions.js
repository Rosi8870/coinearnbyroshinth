import { useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import API from "../services/api";
import { Play, RotateCw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Missions() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const missions = [
    { id: 'mission_spin', title: 'Spin the Wheel', reward: 50, icon: <RotateCw />, action: '/spin-wheel' },
    { id: 'mission_tap', title: 'Tap 500 Times', reward: 100, icon: <Zap />, action: '/tap-game' },
    { id: 'mission_video', title: 'Watch a Video', reward: 75, icon: <Play />, action: '/watch-video' },
  ];

  const handleClaim = async (id, reward) => {
    try {
        const res = await API.post("/rewards/earn", { type: 'mission', amount: reward, missionId: id });
        setUser(prev => ({ ...prev, coins: res.data.coins, completedMissions: res.data.completedMissions }));
        toast.success(`Claimed ${reward} coins!`);
    } catch (err) {
        toast.error(err.response?.data?.message || "Mission not completed or already claimed.");
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-cyan-400 mb-8 flex items-center gap-2">
          🚀 Daily Missions
        </h2>

        <div className="space-y-4">
          {missions.map((mission) => (
            <div key={mission.id} className="bg-[#1e293b] p-4 rounded-xl flex items-center justify-between shadow-lg border border-gray-700">
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(mission.action)}>
                <div className="bg-cyan-500/20 p-3 rounded-lg text-cyan-400">
                  {mission.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{mission.title}</h3>
                  <p className="text-yellow-400 font-medium">+{mission.reward} Coins</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleClaim(mission.id, mission.reward)}
                disabled={user?.completedMissions?.some(m => m.missionId === mission.id && new Date(m.completedAt).toDateString() === new Date().toDateString())}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
              >
                {user?.completedMissions?.some(m => m.missionId === mission.id && new Date(m.completedAt).toDateString() === new Date().toDateString()) ? 'Done' : 'Claim'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}