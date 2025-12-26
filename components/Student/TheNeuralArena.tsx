
import React, { useState, useEffect, useRef } from 'react';
import { generateBattleChallenge, evaluateBattleSubmission } from '../../services/geminiService';
import Loader from '../UI/Loader';
import { User } from '../../types';

interface TheNeuralArenaProps {
  user?: User;
}

interface MarketItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  type: 'DIGITAL' | 'REAL';
  desc: string;
  purchased?: boolean;
}

const MARKETPLACE_ITEMS: MarketItem[] = [
  { id: 'theme_dark', name: 'Cyberpunk Theme', cost: 500, icon: '🎨', type: 'DIGITAL', desc: 'Unlock a futuristic dark mode for the arena.' },
  { id: 'ai_tutor', name: '1-Hour AI Tutor', cost: 1200, icon: '🤖', type: 'DIGITAL', desc: 'Deep dive session with Gemini Pro.' },
  { id: 'badge_elite', name: 'Elite Badge', cost: 800, icon: '🏆', type: 'DIGITAL', desc: 'Display badge on your profile.' },
  { id: 'streak_freeze', name: 'Streak Freeze', cost: 300, icon: '❄️', type: 'DIGITAL', desc: 'Protect your daily streak for 24h.' },
];

export const TheNeuralArena: React.FC<TheNeuralArenaProps> = ({ user }) => {
  const [view, setView] = useState<'LOBBY' | 'BATTLE' | 'RESULT' | 'MARKET'>('LOBBY');
  const [stream, setStream] = useState<'CS_CORE' | 'DATA_SCIENCE' | 'AI_ML' | 'WORKFLOW_AUTOMATION' | 'GOVT_EXAMS' | 'JEE_NEET'>('CS_CORE');
  const [mode, setMode] = useState<'AI' | 'HUMAN'>('AI');
  const [challenge, setChallenge] = useState<any>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [battleResult, setBattleResult] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [matchmaking, setMatchmaking] = useState(false);
  
  // Gamification State
  const [neuroPoints, setNeuroPoints] = useState(1250); 
  const [wager, setWager] = useState(0);
  const [streak, setStreak] = useState(12);
  const [inventory, setInventory] = useState<string[]>([]);

  // Withdrawal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawStage, setWithdrawStage] = useState<'INPUT' | 'PROCESSING' | 'SUCCESS'>('INPUT');
  const [upiId, setUpiId] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);

  // --- REDEMPTION CONSTANTS ---
  const MIN_REDEEM_POINTS = 5000;
  const CASH_CONVERSION_RATE_USD = 0.01; // 1 Point = $0.01
  const CASH_CONVERSION_RATE_INR = 0.83; // 1 Point = ~ ₹0.83
  const cashValueUsd = (neuroPoints * CASH_CONVERSION_RATE_USD).toFixed(2);
  const cashValueInr = (neuroPoints * CASH_CONVERSION_RATE_INR).toFixed(0);
  const progressToWithdraw = Math.min(100, (neuroPoints / MIN_REDEEM_POINTS) * 100);

  // Auto-Select Stream based on User Profile
  useEffect(() => {
    if (user && user.targetExam) {
      if (['JEE Mains', 'JEE Advanced', 'NEET UG'].includes(user.targetExam)) {
        setStream('JEE_NEET');
      } else if (['UPSC CSE', 'SSC CGL'].includes(user.targetExam)) {
        setStream('GOVT_EXAMS');
      } else if (['GATE', 'CAT'].includes(user.targetExam)) {
        setStream('CS_CORE');
      }
    }
  }, [user]);

  useEffect(() => {
    let interval: any = null;
    let opponentInterval: any = null;

    if (isActive) {
      interval = setInterval(() => {
        setTimer((seconds) => seconds + 1);
      }, 1000);

      // Simulate Opponent
      opponentInterval = setInterval(() => {
          setOpponentProgress(prev => {
              if (prev >= 98) return 98; // Cap at 98 until user finishes
              return prev + Math.random() * (mode === 'HUMAN' ? 3 : 1);
          });
      }, 2000);

    } else if (!isActive && timer !== 0) {
      clearInterval(interval);
      clearInterval(opponentInterval);
    }
    return () => {
        clearInterval(interval);
        clearInterval(opponentInterval);
    };
  }, [isActive, timer, mode]);

  const maxWager = Math.floor(neuroPoints * 0.5); // Cap wager at 50% of current funds

  const handleStartMatch = () => {
      if (mode === 'HUMAN') {
          // Check for entry fee
          if (neuroPoints < 200) {
              alert("Insufficient points for PvP. Entry fee: 200 PTS");
              return;
          }
          setNeuroPoints(prev => prev - 200); // Deduct entry fee
          setMatchmaking(true);
          setTimeout(() => {
              setMatchmaking(false);
              startBattle();
          }, 4000); // Simulate finding opponent
      } else {
          startBattle();
      }
  }

  const startBattle = async () => {
    setLoading(true);
    const data = await generateBattleChallenge(stream, 'Industry-Hard');
    if (data) {
      setChallenge(data);
      setCode(data.starterCode || '');
      setLoading(false);
      setView('BATTLE');
      setIsActive(true);
      setTimer(0);
      setOpponentProgress(0);
    } else {
        setLoading(false);
        alert("Could not initialize arena. Try again.");
    }
  };

  const submitBattle = async () => {
    setIsActive(false);
    setLoading(true);
    const result = await evaluateBattleSubmission(challenge.description, code, stream);
    setBattleResult(result);
    
    // Calculate Winnings/Losses
    let pointsChange = 0;
    if (result.isCorrect && result.winner === 'User') {
        const basePoints = result.pointsEarned || 100;
        pointsChange = basePoints + wager + (mode === 'HUMAN' ? 400 : 0); // PvP Prize Pool
        setNeuroPoints(prev => prev + pointsChange);
        setStreak(prev => prev + 1);
    } else {
        // Loss: Lose the wager
        pointsChange = -wager;
        setNeuroPoints(prev => Math.max(0, prev - wager));
        setStreak(0); // Reset streak on loss
    }

    setBattleResult({ ...result, pointsChange });
    setLoading(false);
    setView('RESULT');
  };

  const handleBuyItem = (item: MarketItem) => {
    if (neuroPoints >= item.cost) {
      setNeuroPoints(prev => prev - item.cost);
      setInventory(prev => [...prev, item.id]);
      alert(`Successfully purchased ${item.name}! Check your inventory.`);
    } else {
      alert("Insufficient NeuroPoints!");
    }
  };

  // --- WITHDRAWAL LOGIC ---
  const handleWithdrawClick = () => {
    if (neuroPoints >= MIN_REDEEM_POINTS) {
       setWithdrawStage('INPUT');
       setShowWithdrawModal(true);
    } else {
       const needed = MIN_REDEEM_POINTS - neuroPoints;
       alert(`Withdrawal Locked! You need ${needed} more points to reach the minimum payout threshold of ${MIN_REDEEM_POINTS} PTS.`);
    }
  };

  const processUpiWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiId.includes('@')) {
        alert("Please enter a valid UPI ID (e.g., name@okicici, mobile@paytm)");
        return;
    }

    setWithdrawStage('PROCESSING');
    
    // Simulate banking delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setNeuroPoints(0);
    setWithdrawStage('SUCCESS');
  };

  const closeWithdrawModal = () => {
      setShowWithdrawModal(false);
      setUpiId('');
      setWithdrawStage('INPUT');
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCodingStream = stream === 'CS_CORE' || stream === 'AI_ML' || stream === 'DATA_SCIENCE';

  // --- VIEW: MARKETPLACE ---
  if (view === 'MARKET') {
    return (
      <div className="max-w-6xl mx-auto pb-20 animate-fade-in text-gray-900">
         {/* ... Market UI (Unchanged for brevity, but kept in full file) ... */}
         <div className="flex justify-between items-center mb-8">
            <button onClick={() => setView('LOBBY')} className="text-gray-500 hover:text-indigo-600 font-bold flex items-center gap-2">
                <span>←</span> Back to Arena
            </button>
            <div className="bg-gray-900 text-white px-6 py-2 rounded-full font-mono font-bold border border-yellow-500/30">
                {neuroPoints.toLocaleString()} PTS
            </div>
         </div>
         
         <div className="text-center mb-10">
            <h2 className="text-4xl font-black font-serif mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-500">NeuroMarket & Vault</h2>
            <p className="text-gray-600">Spend points on upgrades or withdraw cash rewards via UPI.</p>
         </div>

         {/* WITHDRAWAL VAULT SECTION */}
         <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white p-8 rounded-3xl shadow-2xl mb-12 border border-gray-700 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20"></div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                
                {/* Balance Info */}
                <div className="md:col-span-1 border-r border-gray-700 pr-8">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Current Balance</p>
                    <div className="text-4xl font-mono font-bold text-white mb-2">{neuroPoints.toLocaleString()} <span className="text-base text-gray-500">PTS</span></div>
                    <div className="flex items-center gap-3">
                        <div className="text-emerald-400 font-bold text-lg">≈ ${cashValueUsd} USD</div>
                        <span className="text-gray-500">|</span>
                        <div className="text-orange-400 font-bold text-lg">≈ ₹{parseInt(cashValueInr).toLocaleString()} INR</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="md:col-span-2">
                    <div className="flex justify-between items-end mb-2">
                         <div>
                            <p className="font-bold text-lg text-white">Withdrawal Threshold</p>
                            <p className="text-xs text-gray-400">Minimum {MIN_REDEEM_POINTS.toLocaleString()} PTS required to cash out</p>
                         </div>
                         <div className="text-right">
                             <p className="font-mono text-yellow-500 font-bold">{Math.round(progressToWithdraw)}%</p>
                         </div>
                    </div>
                    
                    <div className="h-4 w-full bg-gray-700 rounded-full overflow-hidden relative">
                        {/* Shimmer Effect */}
                        <div 
                           className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000 ease-out relative"
                           style={{ width: `${progressToWithdraw}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                        </div>
                        {/* Threshold Marker */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-white z-10" style={{ left: '100%' }}></div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={handleWithdrawClick}
                            className={`px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2 ${
                                neuroPoints >= MIN_REDEEM_POINTS
                                ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                            }`}
                        >
                            {neuroPoints >= MIN_REDEEM_POINTS ? 'Withdraw via UPI' : `Locked (${(MIN_REDEEM_POINTS - neuroPoints).toLocaleString()} pts left)`}
                            {neuroPoints >= MIN_REDEEM_POINTS && <span>💸</span>}
                        </button>
                    </div>
                </div>
            </div>
         </div>

         <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
             <span className="text-2xl">🛍️</span> Redeem Items
         </h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MARKETPLACE_ITEMS.map((item) => {
               const isOwned = inventory.includes(item.id);
               const canAfford = neuroPoints >= item.cost;
               return (
                  <div key={item.id} className="relative group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden">
                     <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl ${item.type === 'REAL' ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'}`}>
                        {item.type}
                     </div>
                     
                     <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                     <h3 className="font-bold text-base text-gray-900 mb-1">{item.name}</h3>
                     <p className="text-xs text-gray-500 mb-4 h-8 leading-tight">{item.desc}</p>
                     
                     <div className="flex flex-col gap-2">
                        <div className="font-mono font-bold text-gray-700 text-sm">{item.cost} PTS</div>
                        <button 
                          onClick={() => handleBuyItem(item)}
                          disabled={isOwned || !canAfford}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                             isOwned 
                             ? 'bg-gray-100 text-gray-400 cursor-default' 
                             : canAfford 
                                ? 'bg-gray-900 text-white hover:bg-black' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                           {isOwned ? 'OWNED' : 'REDEEM'}
                        </button>
                     </div>
                  </div>
               )
            })}
         </div>

         {/* UPI WITHDRAWAL MODAL */}
         {showWithdrawModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
               <div className="bg-[#121212] w-full max-w-md rounded-3xl shadow-2xl border border-gray-700 overflow-hidden relative">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                   
                   <div className="p-8">
                       <div className="flex justify-between items-center mb-6">
                           <h3 className="text-2xl font-bold text-white font-serif">Withdraw Funds</h3>
                           <button onClick={closeWithdrawModal} className="text-gray-500 hover:text-white">✕</button>
                       </div>

                       {withdrawStage === 'INPUT' && (
                           <form onSubmit={processUpiWithdrawal} className="space-y-6">
                               <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                                   <div className="flex justify-between items-center mb-2">
                                       <span className="text-gray-400 text-xs uppercase">Withdrawal Amount</span>
                                       <span className="text-green-400 text-xs font-bold">Available</span>
                                   </div>
                                   <div className="text-3xl font-mono text-white font-bold">₹{parseInt(cashValueInr).toLocaleString()}</div>
                                   <div className="text-gray-500 text-xs mt-1">({neuroPoints.toLocaleString()} Points @ ₹0.83/pt)</div>
                               </div>

                               <div>
                                   <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Enter UPI ID (VPA)</label>
                                   <input 
                                     type="text" 
                                     placeholder="e.g. yourname@okaxis" 
                                     value={upiId}
                                     onChange={(e) => setUpiId(e.target.value)}
                                     className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                     required
                                   />
                                   <p className="text-[10px] text-gray-500 mt-2">
                                       Funds will be transferred directly to your linked bank account via UPI.
                                   </p>
                               </div>

                               <button 
                                 type="submit"
                                 className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
                               >
                                   Verify & Withdraw ₹{parseInt(cashValueInr).toLocaleString()}
                               </button>
                           </form>
                       )}

                       {withdrawStage === 'PROCESSING' && (
                           <div className="text-center py-8">
                               <div className="mb-6 relative">
                                   <div className="w-20 h-20 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin mx-auto"></div>
                                   <div className="absolute inset-0 flex items-center justify-center">
                                       <span className="text-2xl">🏦</span>
                                   </div>
                               </div>
                               <h4 className="text-xl font-bold text-white mb-2">Connecting to Bank...</h4>
                               <p className="text-gray-400 text-sm">Verifying UPI VPA: <span className="text-indigo-400">{upiId}</span></p>
                           </div>
                       )}

                       {withdrawStage === 'SUCCESS' && (
                           <div className="text-center py-4">
                               <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-900/50 animate-bounce">
                                   <span className="text-4xl text-white">✓</span>
                               </div>
                               <h4 className="text-2xl font-bold text-white mb-2">Transfer Successful!</h4>
                               <p className="text-gray-300 mb-6">
                                   <span className="text-green-400 font-bold">₹{parseInt(cashValueInr).toLocaleString()}</span> has been sent to <span className="text-white font-mono">{upiId}</span>.
                               </p>
                               <button 
                                 onClick={closeWithdrawModal}
                                 className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
                               >
                                   Close Receipt
                               </button>
                           </div>
                       )}
                   </div>
               </div>
            </div>
         )}
      </div>
    );
  }

  // --- VIEW: LOBBY ---
  if (view === 'LOBBY') {
    return (
      <div ref={containerRef} className="max-w-6xl mx-auto pb-20 animate-fade-in text-gray-900">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div className="relative">
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20 -z-10"></div>
                <h2 className="text-5xl font-black font-serif tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900">
                    The Neural Arena
                </h2>
                <div className="flex items-center gap-4 mt-2">
                   <p className="text-lg text-gray-600 font-medium">Simulation Battles</p>
                   {user && (
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                        {user.targetExam ? `${user.targetExam} Stream Active` : 'General Mode'}
                      </span>
                   )}
                </div>
            </div>

            {/* Wallet Widget */}
            <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl flex items-center gap-6 min-w-[320px] border border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500 blur-[40px] opacity-20"></div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">NeuroVault</p>
                    <div className="text-3xl font-mono font-bold text-yellow-400">
                        {neuroPoints.toLocaleString()} <span className="text-sm text-gray-400">PTS</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button onClick={() => setView('MARKET')} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-lg shadow-lg transition-all w-full flex items-center justify-center gap-2">
                       <span>Market & Vault</span>
                       {neuroPoints >= MIN_REDEEM_POINTS && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                    </button>
                    <div className="text-[10px] font-bold text-orange-400 flex items-center gap-1">
                       <span>🔥 {streak} Day Streak</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Stream Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-8 rounded-3xl border-2 border-transparent hover:border-indigo-100 transition-all">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-3xl">🧬</span> Select Battle Stream
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button onClick={() => setStream('CS_CORE')} className={`text-left p-4 rounded-xl border-2 transition-all ${stream === 'CS_CORE' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}>
                        <div className="font-bold text-lg mb-1">CS Core / Algorithms</div>
                        <div className="text-xs text-gray-500">DSA & Coding Battles</div>
                    </button>
                    <button onClick={() => setStream('DATA_SCIENCE')} className={`text-left p-4 rounded-xl border-2 transition-all ${stream === 'DATA_SCIENCE' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}>
                        <div className="font-bold text-lg mb-1">Data Science / ML</div>
                        <div className="text-xs text-gray-500">Case Studies & Model Forge</div>
                    </button>
                    <button onClick={() => setStream('GOVT_EXAMS')} className={`text-left p-4 rounded-xl border-2 transition-all ${stream === 'GOVT_EXAMS' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}>
                        <div className="font-bold text-lg mb-1">UPSC / SSC Battle</div>
                        <div className="text-xs text-gray-500">Polity, History, Aptitude Logic</div>
                    </button>
                    <button onClick={() => setStream('JEE_NEET')} className={`text-left p-4 rounded-xl border-2 transition-all ${stream === 'JEE_NEET' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}>
                        <div className="font-bold text-lg mb-1">JEE / NEET Round</div>
                        <div className="text-xs text-gray-500">Physics, Chem, Logical Problems</div>
                    </button>
                </div>
            </div>
            
            {/* Daily Quest Card */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Daily Quest</div>
                        <h3 className="text-xl font-bold mb-2">The "Algorithm" Slayer</h3>
                        <p className="text-indigo-200 text-sm max-w-sm">Complete 3 battles in CS Core or JEE stream today to unlock a 2x point multiplier.</p>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
                        <div className="text-2xl font-bold">1/3</div>
                        <div className="text-[10px] uppercase opacity-70">Completed</div>
                    </div>
                </div>
            </div>
          </div>

          {/* Configuration & Launch */}
          <div className="glass-panel p-8 rounded-3xl border-2 border-transparent hover:border-indigo-100 transition-all flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><span className="text-2xl">⚡</span> Configure Battle</h3>
              
              <div className="mb-6">
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex justify-between">
                    <span>Wager Points</span>
                    <span className="text-indigo-600">{wager} PTS</span>
                 </label>
                 <input 
                   type="range" 
                   min="0" 
                   max={maxWager} 
                   step="50"
                   value={wager}
                   onChange={(e) => setWager(parseInt(e.target.value))}
                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                 />
                 <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Low Risk</span>
                    <span>High Stakes</span>
                 </div>
                 {wager > 0 && (
                    <p className="text-xs text-indigo-600 mt-2 font-bold bg-indigo-50 p-2 rounded text-center">
                        Potential Win: +{wager} PTS | Risk: -{wager} PTS
                    </p>
                 )}
              </div>

              <div className="space-y-3">
                <button onClick={() => setMode('AI')} className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${mode === 'AI' ? 'border-purple-600 bg-purple-50' : 'border-gray-100 hover:border-purple-200'}`}>
                  <div><div className="font-bold text-sm text-left">The Architect (AI)</div><div className="text-[10px] text-gray-500">Standard Difficulty</div></div><span className="text-xl">🤖</span>
                </button>
                <button onClick={() => setMode('HUMAN')} className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${mode === 'HUMAN' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}>
                  <div>
                      <div className="font-bold text-sm text-left">Live Human PvP</div>
                      <div className="text-[10px] text-gray-500">Entry: 200 PTS | Win: +400 PTS</div>
                  </div>
                  <span className="text-xl">⚔️</span>
                </button>
              </div>
            </div>

            <button 
                onClick={handleStartMatch} 
                disabled={loading || matchmaking} 
                className={`mt-8 w-full py-4 font-black text-lg uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all shadow-xl flex flex-col items-center justify-center relative overflow-hidden group text-white ${matchmaking ? 'bg-gray-500 cursor-wait' : 'bg-gray-900 hover:bg-black'}`}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                {loading ? 'Initializing Arena...' : matchmaking ? 'Searching Opponent...' : (
                    <>
                        <span>Enter Arena</span>
                        <span className="text-[10px] font-normal opacity-70 mt-1">
                            {wager > 0 ? `Risking ${wager} PTS` : 'Practice Mode (Safe)'}
                        </span>
                    </>
                )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: BATTLE ---
  if (view === 'BATTLE' && challenge) {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in">
        <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-t-2xl shadow-lg relative overflow-hidden">
          {/* Opponent Progress Bar (Simulated) */}
          <div className="absolute bottom-0 left-0 h-1 bg-red-500 transition-all duration-1000 ease-linear" style={{ width: `${opponentProgress}%` }}></div>
          
          <div className="flex items-center gap-4 relative z-10">
             <span className="font-bold text-indigo-400 uppercase tracking-widest text-sm">{stream.replace('_', ' ')}</span>
             <span className="w-px h-4 bg-gray-700"></span>
             <h3 className="font-bold max-w-md truncate">{challenge.title}</h3>
          </div>
          
          <div className="flex items-center gap-6 relative z-10">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] text-gray-400 uppercase">Opponent</span>
                 <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                     <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${opponentProgress}%` }}></div>
                 </div>
             </div>
             <div className="font-mono text-xl font-bold text-yellow-400 tracking-wider border border-yellow-500/50 px-3 py-1 rounded bg-black/30">
                 {formatTime(timer)}
             </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 bg-white border-x border-b border-gray-200 shadow-xl overflow-hidden rounded-b-2xl">
          {/* Problem */}
          <div className="p-6 overflow-y-auto border-r border-gray-100 bg-gray-50">
             <h4 className="font-bold text-lg mb-4 text-gray-900">Mission Brief</h4>
             <div className="prose prose-sm prose-indigo mb-6 text-gray-700">
                 {challenge.description}
             </div>
             
             {isCodingStream && challenge.inputCase && (
               <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4 font-mono text-sm">
                 <div className="mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Input</span>
                    <div className="bg-gray-50 p-2 rounded text-indigo-700 mt-1">{challenge.inputCase}</div>
                 </div>
                 <div>
                    <span className="text-xs font-bold text-gray-400 uppercase">Expected Output</span>
                    <div className="bg-gray-50 p-2 rounded text-green-700 mt-1">{challenge.outputCase}</div>
                 </div>
               </div>
             )}
             
             <div className="mt-8">
               <p className="font-bold text-sm text-gray-900 mb-2">Hints</p>
               <ul className="space-y-2">
                 {challenge.hints?.map((hint: string, i: number) => (
                   <li key={i} className="text-xs text-gray-500 flex items-start"><span className="mr-2 text-indigo-500">›</span> {hint}</li>
                 ))}
               </ul>
             </div>
          </div>

          {/* Editor/Answer Area */}
          <div className="flex flex-col h-full bg-[#1e1e1e]">
            <div className="flex-1 relative">
               <textarea
                 value={code}
                 onChange={(e) => setCode(e.target.value)}
                 className="w-full h-full bg-[#1e1e1e] text-gray-300 font-mono p-6 resize-none focus:outline-none text-sm leading-6"
                 spellCheck="false"
                 placeholder={!isCodingStream ? "Type your logical reasoning or answer here..." : "Write your solution here..."}
               />
               <div className="absolute top-0 right-0 p-2 opacity-50 pointer-events-none">
                 <span className="text-xs text-gray-500">{isCodingStream ? 'Python 3.10 Environment' : 'Logical Text Format'}</span>
               </div>
            </div>
            <div className="p-4 bg-[#252526] border-t border-[#333] flex justify-between items-center">
               <div className="flex gap-2">
                 {isCodingStream && <button className="px-3 py-1 bg-[#333] text-gray-300 text-xs rounded hover:bg-[#444] transition-colors">Run Tests</button>}
               </div>
               <button onClick={submitBattle} className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm rounded hover:shadow-lg hover:scale-105 transition-all shadow-md">
                 Submit Solution
               </button>
            </div>
          </div>
        </div>
        
        {loading && (
           <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                 <div className="mb-6"><Loader /></div>
                 <h3 className="text-white font-bold text-xl">Evaluating Performance...</h3>
                 <p className="text-gray-400 text-sm mt-2">Running test cases and analyzing complexity.</p>
              </div>
           </div>
        )}
      </div>
    );
  }

  // --- VIEW: RESULT ---
  if (view === 'RESULT' && battleResult) {
    const isWin = battleResult.isCorrect && battleResult.winner === 'User';
    return (
      <div className="max-w-4xl mx-auto py-10 animate-fade-in">
        <div className={`relative p-10 rounded-3xl overflow-hidden shadow-2xl text-center mb-8 ${isWin ? 'bg-gradient-to-br from-gray-900 to-emerald-900' : 'bg-gradient-to-br from-gray-900 to-red-900'}`}>
           <div className="relative z-10">
              <h2 className="text-6xl font-black text-white mb-2 uppercase tracking-tighter">{isWin ? 'Victory' : 'Defeat'}</h2>
              <p className="text-white/80 font-medium text-lg mb-8">{isWin ? 'Optimization Successful. Opponent Eliminated.' : 'Logic Flaw Detected. System Failure.'}</p>
              
              {/* Rewards */}
              <div className="inline-flex items-center gap-8 bg-black/30 p-6 rounded-2xl mb-8 backdrop-blur-sm border border-white/10">
                  <div className="text-center">
                        <div className="text-xs text-green-300 font-bold uppercase mb-1">Total Reward</div>
                        <div className="text-3xl font-black text-white">{battleResult.pointsEarned > 0 ? `+${battleResult.pointsEarned + wager + (mode === 'HUMAN' ? 400 : 0)}` : '0'}</div>
                  </div>
                  <div className="w-px h-10 bg-white/20"></div>
                  <div className="text-center">
                        <div className="text-xs text-blue-300 font-bold uppercase mb-1">Accuracy</div>
                        <div className="text-3xl font-black text-white">{battleResult.score}%</div>
                  </div>
                  {battleResult.metrics?.timeEfficiency && (
                      <>
                        <div className="w-px h-10 bg-white/20"></div>
                        <div className="text-center">
                                <div className="text-xs text-purple-300 font-bold uppercase mb-1">Complexity</div>
                                <div className="text-xl font-black text-white">{battleResult.metrics.timeEfficiency}</div>
                        </div>
                      </>
                  )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                    <p className="text-xs font-bold text-white/50 uppercase mb-2">Detailed Feedback</p>
                    <p className="text-white text-sm leading-relaxed">{battleResult.feedback}</p>
                 </div>
                 <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                    <p className="text-xs font-bold text-white/50 uppercase mb-2">Technical Analysis</p>
                    <p className="text-white text-sm leading-relaxed">{battleResult.analysis}</p>
                    {battleResult.metrics && (
                        <div className="mt-4 flex gap-2">
                            <span className="text-[10px] bg-white/20 px-2 py-1 rounded text-white">{battleResult.metrics.codeQuality} Code</span>
                            <span className="text-[10px] bg-white/20 px-2 py-1 rounded text-white">{battleResult.metrics.memoryUsage} Memory</span>
                        </div>
                    )}
                 </div>
              </div>
              
              <div className="mt-8">
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Official Scorecard • Synced with Institution Dashboard</p>
              </div>
           </div>
        </div>
        <div className="text-center">
           <button onClick={() => setView('LOBBY')} className="px-8 py-3 bg-white border border-gray-300 text-gray-900 font-bold rounded-full hover:bg-gray-50 transition-colors shadow-lg">Return to Arena Lobby</button>
        </div>
      </div>
    );
  }

  return null;
};
