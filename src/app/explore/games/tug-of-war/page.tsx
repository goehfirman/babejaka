"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Trophy, Users, Star, Swords, Volume2 } from "lucide-react";
import { useProfile } from "@/lib/profile-context";
import { StarFly } from "@/components/StarFly";
import { db } from "@/lib/firebase";
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  getDoc, 
  serverTimestamp 
} from "firebase/firestore";
import TarikTambangLobby from "./TarikTambangLobby";

// --- SFX Helper ---
const playSound = (type: 'pull' | 'win' | 'correct' | 'wrong') => {
  // Logic to play sound (Placeholders for user to add actual mp3 files)
  const sounds: Record<string, string> = {
    pull: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3", // Short pull sound
    win: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",  // Cheer
    correct: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
    wrong: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3"
  };
  const audio = new Audio(sounds[type]);
  audio.volume = 0.5;
  audio.play().catch(() => {}); // Catch browser autoplay block
};

const QUESTIONS = [
  { id: 1, soal: "Apa bahan utama pembuatan Bir Pletok yang memberikan rasa hangat?", pilihan: ["Cokelat", "Jahe & Secang", "Susu Sapi", "Teh Manis"], jawabanBenar: 1 },
  { id: 2, soal: "Kerak Telor biasanya menggunakan telur apa agar lebih gurih?", pilihan: ["Telur Puyuh", "Telur Ayam", "Telur Bebek", "Telur Angsa"], jawabanBenar: 2 },
  { id: 3, soal: "Seni beladiri Silat khas Betawi sering disebut dengan istilah...", pilihan: ["Maen Pukulan", "Maen Tendangan", "Jurus Buaya", "Cakalele"], jawabanBenar: 0 },
  { id: 4, soal: "Kue tradisional Betawi yang berbentuk bunga mekar dan manis adalah...", pilihan: ["Kue Ape", "Kue Cucur", "Kue Rangi", "Kue Pancong"], jawabanBenar: 1 },
  { id: 5, soal: "Ondel-ondel biasanya digunakan dalam upacara adat Betawi untuk...", pilihan: ["Lomba Lari", "Menolak Bala", "Mencari Ikan", "Menabung"], jawabanBenar: 1 }
];

export default function TugOfWarGame() {
  const router = useRouter();
  const { profile, addPoints } = useProfile();
  
  const [gameMode, setGameMode] = useState<"select" | "single" | "multi-lobby" | "multi-playing">("select");
  const [roomId, setRoomId] = useState("");
  const [playerRole, setPlayerRole] = useState<"p1" | "p2" | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameState, setGameState] = useState("playing");
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [pendingStars, setPendingStars] = useState<{ count: number; timestamp: number; positions: { x: number; y: number }[] }>({ count: 0, timestamp: 0, positions: [] });
  const [feedback, setFeedback] = useState<null | { type: "correct" | "wrong"; index: number }>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const answerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Calculation for 2.5D Rope Position
  // Base 50 + (opponentScore - playerScore)
  // Multi: p1 is left (score pulls to 0), p2 is right (score pulls to 100)
  const calculateMultiPos = () => {
    if (!roomData) return 50;
    // Use the synced ropePosition from Firestore if available
    if (roomData.gameplay?.ropePosition !== undefined) {
      return roomData.gameplay.ropePosition;
    }
    const p1Score = roomData.players.p1.score || 0;
    const p2Score = roomData.players.p2?.score || 0;
    return 50 + (p2Score - p1Score);
  };

  const ropePosition = gameMode === "single" ? (50 + (opponentScore - playerScore)) : calculateMultiPos();
  const ropeOffset = (ropePosition - 50) * 4;

  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, "rooms", roomId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRoomData(data);
        if (data.metadata.status === "playing") setGameMode("multi-playing");
        if (data.metadata.status === "finished") setGameState("gameOver");
      }
    });
    return () => unsub();
  }, [roomId]);

  // --- Actions ---
  const createRoom = async () => {
    const code = `BJ-${Math.floor(100 + Math.random() * 900)}`;
    const newRoom = {
      metadata: { status: "waiting", createdAt: serverTimestamp(), winner: null },
      players: {
        p1: { name: profile.name, isReady: false, score: 0, lastAnswerStatus: null },
        p2: null
      },
      gameplay: { ropePosition: 50, winThreshold: 30 }
    };
    await setDoc(doc(db, "rooms", code), newRoom);
    setRoomId(code);
    setPlayerRole("p1");
    setGameMode("multi-lobby");
  };

  const joinRoom = async (code: string) => {
    const docRef = doc(db, "rooms", code.toUpperCase());
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (!data.players.p2) {
        await updateDoc(docRef, { "players.p2": { name: profile.name, isReady: false, score: 0, lastAnswerStatus: null } });
        setRoomId(code.toUpperCase());
        setPlayerRole("p2");
        setGameMode("multi-lobby");
      } else alert("Penuh!");
    } else alert("Salah Kode!");
  };

  const handleAnswer = async (index: number) => {
    if (gameState !== "playing" || feedback !== null) return;
    const duration = (Date.now() - startTime) / 1000;
    const isCorrect = index === QUESTIONS[currentLevel].jawabanBenar;
    setFeedback({ type: isCorrect ? "correct" : "wrong", index });

    if (isCorrect) playSound('correct'); else playSound('wrong');

    if (gameMode === "single") {
      if (isCorrect) {
        const power = duration < 2 ? 4 : (duration < 5 ? 2 : 1);
        setPlayerScore(s => s + power);
        triggerStars(index);
        playSound('pull');
      } else {
        setOpponentScore(s => s + 2);
      }
      checkWin(playerScore, opponentScore);
      setTimeout(() => { 
        setCurrentLevel(p => (p + 1) % QUESTIONS.length); 
        setFeedback(null); 
        setStartTime(Date.now()); 
      }, 1500);
    } else {
      // Multiplayer
      if (!roomId || !playerRole || !roomData) return;
      
      const power = isCorrect ? (duration < 2 ? 4 : 2) : 0;
      const otherRole = playerRole === "p1" ? "p2" : "p1";
      
      const currentScore = (roomData.players as any)[playerRole].score || 0;
      const updates: any = {
        [`players.${playerRole}.score`]: currentScore + power,
        [`players.${playerRole}.lastAnswerStatus`]: isCorrect ? "correct" : "wrong"
      };
 
      if (!isCorrect) {
        updates[`players.${otherRole}.score`] = (roomData.players[otherRole]?.score || 0) + 2;
      }
 
      await updateDoc(doc(db, "rooms", roomId), updates);
      if (isCorrect) { triggerStars(index); playSound('pull'); }
      
      // Check Win: Marker enters Finish Zone (40 or 60)
      const p1S = updates[`players.p1.score`] || roomData.players.p1.score;
      const p2S = updates[`players.p2.score`] || roomData.players.p2?.score || 0;
      const currentPos = 50 + (p2S - p1S);
      
      if (currentPos <= 40 || currentPos >= 60) {
        await updateDoc(doc(db, "rooms", roomId), {
          "metadata.status": "finished",
          "metadata.winner": currentPos <= 40 ? "p1" : "p2"
        });
        playSound('win');
      }
 
      setTimeout(() => { setFeedback(null); setCurrentLevel(p => (p + 1) % QUESTIONS.length); setStartTime(Date.now()); }, 1500);
    }
  };
 
  const checkWin = (p: number, o: number) => {
    const currentPos = 50 + (o - p);
    if (currentPos <= 40 || currentPos >= 60) {
      setGameState("gameOver");
      playSound('win');
    }
  };

  const triggerStars = (index: number) => {
    const btn = answerRefs.current[index];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setPendingStars({ 
        count: 5, 
        timestamp: Date.now(), 
        positions: Array.from({ length: 5 }).map(() => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }))
      });
    }
  };

  if (gameMode === "select") return <TarikTambangLobby onCreate={createRoom} onJoin={joinRoom} onSingle={() => setGameMode("single")} />;

  if (gameMode === "multi-lobby") return (
    <div className="min-h-screen bg-batik-subtle flex items-center justify-center p-6">
       <div className="bg-white/90 backdrop-blur-xl p-12 rounded-[48px] shadow-premium max-w-2xl w-full border-4 border-white text-center">
          <h2 className="text-sm font-black text-ink-light tracking-widest uppercase mb-8 opacity-40 italic">Menunggu Tantangan...</h2>
          <div className="bg-gray-100/50 p-8 rounded-3xl mb-12 border border-gray-100">
             <span className="text-[10px] font-black text-ink-light block mb-2 opacity-50 tracking-[0.3em]">KODE RAHASIA</span>
             <div className="text-6xl font-black text-secondary tracking-tighter shadow-sm">{roomId}</div>
          </div>
          <div className="grid grid-cols-2 gap-12 mb-12">
             <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center border-4 border-secondary animate-pulse"><Users className="text-secondary" /></div>
                <span className="font-black text-ink">{roomData?.players.p1.name}</span>
                <span className="text-[10px] font-black text-secondary">PEMBUAT</span>
             </div>
             <div className="flex flex-col items-center gap-4">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${roomData?.players.p2 ? 'border-primary bg-primary/10' : 'border-dashed border-gray-300'}`}>
                   {roomData?.players.p2 ? <Users className="text-primary" /> : <div className="text-gray-300 animate-spin"><RefreshCw /></div>}
                </div>
                <span className="font-black text-ink">{roomData?.players.p2?.name || "???"}</span>
                <span className="text-[10px] font-black text-ink-light opacity-40">PENANTANG</span>
             </div>
          </div>
          <button 
            onClick={async () => {
              const isReady = !roomData.players[playerRole!].isReady;
              await updateDoc(doc(db, "rooms", roomId), { [`players.${playerRole}.isReady`]: isReady });
              if (isReady && (roomData.players[playerRole === 'p1' ? 'p2' : 'p1']?.isReady)) {
                await updateDoc(doc(db, "rooms", roomId), { "metadata.status": "playing" });
              }
            }}
            disabled={!roomData?.players.p2}
            className={`w-full py-6 rounded-3xl font-black text-xl transition-all shadow-glow-blue ${roomData?.players[playerRole!]?.isReady ? 'bg-success text-white' : 'bg-secondary text-white hover:-translate-y-1'}`}
          >
            {roomData?.players[playerRole!]?.isReady ? "SAYA SIAP!" : "MULAI TANDING"}
          </button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F4F8] relative overflow-hidden flex flex-col">
      <div className="relative z-50 p-6 flex items-center justify-between">
        <button onClick={() => setGameMode("select")} className="p-2 hover:bg-white/50 rounded-full transition-all text-ink"><ArrowLeft size={24} /></button>
        <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-white shadow-sm flex items-center gap-3">
           <Swords className="text-secondary" size={20} />
           <span className="text-xs font-black text-ink tracking-widest">{gameMode === 'single' ? 'LATIHAN' : `ARENA: ${roomId}`}</span>
        </div>
        <div className="flex items-center gap-4">
           <Volume2 className="text-ink-light opacity-30" />
           <div className="bg-ink text-white px-5 py-2 rounded-2xl flex items-center gap-2">
              <Star className="text-yellow-400 fill-yellow-400" size={16} />
              <span className="font-black">{profile.points}</span>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
         <div className="relative w-full max-w-6xl h-96 mb-12 flex items-center justify-center">
            
            {/* Strategic Finish Lines (Thin & Clear) */}
            <div className="absolute inset-0 flex justify-between items-center px-[40%] pointer-events-none">
               {/* Finish P1 Line */}
               <div className="h-full w-1 bg-red-500/40 relative">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-2 py-0.5 rounded text-[8px] font-black shadow-sm">FINISH</div>
               </div>
               
               {/* Finish P2 Line */}
               <div className="h-full w-1 bg-red-500/40 relative">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-2 py-0.5 rounded text-[8px] font-black shadow-sm">FINISH</div>
               </div>
            </div>

            {/* Center Reference Line (dotted) */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-blue-200 opacity-50 z-0"></div>

            {/* Unified Rope System - Removed overflow-hidden to prevent clipping */}
            <div className="absolute inset-0 flex items-center justify-center">
               <motion.div 
                 animate={{ x: (ropePosition - 50) + "%" }}
                 transition={{ type: "spring", stiffness: 40, damping: 15 }}
                 className="relative w-full h-40 flex items-center justify-center"
               >
                  {/* The Rope */}
                  <div className="absolute w-full h-6 bg-[#A0522D] shadow-xl rounded-full flex items-center">
                     <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '15px 15px' }}></div>
                  </div>

                  {/* Red Center Marker */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-30 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-gray-50">
                     <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white"></div>
                  </div>

                  {/* Player 1 (Ujung Kiri - Lebih Jauh) */}
                  <motion.div 
                    animate={{ rotate: ropePosition < 50 ? 20 : 0 }}
                    className="absolute left-[5%] flex flex-col items-center"
                  >
                     <div className="relative group">
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/10 rounded-[100%] blur-md"></div>
                        <img src="https://i.ibb.co.com/vxhZR8wB/MASKOT-BABE.png" className="w-44 h-44 object-contain drop-shadow-2xl" />
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
                           {gameMode === "single" ? "KAMU" : roomData?.players.p1.name}
                        </div>
                     </div>
                  </motion.div>

                  {/* Player 2 (Ujung Kanan - Lebih Jauh) */}
                  <motion.div 
                    animate={{ rotate: ropePosition > 50 ? -20 : 0 }}
                    className="absolute right-[5%] flex flex-col items-center scale-x-[-1]"
                  >
                     <div className="relative group">
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/10 rounded-[100%] blur-md"></div>
                        <img src="https://i.ibb.co.com/d4jXMJp2/babe-bingung.png" className="w-44 h-44 object-contain drop-shadow-2xl grayscale opacity-70" />
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg whitespace-nowrap scale-x-[-1]">
                           {gameMode === "single" ? "BOT" : roomData?.players.p2?.name || "LAWAN"}
                        </div>
                     </div>
                  </motion.div>
               </motion.div>
            </div>
         </div>

         <AnimatePresence mode="wait">
            {gameState !== "gameOver" ? (
              <motion.div key={currentLevel} className="w-full max-w-2xl px-6">
                 <div className="bg-white p-10 rounded-[3rem] shadow-premium border-2 border-white relative text-center">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-black px-6 py-1 rounded-full shadow-lg">KUIS BETAWI</div>
                    <h2 className="text-2xl font-black text-ink mb-10 leading-tight">{QUESTIONS[currentLevel].soal}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {QUESTIONS[currentLevel].pilihan.map((p, idx) => (
                         <button 
                           key={idx} 
                           ref={el => { answerRefs.current[idx] = el; }}
                           onClick={() => handleAnswer(idx)} 
                           disabled={feedback !== null}
                           className={`py-5 px-8 rounded-3xl font-bold text-sm transition-all border-b-8 ${
                             feedback?.index === idx 
                             ? (feedback.type === 'correct' ? 'bg-success border-success-dark text-white' : 'bg-primary border-primary-dark text-white animate-shake')
                             : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-secondary hover:text-secondary'
                           }`}
                         >{p}</button>
                       ))}
                    </div>
                 </div>
              </motion.div>
            ) : (
              <div className="bg-white p-12 rounded-[4rem] shadow-premium text-center border-4 border-white max-w-md w-full">
                 <Trophy className="mx-auto text-secondary w-16 h-16 mb-6" />
                 <h2 className="text-4xl font-black text-ink mb-2 tracking-tighter">MENANG MUTLAK!</h2>
                 <p className="font-bold text-ink-light mb-10 italic">Hebat! Kamu berhasil menarik lawan hingga terjatuh!</p>
                 <button onClick={() => window.location.reload()} className="w-full bg-secondary text-white font-black py-5 rounded-3xl shadow-glow-blue flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                    <RefreshCw /> MAIN LAGI
                 </button>
              </div>
            )}
         </AnimatePresence>
      </div>
      <StarFly burst={pendingStars} onStarHit={() => addPoints(1)} />
    </div>
  );
}
