import { useRef, useEffect, useState, useContext } from 'react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import API from "../services/api";
import toast from 'react-hot-toast';

export default function ScratchCard() {
  const { user, setUser } = useContext(AuthContext);
  const canvasRef = useRef(null);
  const [isScratched, setIsScratched] = useState(false);
  const [prize, setPrize] = useState(0);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    if (user?.lastScratch && new Date(user.lastScratch).toDateString() === today) {
      setClaimed(true);
    }
  }, [user]);

  useEffect(() => {
    // Generate prize once on mount (Random between 20 and 70)
    setPrize(Math.floor(Math.random() * 50) + 20);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Gradient Silver Cover
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#9ca3af');
    gradient.addColorStop(0.5, '#d1d5db');
    gradient.addColorStop(1, '#9ca3af');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Text overlay
    ctx.fillStyle = '#4b5563';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Scratch Here!', width / 2, height / 2);

    let isDrawing = false;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const scratch = (x, y) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
      
      // Throttle check to improve performance
      if (Math.random() > 0.5) checkScratchPercentage();
    };

    const checkScratchPercentage = () => {
      if (isScratched) return;
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      let transparent = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i + 3] < 128) transparent++;
      }
      
      // If > 40% is scratched, reveal the rest
      if (transparent / (pixels.length / 4) > 0.4) {
        setIsScratched(true);
      }
    };

    const start = (e) => { isDrawing = true; scratch(getPos(e).x, getPos(e).y); };
    const move = (e) => { if (isDrawing) { e.preventDefault(); scratch(getPos(e).x, getPos(e).y); } };
    const end = () => { isDrawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start);
    canvas.addEventListener('touchmove', move);
    canvas.addEventListener('touchend', end);

    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('mouseup', end);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', move);
      canvas.removeEventListener('touchend', end);
    };
  }, [isScratched]);

  const handleClaim = async () => {
    if (claimed) return;
    try {
      const res = await API.post("/rewards/earn", { type: 'scratch', amount: prize });
      setUser(prev => ({ ...prev, coins: res.data.coins, lastScratch: res.data.lastScratch }));
      toast.success(`Claimed ${prize} coins!`);
      setClaimed(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Already claimed today!");
      setClaimed(true);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center min-h-[80vh] py-10 select-none">
        <h2 className="text-3xl font-bold text-cyan-400 mb-8">🎫 Scratch & Win</h2>
        
        <div className="relative w-[300px] h-[200px] rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
          {/* Prize Layer (Underneath) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
             <span className="text-white font-bold text-xl">You Won</span>
             <span className="text-5xl font-extrabold text-white drop-shadow-md">{prize}</span>
             <span className="text-white font-bold text-xl">Coins</span>
          </div>

          {/* Scratch Layer (Canvas) */}
          <canvas 
            ref={canvasRef}
            width={300}
            height={200}
            className={`absolute inset-0 z-10 cursor-pointer transition-opacity duration-700 ${isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          />
        </div>

        <div className="mt-8 text-center">
          {isScratched ? (
            <button 
              onClick={handleClaim}
              disabled={claimed}
              className={`px-8 py-3 rounded-xl font-bold text-lg transition transform active:scale-95 ${claimed ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white animate-bounce'}`}
            >
              {claimed ? 'Claimed' : 'Claim Reward'}
            </button>
          ) : (
            <p className="text-gray-400 animate-pulse">Rub the card above to reveal your prize!</p>
          )}
        </div>
      </div>
    </Layout>
  );
}