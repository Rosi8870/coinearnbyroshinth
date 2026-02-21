import { useState, useEffect, useContext, useRef } from "react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { Zap, Trophy, ShoppingBag, ArrowUp } from "lucide-react";
import toast from 'react-hot-toast';
import API from "../services/api";

const upgrades = {
  multitap: [
    { level: 1, cost: 0, value: 1 },
    { level: 2, cost: 500, value: 2 },
    { level: 3, cost: 2500, value: 3 },
    { level: 4, cost: 10000, value: 4 },
    { level: 5, cost: 50000, value: 5 },
  ],
  energyLimit: [
    { level: 1, cost: 0, value: 1000 },
    { level: 2, cost: 1000, value: 2000 },
    { level: 3, cost: 5000, value: 3000 },
    { level: 4, cost: 15000, value: 4000 },
    { level: 5, cost: 40000, value: 5000 },
  ],
};

export default function TapGame() {
  const { user, setUser, earnCoins } = useContext(AuthContext);

  const multitapLevel = user?.multitapLevel || 1;
  const energyLimitLevel = user?.energyLimitLevel || 1;

  const currentMultitap = upgrades.multitap.find(u => u.level === multitapLevel) || upgrades.multitap[0];
  const nextMultitap = upgrades.multitap.find(u => u.level === multitapLevel + 1);

  const currentEnergyLimit = upgrades.energyLimit.find(u => u.level === energyLimitLevel) || upgrades.energyLimit[0];
  const nextEnergyLimit = upgrades.energyLimit.find(u => u.level === energyLimitLevel + 1);
  
  const coinsPerTapCycle = currentMultitap.value;
  const maxEnergy = currentEnergyLimit.value;

  const [energy, setEnergy] = useState(maxEnergy);
  const [pendingCoins, setPendingCoins] = useState(0);
  const [clicks, setClicks] = useState([]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  
  const pendingCoinsRef = useRef(0);
  const tapCountRef = useRef(0);
  const TAP_THRESHOLD = 25;

  useEffect(() => {
    pendingCoinsRef.current = pendingCoins;
  }, [pendingCoins]);

  // Regenerate Energy
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev) => Math.min(prev + 3, maxEnergy));
    }, 1000);
    return () => clearInterval(interval);
  }, [maxEnergy]);

  // Sync coins to server periodically
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (pendingCoinsRef.current > 0) {
        const amountToSync = pendingCoinsRef.current;
        
        // Reset pending immediately to prevent double sync
        setPendingCoins((prev) => prev - amountToSync);

        try {
          // Send to backend
          await earnCoins("tap", amountToSync);
        } catch (err) {
          console.error("Failed to sync coins", err);
          // In a real app, you might want to add these back to pending
        }
      }
    }, 2000); // Sync every 2 seconds

    return () => clearInterval(syncInterval);
  }, [earnCoins]);

  const handleInteraction = (e) => {
    if (energy <= 0) return;

    // Haptic feedback for mobile
    if (navigator.vibrate) navigator.vibrate(20);

    // 1. Decrease Energy
    setEnergy((prev) => prev - 1);

    // 2. Track taps for coin reward
    tapCountRef.current += 1;
    const isCoinEarned = tapCountRef.current >= TAP_THRESHOLD;

    if (isCoinEarned) {
      tapCountRef.current = 0;
      setPendingCoins((prev) => prev + coinsPerTapCycle);
      // 3. Optimistic UI update (update global user state immediately)
      setUser((prev) => ({ ...prev, coins: prev.coins + coinsPerTapCycle }));
    }

    // 4. Calculate Tilt & Position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt calculation (max 25 degrees)
    const rotateX = ((y - centerY) / centerY) * -25;
    const rotateY = ((x - centerX) / centerX) * 25;

    setTilt({ x: rotateX, y: rotateY });
    setTimeout(() => setTilt({ x: 0, y: 0 }), 100);

    // 5. Floating Text Animation
    const id = Date.now();
    const text = isCoinEarned ? `+${coinsPerTapCycle}` : `${tapCountRef.current}`;
    setClicks((prev) => [...prev, { id, x, y, text, isCoin: isCoinEarned }]);
    setTimeout(() => setClicks((prev) => prev.filter((c) => c.id !== id)), 1000);
  };

  const handleUpgrade = async (upgradeType) => {
    let nextUpgrade;
    let currentLevel;
    let levelKey;

    if (upgradeType === 'multitap') {
      nextUpgrade = nextMultitap;
      currentLevel = multitapLevel;
      levelKey = 'multitapLevel';
    } else if (upgradeType === 'energyLimit') {
      nextUpgrade = nextEnergyLimit;
      currentLevel = energyLimitLevel;
      levelKey = 'energyLimitLevel';
    }

    if (!nextUpgrade) {
      toast.error("Already at max level!");
      return;
    }

    if (user.coins < nextUpgrade.cost) {
      toast.error("Not enough coins!");
      return;
    }

    try {
      const res = await API.post('/game/upgrade', { type: upgradeType });

      setUser(prev => ({
        ...prev,
        coins: res.data.coins,
        [levelKey]: res.data[levelKey],
      }));

      if (upgradeType === 'energyLimit') {
          setEnergy(nextUpgrade.value);
      }

      toast.success(`Upgraded to Level ${currentLevel + 1}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upgrade failed.");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center min-h-[80vh] py-6 select-none overflow-hidden relative">
        
        {/* League / Level Header */}
        <div className="w-full max-w-md px-4 mb-6 z-10">
            <div className="flex justify-between items-center text-gray-400 text-sm font-medium mb-2">
                <span className="flex items-center gap-1"><Trophy size={14} className="text-yellow-500"/> Bronze League</span>
                <span>Level 1/10</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-300 h-full w-[20%]"></div>
            </div>
        </div>

        {/* Coin Balance */}
        <div className="flex flex-col items-center mb-8 z-10">
          <div className="flex items-center gap-3">
            <img src="https://cdn-icons-png.flaticon.com/512/1292/1292744.png" alt="Coin" className="w-10 h-10 animate-pulse" />
            <span className="text-5xl font-extrabold text-white drop-shadow-lg tracking-tight">{user?.coins?.toLocaleString()}</span>
          </div>
          <p className="text-gray-400 text-sm mt-1">Tap to earn</p>
        </div>

        {/* Tap Progress Bar */}
        <div className="w-full max-w-xs px-4 mb-8 z-10">
            <div className="w-full bg-gray-800/50 h-3 rounded-full overflow-hidden border border-gray-700/50">
                <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full"
                    style={{ width: `${(tapCountRef.current / TAP_THRESHOLD) * 100}%` }}
                ></div>
            </div>
            <p className="text-center text-gray-400 text-xs mt-1">{tapCountRef.current} / {TAP_THRESHOLD}</p>
        </div>

        {/* Main Tap Button */}
        <div className="relative z-10 mt-4">
          <div
            onPointerDown={handleInteraction}
            className={`
              w-72 h-72 rounded-full 
              bg-gradient-to-b from-[#facc15] to-[#ca8a04]
              shadow-[0_0_40px_rgba(250,204,21,0.5),0_10px_0_#b45309,inset_0_-10px_20px_rgba(0,0,0,0.2),inset_0_10px_20px_rgba(255,255,255,0.4)]
              border-8 border-[#fde047]
              flex items-center justify-center
              cursor-pointer touch-manipulation
              transition-transform duration-100 ease-out
              ${energy <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}
            `}
            style={{
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.x !== 0 ? 0.98 : 1})`,
            }}
          >
            <div className="w-[90%] h-[90%] rounded-full bg-gradient-to-b from-[#eab308] to-[#a16207] flex items-center justify-center shadow-inner relative overflow-hidden border-4 border-[#ca8a04]/30">
                 {/* Inner detail/shine */}
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50"></div>
                 <span className="text-9xl font-black text-[#fef08a] drop-shadow-[0_2px_0_rgba(161,98,7,1)] select-none pointer-events-none z-10">₹</span>
            </div>
          </div>

          {/* Floating Texts */}
          {clicks.map((click) => (
            <div
              key={click.id}
              className={`absolute pointer-events-none font-bold text-white animate-float-up ${click.isCoin ? 'text-5xl text-yellow-400 z-20' : 'text-2xl opacity-50 z-10'}`}
              style={{ 
                  left: click.x, 
                  top: click.y,
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}
            >
              {click.text}
            </div>
          ))}
        </div>

        {/* Energy Bar */}
        <div className="mt-auto w-full max-w-md px-6 pt-8 pb-2 z-10">
          <div className="flex justify-between text-white mb-2 font-bold items-end">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-800 rounded-lg">
                  <Zap className="text-yellow-400 fill-yellow-400" size={24} />
              </div>
              <div className="flex flex-col">
                  <span className="text-2xl font-bold">{energy}</span>
                  <span className="text-xs text-gray-400 font-normal">/ {maxEnergy}</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-800/80 backdrop-blur-sm rounded-full h-4 overflow-hidden border border-gray-700/50">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
              style={{ width: `${(energy / maxEnergy) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Boosts Section */}
        <div className="w-full max-w-md px-4 mt-4 z-10">
          <h3 className="text-lg font-bold text-center text-cyan-400 mb-3 flex items-center justify-center gap-2">
            <ShoppingBag size={20} /> Boosts
          </h3>
          <div className="space-y-2">
            {/* Multitap Upgrade */}
            <div className="bg-gray-800/50 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/20 p-2 rounded-md">
                  <span className="text-2xl">👆</span>
                </div>
                <div>
                  <p className="font-bold text-white">Multitap</p>
                  <p className="text-xs text-gray-400">Level {multitapLevel} (+{coinsPerTapCycle} Coin)</p>
                </div>
              </div>
              {nextMultitap ? (
                <button onClick={() => handleUpgrade('multitap')} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-cyan-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={user.coins < nextMultitap.cost}>
                  <ArrowUp size={16} />
                  <span>{nextMultitap.cost.toLocaleString()}</span>
                </button>
              ) : (
                <span className="font-bold text-green-400 text-sm">MAX</span>
              )}
            </div>

            {/* Energy Limit Upgrade */}
            <div className="bg-gray-800/50 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500/20 p-2 rounded-md">
                  <Zap size={24} className="text-yellow-400" />
                </div>
                <div>
                  <p className="font-bold text-white">Energy Limit</p>
                  <p className="text-xs text-gray-400">Level {energyLimitLevel} ({maxEnergy})</p>
                </div>
              </div>
              {nextEnergyLimit ? (
                <button onClick={() => handleUpgrade('energyLimit')} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-cyan-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={user.coins < nextEnergyLimit.cost}>
                  <ArrowUp size={16} />
                  <span>{nextEnergyLimit.cost.toLocaleString()}</span>
                </button>
              ) : (
                <span className="font-bold text-green-400 text-sm">MAX</span>
              )}
            </div>
          </div>
        </div>

        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px]"></div>
        </div>

      </div>
      
      {/* CSS for animation */}
      <style>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-150px) scale(1.5) rotate(10deg); }
        }
        .animate-float-up {
          animation: float-up 0.8s ease-out forwards;
        }
      `}</style>
    </Layout>
  );
}
