"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Trophy, Target } from "lucide-react";

// --- Game Data ---
const QUESTIONS = [
  {
    id: 1,
    soal: "Apa nama kerak dari nasi yang dimasak dengan telur khas Betawi?",
    pilihan: ["Nasi Uduk", "Kerak Telor", "Soto Betawi", "Laksa"],
    jawabanBenar: 1
  },
  {
    id: 2,
    soal: "Boneka raksasa khas Betawi yang sering tampil berpasangan disebut...",
    pilihan: ["Wayang Golek", "Ondel-ondel", "Barongsai", "Kuda Lumping"],
    jawabanBenar: 1
  },
  {
    id: 3,
    soal: "Musik tiup tradisional Betawi yang mendapat pengaruh dari Eropa adalah...",
    pilihan: ["Gamelan", "Tanjidor", "Marawis", "Rebana"],
    jawabanBenar: 1
  },
  {
    id: 4,
    soal: "Senjata tajam tradisional khas Betawi yang diselipkan di pinggang adalah...",
    pilihan: ["Keris", "Rencong", "Golok", "Kujang"],
    jawabanBenar: 2
  },
  {
    id: 5,
    soal: "Minuman khas Betawi dari rempah-rempah yang tidak memabukkan disebut Bir...",
    pilihan: ["Bintang", "Pletok", "Jawa", "Hitam"],
    jawabanBenar: 1
  }
];

export default function SlingshotGame() {
  const router = useRouter();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState("playing"); // playing, flying, result, gameOver
  const [feedback, setFeedback] = useState<null | { type: "correct" | "wrong"; index: number }>(null);
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const slingRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const question = QUESTIONS[currentLevel];

  // Handle shooting logic
  const handleRelease = (event: any, info: any) => {
    if (gameState !== "playing") return;

    const offset = info.offset;
    const power = 1.5;
    
    // Reverse direction for slingshot feel
    const targetX = -offset.x * power;
    const targetY = -offset.y * power - 250; // Shortened distance to match bubbles

    setGameState("flying");
    setIsDragging(false);

    // Animate ball
    setBallPos({ x: targetX, y: targetY });

    // Determine which bubble it hits (simple hit detection)
    // Bubbles are roughly at top half of screen
    setTimeout(() => {
      checkCollision(targetX, targetY);
    }, 800); // Matched with transition duration
  };

  const checkCollision = (tx: number, ty: number) => {
    // In a real game we'd check coordinates, 
    // for this pseudo-3D UI we'll simulate a random hit or just pick the center
    // Let's make it interactive: the user must "aim" roughly at the bubbles
    
    // Bubble positions (relative to screen center)
    // Horizontal row: left to right
    const bubbles = [
      { x: -180, y: -250 },
      { x: -60, y: -250 },
      { x: 60, y: -250 },
      { x: 180, y: -250 }
    ];

    let hitIndex = -1;
    let minDist = 80;

    bubbles.forEach((b, i) => {
      const d = Math.sqrt(Math.pow(tx - b.x, 2) + Math.pow(ty - b.y, 2));
      if (d < minDist) {
        minDist = d;
        hitIndex = i;
      }
    });

    if (hitIndex !== -1) {
      if (hitIndex === question.jawabanBenar) {
        setScore(s => s + 10);
        setFeedback({ type: "correct", index: hitIndex });
      } else {
        setFeedback({ type: "wrong", index: hitIndex });
      }
    } else {
      // Missed
      setFeedback(null);
    }

    setGameState("result");
  };

  const nextQuestion = () => {
    if (currentLevel < QUESTIONS.length - 1) {
      setCurrentLevel(l => l + 1);
      setGameState("playing");
      setFeedback(null);
      setBallPos({ x: 0, y: 0 });
    } else {
      setGameState("gameOver");
    }
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setScore(0);
    setGameState("playing");
    setFeedback(null);
    setBallPos({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 bg-[#F0F4F8] overflow-hidden flex flex-col font-sans select-none">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#5AAFD1_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-200">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-ink-light tracking-widest uppercase opacity-60">KATAPEL JAKA</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-secondary">Skor: {score}</span>
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Main Arena */}
      <div ref={containerRef} className="flex-1 relative flex flex-col items-center pt-8 px-2">
        
        {/* 3D Wood Question Board */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative w-full max-w-lg mb-12"
        >
          <div className="absolute -inset-1 bg-black/10 rounded-3xl blur-sm transform translate-y-2"></div>
          <div className="relative bg-gradient-to-b from-[#8B4513] to-[#5D2E0C] border-b-8 border-[#3D1E08] p-6 rounded-3xl shadow-2xl">
             <div className="bg-[#FFF8E7]/10 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <p className="text-white text-center font-black text-lg md:text-xl leading-tight drop-shadow-md">
                  "{question.soal}"
                </p>
             </div>
             {/* Board Texture details */}
             <div className="absolute top-2 left-4 w-2 h-2 rounded-full bg-black/30"></div>
             <div className="absolute top-2 right-4 w-2 h-2 rounded-full bg-black/30"></div>
             <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-black/30"></div>
             <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-black/30"></div>
          </div>
        </motion.div>

        {/* Target Arena (The House & Bubbles) */}
        <div className="relative w-full flex-1 flex flex-col items-center justify-start pt-12">
          
          {/* Answer Bubbles (3D Capsules) - Horizontal Row */}
          <div className="grid grid-cols-4 gap-1.5 md:gap-4 w-full max-w-5xl z-20 px-1 md:px-4">
            {question.pilihan.map((text, idx) => {
              const isHit = feedback?.index === idx;
              const isCorrect = idx === question.jawabanBenar;
              
              // 3D Color Palette
              const bubbleColors = [
                "from-rose-400 via-rose-500 to-rose-700 shadow-rose-900/40", // Red
                "from-sky-400 via-sky-500 to-sky-700 shadow-sky-900/40",   // Blue
                "from-emerald-400 via-emerald-500 to-emerald-700 shadow-emerald-900/40", // Green
                "from-amber-400 via-amber-500 to-amber-700 shadow-amber-900/40" // Amber
              ];

              return (
                <motion.div
                  key={idx}
                  animate={
                    isHit 
                      ? (isCorrect ? { scale: [1, 1.5, 0], opacity: [1, 1, 0] } : { x: [0, -10, 10, -10, 10, 0] })
                      : { y: [0, -5, 0] }
                  }
                  transition={
                    isHit 
                      ? { duration: 0.5 } 
                      : { repeat: Infinity, duration: 2 + idx * 0.5, ease: "easeInOut" }
                  }
                  className={`relative rounded-full text-center transition-all cursor-pointer group`}
                >
                  {/* The 3D Capsule Look - Colorful Version */}
                  <div className={`
                    relative px-1 md:px-4 py-3 md:py-5 rounded-2xl md:rounded-3xl font-black 
                    text-[9px] md:text-sm tracking-tight leading-tight flex items-center justify-center min-h-[60px] md:min-h-[80px]
                    shadow-[0_8px_0_0_rgba(0,0,0,0.25),inset_0_4px_4px_rgba(255,255,255,0.4)]
                    bg-gradient-to-br border border-white/30 group-hover:scale-105 active:scale-95 transition-transform
                    ${!feedback ? bubbleColors[idx % 4] + " text-white" : ""}
                    ${feedback && isCorrect && isHit ? 'from-green-400 to-green-600 !text-white' : ''}
                    ${feedback && !isCorrect && isHit ? 'from-red-400 to-red-600 !text-white' : ''}
                    ${feedback && !isHit ? 'opacity-20 grayscale' : ''}
                  `}>
                    <span className="drop-shadow-md">{text}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Slingshot Section (Bottom) */}
        <div className="relative w-full h-64 mt-auto flex justify-center items-end pb-12">
          
          {/* Slingshot Handle (Custom Image) */}
          <div className="absolute bottom-0 w-48 h-64 flex justify-center pointer-events-none">
            <img 
              src="https://i.ibb.co.com/t59W6Hw/KATAPEL.png" 
              alt="Slingshot Handle" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Sling Rubber (Visual) */}
          <svg className="absolute bottom-32 w-48 h-32 pointer-events-none overflow-visible">
             <motion.line 
               x1="40" y1="50" 
               animate={{ x2: isDragging ? ballPos.x + 96 : 96, y2: isDragging ? ballPos.y + 40 : 40 }}
               transition={{ type: "spring", stiffness: 400, damping: 20 }}
               stroke="#3D1E08" strokeWidth="8" strokeLinecap="round" 
             />
             <motion.line 
               x1="152" y1="50" 
               animate={{ x2: isDragging ? ballPos.x + 96 : 96, y2: isDragging ? ballPos.y + 40 : 40 }}
               transition={{ type: "spring", stiffness: 400, damping: 20 }}
               stroke="#3D1E08" strokeWidth="8" strokeLinecap="round" 
             />
          </svg>

          {/* Trajectory Guide (Dots) */}
          {isDragging && (
            <div className="absolute bottom-[152px] pointer-events-none overflow-visible w-0 h-0 flex justify-center items-center">
              {[...Array(7)].map((_, i) => {
                const step = (i + 1) * 0.14;
                const power = 1.5;
                const dx = -ballPos.x * power * step;
                const dy = -ballPos.y * power * step - (125 * step);
                const scale = 1 - (step * 0.4);
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 - (step * 0.3), x: dx, y: dy, scale }}
                    className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]"
                  />
                );
              })}
            </div>
          )}

          {/* The Projectile (Ball) */}
          <AnimatePresence>
            <motion.div
              drag={gameState === "playing"}
              dragConstraints={{ top: 0, bottom: 150, left: -100, right: 100 }}
              dragElastic={0.1}
              onDragStart={() => setIsDragging(true)}
              onDrag={(e, info) => setBallPos({ x: info.offset.x, y: info.offset.y })}
              onDragEnd={handleRelease}
              animate={
                gameState === "flying" 
                ? { x: ballPos.x, y: ballPos.y, scale: 0.35, opacity: 0.8 } 
                : (gameState === "playing" ? { x: ballPos.x, y: ballPos.y, scale: 1, opacity: 1 } : { opacity: 0 })
              }
              transition={
                gameState === "flying" 
                ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
                : { type: "spring", damping: 15, stiffness: 300 }
              }
              className={`
                z-50 w-16 h-16 rounded-full cursor-grab active:cursor-grabbing
                shadow-[0_10px_20px_rgba(0,0,0,0.3),inset_0_-5px_10px_rgba(0,0,0,0.2)]
                bg-gradient-to-br from-primary via-primary-dark to-black
                border-2 border-white/20 flex items-center justify-center
                ${isDragging ? 'scale-110 shadow-2xl ring-4 ring-white/20' : ''}
              `}
              style={{ position: 'absolute', bottom: '120px' }}
            >
              {/* Ball Shine */}
              <div className="absolute top-2 left-3 w-4 h-2 bg-white/40 rounded-full rotate-[-30deg]"></div>
              <span className="material-symbols-rounded text-white text-3xl opacity-40">sports_baseball</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Popups & States */}
      <AnimatePresence>
        {gameState === "result" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-premium">
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${feedback?.type === "correct" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                {feedback?.type === "correct" ? <Trophy size={48} /> : <Target size={48} />}
              </div>
              <h2 className={`text-3xl font-black mb-2 ${feedback?.type === "correct" ? "text-green-600" : "text-red-600"}`}>
                {feedback?.type === "correct" ? "MANTEP!" : "YAHH..."}
              </h2>
              <p className="font-bold text-ink-light mb-6 opacity-60">
                {feedback?.type === "correct" 
                  ? "Jawaban kamu bener banget! Lanjut?" 
                  : `Jawaban yang bener: ${question.pilihan[question.jawabanBenar]}`}
              </p>
              <button 
                onClick={nextQuestion}
                className="w-full py-4 bg-secondary text-white rounded-2xl font-black text-lg tracking-widest shadow-glow-blue"
              >
                LANJUT
              </button>
            </div>
          </motion.div>
        )}

        {gameState === "gameOver" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-secondary/90 backdrop-blur-xl"
          >
            <div className="text-center text-white">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full mx-auto mb-8 flex items-center justify-center border-4 border-white"
              >
                <Trophy size={64} />
              </motion.div>
              <h1 className="text-5xl font-black mb-2 tracking-tighter italic">SELESAI!</h1>
              <p className="text-xl font-bold mb-10 opacity-80 px-10">
                Hebat! Kamu dapet skor <span className="text-primary font-black underline">{score}</span> poin.
              </p>
              
              <div className="flex flex-col gap-4 max-w-xs mx-auto">
                <button 
                  onClick={resetGame}
                  className="w-full py-5 bg-white text-secondary rounded-2xl font-black text-xl tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-105 transition-all"
                >
                  <RefreshCw /> MAIN LAGI
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="w-full py-5 bg-white/10 text-white border-2 border-white rounded-2xl font-black text-xl tracking-widest hover:bg-white/20 transition-all"
                >
                  KEMBALI
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}
