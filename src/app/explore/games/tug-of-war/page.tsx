"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Trophy, Users, Star } from "lucide-react";
import { useProfile } from "@/lib/profile-context";
import { StarFly } from "@/components/StarFly";

// --- Game Data ---
const QUESTIONS = [
  {
    id: 1,
    soal: "Makanan khas Betawi yang terbuat dari beras ketan, telur bebek, dan serundeng adalah...",
    pilihan: ["Nasi Uduk", "Kerak Telor", "Ketoprak", "Lontong Sayur"],
    jawabanBenar: 1
  },
  {
    id: 2,
    soal: "Minuman tradisional Betawi yang terbuat dari rempah-rempah dan tidak mengandung alkohol disebut...",
    pilihan: ["Bir Pletok", "Es Selendang Mayang", "Sekoteng", "Bajigur"],
    jawabanBenar: 0
  },
  {
    id: 3,
    soal: "Roti berbentuk buaya yang wajib ada dalam hantaran pernikahan adat Betawi melambangkan...",
    pilihan: ["Kekuatan", "Kesetiaan", "Keberanian", "Kekayaan"],
    jawabanBenar: 1
  },
  {
    id: 4,
    soal: "Kue tradisional Betawi yang berwarna-warni dan disajikan dengan kuah santan gula merah adalah...",
    pilihan: ["Kue Cucur", "Es Selendang Mayang", "Kue Ape", "Kue Rangi"],
    jawabanBenar: 1
  },
  {
    id: 5,
    soal: "Seni bela diri asli masyarakat Betawi disebut...",
    pilihan: ["Pencak Silat", "Tarung Derajat", "Maen Pukulan", "Wushu"],
    jawabanBenar: 2
  }
];

const MAX_QUESTIONS = 10;

export default function TugOfWarGame() {
  const router = useRouter();
  const { profile, addPoints } = useProfile();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameState, setGameState] = useState("playing"); // playing, result, gameOver
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [pendingStars, setPendingStars] = useState<{ count: number; timestamp: number; positions: { x: number; y: number }[] }>({ count: 0, timestamp: 0, positions: [] });
  const [feedback, setFeedback] = useState<null | { type: "correct" | "wrong"; index: number }>(null);
  const [gameQuestions, setGameQuestions] = useState(QUESTIONS);
  const [startTime, setStartTime] = useState(Date.now());
  const answerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Calculate rope offset based on score lead
  // Every 1 point lead = 4% movement
  const lead = playerScore - opponentScore;
  const ropeOffset = lead * 4;

  // Shuffle logic
  useEffect(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    setGameQuestions(shuffled);
    setStartTime(Date.now());
  }, []);

  const question = gameQuestions[currentLevel] || gameQuestions[0];

  const handleAnswer = (index: number) => {
    if (gameState !== "playing") return;

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    const isCorrect = index === question.jawabanBenar;
    
    setFeedback({ type: isCorrect ? "correct" : "wrong", index });
    setGameState("result");

    if (isCorrect) {
      // Speed bonus: max 10 points if < 2s, minimum 5 points
      const pullPower = Math.max(5, Math.floor(10 - duration));
      setPlayerScore(s => s + pullPower);
      
      // Star Animation
      const btn = answerRefs.current[index];
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const now = Date.now();
        const positions = Array.from({ length: 5 }).map(() => ({
          x: rect.left + rect.width / 2 + (Math.random() * 40 - 20),
          y: rect.top + rect.height / 2 + (Math.random() * 40 - 20)
        }));
        setPendingStars({ count: 5, timestamp: now, positions });
      }
    } else {
      setOpponentScore(s => s + 8); // Opponent gets fixed pull on wrong answer
    }

    setTimeout(() => {
      if (currentLevel < gameQuestions.length - 1) {
        setCurrentLevel(prev => prev + 1);
        setGameState("playing");
        setFeedback(null);
        setStartTime(Date.now());
      } else {
        setGameState("gameOver");
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setPlayerScore(0);
    setOpponentScore(0);
    setGameState("playing");
    setFeedback(null);
    setStartTime(Date.now());
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] relative overflow-hidden font-sans">
      {/* Heritage Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://i.ibb.co.com/XrnHrbqS/BABE-JAKA-3.png")', backgroundSize: '400px' }}></div>
      
      {/* Top Header */}
      <div className="relative z-50 p-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 hover:bg-white/50 rounded-full transition-all text-gray-600">
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex flex-col items-center">
           <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <Users size={16} className="text-secondary" />
              <span className="text-[10px] font-black tracking-widest uppercase text-ink-light">TARIK TAMBANG</span>
           </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-sm">
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-ink-light tracking-widest uppercase opacity-60">POIN BINTANG</span>
             <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-xl font-black text-ink">{profile.points}</span>
             </div>
           </div>
        </div>
      </div>

      {/* Arena Tug of War */}
      <div className="flex-1 flex flex-col items-center justify-center pt-8 px-4">
         
         {/* Characters & Rope */}
         <div className="relative w-full max-w-4xl h-64 mb-12 flex items-center justify-center">
            {/* Ground Line */}
            <div className="absolute bottom-12 left-0 right-0 h-4 bg-gray-200/50 rounded-full"></div>
            
            {/* Rope */}
            <motion.div 
              className="absolute bottom-[72px] h-3 bg-[#8B4513] shadow-lg rounded-full flex items-center justify-center overflow-visible"
              animate={{ x: -ropeOffset * 4 }}
              transition={{ type: "spring", stiffness: 50, damping: 10 }}
              style={{ width: '150%' }}
            >
               {/* Center Ribbon */}
               <div className="w-8 h-12 bg-red-600 border-2 border-white shadow-lg rounded-sm relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-400"></div>
               </div>

               {/* Texture lines */}
               {[...Array(50)].map((_, i) => (
                 <div key={i} className="flex-1 h-full border-r border-black/10"></div>
               ))}
            </motion.div>

            {/* Players */}
            <div className="absolute inset-0 flex justify-between items-end px-12 pb-14">
               {/* Player Team (Babe Jaka Side) */}
               <motion.div 
                 animate={{ x: -ropeOffset * 4, rotate: lead < 0 ? 10 : 0 }}
                 className="relative w-32 h-32"
               >
                  <img src="https://i.ibb.co.com/vxhZR8wB/MASKOT-BABE.png" alt="Player" className="w-full h-full object-contain" />
                  <div className="absolute -top-4 left-0 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-md">TIM KAMU</div>
               </motion.div>

               {/* Opponent Team */}
               <motion.div 
                 animate={{ x: -ropeOffset * 4, rotate: lead > 0 ? -10 : 0 }}
                 className="relative w-32 h-32 scale-x-[-1]"
               >
                  <img src="https://i.ibb.co.com/d4jXMJp2/babe-bingung.png" alt="Opponent" className="w-full h-full object-contain grayscale opacity-60" />
                  <div className="absolute -top-4 left-0 bg-gray-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md scale-x-[-1]">LAWAN</div>
               </motion.div>
            </div>
         </div>

         {/* Question Section */}
         <AnimatePresence mode="wait">
            {gameState !== "gameOver" ? (
              <motion.div 
                key={currentLevel}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="w-full max-w-2xl flex flex-col items-center"
              >
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-white mb-8 text-center w-full relative">
                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary text-white text-[10px] font-black rounded-full shadow-lg">
                      SOAL {currentLevel + 1}
                   </div>
                   <h2 className="text-xl md:text-2xl font-black text-ink leading-tight mb-8">
                     {question.soal}
                   </h2>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.pilihan.map((p, idx) => (
                        <button
                          key={idx}
                          ref={el => { answerRefs.current[idx] = el; }}
                          onClick={() => handleAnswer(idx)}
                          disabled={gameState !== "playing"}
                          className={`
                            relative py-4 px-6 rounded-2xl font-bold text-sm transition-all border-b-4
                            ${feedback?.index === idx 
                              ? (feedback.type === "correct" ? "bg-green-500 border-green-700 text-white" : "bg-red-500 border-red-700 text-white animate-shake")
                              : "bg-gray-50 border-gray-200 text-ink hover:bg-white hover:border-secondary hover:text-secondary"}
                            ${feedback && idx === question.jawabanBenar && feedback.type === "wrong" ? "bg-green-100 border-green-200 text-green-700" : ""}
                            ${feedback && idx !== feedback.index ? "opacity-50" : ""}
                          `}
                        >
                          {p}
                        </button>
                      ))}
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-lg w-full border-4 border-secondary/20"
              >
                <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="text-secondary w-12 h-12" />
                </div>
                <h2 className="text-4xl font-black text-ink mb-2">PERMAINAN SELESAI!</h2>
                <p className="text-ink-light font-bold mb-8">
                   {lead > 0 ? "Hebat! Kamu memenangkan Tarik Tambang!" : "Hampir saja! Ayo coba lagi agar lebih kuat!"}
                </p>
                <div className="flex gap-4">
                  <button onClick={resetGame} className="flex-1 bg-secondary text-white font-black py-4 rounded-2xl shadow-glow-blue flex items-center justify-center gap-2 hover:-translate-y-1 transition-all">
                    <RefreshCw size={20} /> MAIN LAGI
                  </button>
                  <button onClick={() => router.push('/')} className="flex-1 bg-gray-100 text-ink-light font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all">
                    KELUAR
                  </button>
                </div>
              </motion.div>
            )}
         </AnimatePresence>
      </div>

      <StarFly burst={pendingStars} onStarHit={() => addPoints(1)} />

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}
