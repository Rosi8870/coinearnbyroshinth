import React, { useState, useContext, useMemo, useEffect } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import API from "../services/api";
import toast from 'react-hot-toast';

const segments = [
  { value: 10, label: '10', color: '#ef4444' }, // red-500
  { value: 5, label: '5', color: '#3b82f6' },   // blue-500
  { value: 20, label: '20', color: '#22c55e' }, // green-500
  { value: 2, label: '2', color: '#eab308' },   // yellow-500
  { value: 50, label: '50', color: '#a855f7' }, // purple-500
  { value: 1, label: '1', color: '#ec4899' },   // pink-500
  { value: 15, label: '15', color: '#f97316' }, // orange-500
  { value: 0, label: '😭', color: '#64748b' },  // slate-500
];

const SpinWheel = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    if (user?.lastSpin && new Date(user.lastSpin).toDateString() === today) {
      setAlreadyClaimed(true);
    }
  }, [user]);

  const conicGradient = useMemo(() => {
    const segmentAngle = 360 / segments.length;
    const gradientParts = segments.map((s, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = (index + 1) * segmentAngle;
      return `${s.color} ${startAngle}deg ${endAngle}deg`;
    });
    return `conic-gradient(from 0deg, ${gradientParts.join(', ')})`;
  }, []);

  const handleSpin = () => {
    if (isSpinning || alreadyClaimed) return;

    setIsSpinning(true);

    const randomIndex = Math.floor(Math.random() * segments.length);
    const prize = segments[randomIndex];
    
    const segmentAngle = 360 / segments.length;
    const randomSpins = Math.floor(Math.random() * 5) + 5; 
    const targetSegmentCenter = (randomIndex * segmentAngle) + (segmentAngle / 2);
    
    // Calculate target rotation to align segment center with top (0deg)
    const targetRotation = (360 - targetSegmentCenter);
    const nextBase = Math.ceil(rotation / 360) * 360;
    const finalRotation = nextBase + (360 * randomSpins) + targetRotation;

    setRotation(finalRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      
      try {
        const res = await API.post("/rewards/earn", { type: 'spin', amount: prize.value });
        
        setUser(prev => ({ ...prev, coins: res.data.coins, lastSpin: res.data.lastSpin }));

        if (prize.value > 0) {
          toast.success(`🎉 You won ${prize.value} coins!`);
        } else {
          toast.error('😭 Better luck next time!');
        }
        setAlreadyClaimed(true);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Already claimed today.');
        setAlreadyClaimed(true);
      }
    }, 5000); // Corresponds to the CSS transition duration
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-8 animate-pulse text-center">
          🎡 Daily Spin Wheel
        </h2>

        <div className="relative">
          {/* Pointer */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
             <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-500 drop-shadow-lg"></div>
          </div>

          {/* Wheel Border/Container */}
          <div className="rounded-full p-2 bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-2xl">
            <div className="rounded-full p-2 bg-black">
              <div 
                className="w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] rounded-full relative overflow-hidden transition-transform duration-[5000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  background: conicGradient,
                }}
              >
                {segments.map((segment, index) => {
                  const segmentAngle = 360 / segments.length;
                  const rotationAngle = (index * segmentAngle) + (segmentAngle / 2);
                  return (
                    <div 
                      key={index} 
                      className="absolute top-0 left-1/2 w-1 h-1/2 -ml-0.5 origin-bottom pt-4 sm:pt-6"
                      style={{ transform: `rotate(${rotationAngle}deg)` }}
                    >
                      <div className="text-white font-bold text-lg sm:text-xl -translate-x-1/2 text-center w-20 drop-shadow-md">
                        {segment.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Center Knob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-xl border-4 border-gray-200 z-10 flex items-center justify-center">
             <span className="text-2xl sm:text-3xl">🪙</span>
          </div>
        </div>
        
        <button 
          onClick={handleSpin} 
          disabled={isSpinning || alreadyClaimed} 
          className={`mt-10 w-full max-w-xs py-3 rounded-xl font-bold text-lg transition shadow-lg transform active:scale-95 ${
            alreadyClaimed 
              ? 'bg-gray-600 cursor-not-allowed text-gray-400' 
              : isSpinning 
                ? 'bg-yellow-500 cursor-wait text-black'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
          }`}
        >
          {alreadyClaimed ? 'Come Back Tomorrow' : isSpinning ? 'Spinning...' : 'SPIN NOW'}
        </button>
      </div>
    </Layout>
  );
};

export default SpinWheel;