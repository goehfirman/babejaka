"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Trophy, Users, Star, Swords, LogIn, Plus } from "lucide-react";
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

// --- Game Data ---
const QUESTIONS = [
  { id: 1, soal: "Makanan khas Betawi yang terbuat dari beras ketan, telur bebek, dan serundeng adalah...", pilihan: ["Nasi Uduk", "Kerak Telor", "Ketoprak", "Lontong Sayur"], jawabanBenar: 1 },
  { id: 2, soal: "Minuman tradisional Betawi yang terbuat dari rempah-rempah dan tidak mengandung alkohol disebut...", pilihan: ["Bir Pletok", "Es Selendang Mayang", "Sekoteng", "Bajigur"], jawabanBenar: 0 },
  { id: 3, soal: "Roti berbentuk buaya yang wajib ada dalam hantaran pernikahan adat Betawi melambangkan...", pilihan: ["Kekuatan", "Kesetiaan", "Keberanian", "Kekayaan"], jawabanBenar: 1 },
  { id: 4, soal: "Kue tradisional Betawi yang berwarna-warni dan disajikan dengan kuah santan gula merah adalah...", pilihan: ["Kue Cucur", "Es Selendang Mayang", "Kue Ape", "Kue Rangi"], jawabanBenar: 1 },
  { id: 5, soal: "Seni bela diri asli masyarakat Betawi disebut...", pilihan: ["Pencak Silat", "Tarung Derajat", "Maen Pukulan", "Wushu"], jawabanBenar: 2 }
];

export default function TugOfWarGame() {
  const router = useRouter();
  const { profile, addPoints } = useProfile();
  
  // Game Modes: 'select', 'single', 'multi-lobby', 'multi-playing'
  const [gameMode, setGameMode] = useState<"select" | "single" | "multi-lobby" | "multi-playing">("select");
  
  // Multiplayer State
  const [roomId, setRoomId] = useState("");
  const [playerRole, setPlayerRole] = useState<"p1" | "p2" | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  
  // Local Game State
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameState, setGameState] = useState("playing");
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [pendingStars, setPendingStars] = useState<{ count: number; timestamp: number; positions: { x: number; y: number }[] }>({ count: 0, timestamp: 0, positions: [] });
  const [feedback, setFeedback] = useState<null | { type: "correct" | "wrong"; index: number }>(null);
  const [gameQuestions, setGameQuestions] = useState(QUESTIONS);
  const [startTime, setStartTime] = useState(Date.now());
  const answerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Calculate rope offset
  const lead = gameMode === "single" ? (playerScore - opponentScore) : 0;
  const multiRopePos = roomData?.gameplay?.ropePosition ?? 50;
  const ropeOffset = gameMode === "single" ? lead * 4 : (multiRopePos - 50) * 2;

  // Realtime Sync for Multiplayer
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

  // --- Multiplayer Actions ---
  const createRoom = async () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom = {
      metadata: { status: "waiting", createdAt: serverTimestamp(), winner: null },
      players: {
        p1: { name: profile.name, isReady: false, score: 0, lastAnswerStatus: null },
        p2: null
      },
      gameplay: { currentQuestionId: 0, ropePosition: 50, winThreshold: 30, lastUpdatedBy: "p1" }
    };
    await setDoc(doc(db, "rooms", code), newRoom);
    setRoomId(code);
    setPlayerRole("p1");
    setGameMode("multi-lobby");
  };

  const joinRoom = async (code: string) => {
    if (!code) return;
    const docRef = doc(db, "rooms", code.toUpperCase());
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (!data.players.p2) {
        await updateDoc(docRef, {
          "players.p2": { name: profile.name, isReady: false, score: 0, lastAnswerStatus: null }
        });
        setRoomId(code.toUpperCase());
        setPlayerRole("p2");
        setGameMode("multi-lobby");
      } else {
        alert("Ruangan sudah penuh!");
      }
    } else {
      alert("Kode ruangan tidak ditemukan!");
    }
  };

  const toggleReady = async () => {
    if (!roomId || !playerRole) return;
    const isReady = !roomData.players[playerRole].isReady;
    await updateDoc(doc(db, "rooms", roomId), {
      [`players.${playerRole}.isReady`]: isReady
    });

    const otherRole = playerRole === "p1" ? "p2" : "p1";
    if (isReady && roomData.players[otherRole]?.isReady) {
      await updateDoc(doc(db, "rooms", roomId), { "metadata.status": "playing" });
    }
  };

  // --- Gameplay Logic ---
  const handleAnswer = async (index: number) => {
    if (gameState !== "playing" || feedback !== null) return;

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    const isCorrect = index === QUESTIONS[currentLevel].jawabanBenar;
    
    setFeedback({ type: isCorrect ? "correct" : "wrong", index });

    if (gameMode === "single") {
      if (isCorrect) {
        const pullPower = Math.max(5, Math.floor(10 - duration));
        setPlayerScore(s => s + pullPower);
        triggerStars(index);
      } else {
        setOpponentScore(s => s + 8);
      }

      setTimeout(() => {
        if (currentLevel < QUESTIONS.length - 1) {
          setCurrentLevel(prev => prev + 1);
          setFeedback(null);
          setStartTime(Date.now());
        } else {
          setGameState("gameOver");
        }
      }, 1500);
    } else {
      // Multiplayer logic
      if (!roomId || !playerRole) return;
      const pull = isCorrect ? 8 : -8;
      const move = playerRole === "p1" ? -pull : pull;
      const newPos = Math.max(0, Math.min(100, roomData.gameplay.ropePosition + move));

      await updateDoc(doc(db, "rooms", roomId), {
        [`players.${playerRole}.score`]: (roomData.players[playerRole].score || 0) + (isCorrect ? 10 : 0),
        [`players.${playerRole}.lastAnswerStatus`]: isCorrect ? "correct" : "wrong",
        "gameplay.ropePosition": newPos
      });

      if (isCorrect) triggerStars(index);

      if (newPos <= 0 || newPos >= 100) {
        await updateDoc(doc(db, "rooms", roomId), {
          "metadata.status": "finished",
          "metadata.winner": newPos <= 0 ? "p1" : "p2"
        });
      } else {
        setTimeout(() => {
          setFeedback(null);
          setCurrentLevel(prev => (prev + 1) % QUESTIONS.length);
          setStartTime(Date.now());
        }, 1500);
      }
    }
  };

  const triggerStars = (index: number) => {
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
  };

  // --- Render Branches ---
  if (gameMode === "select") {
    return (
      <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-6">
         <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div whileHover={{ scale: 1.02 }} onClick={() => setGameMode("single")} className="bg-white p-10 rounded-[40px] shadow-xl border-2 border-white cursor-pointer group flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all"><Star size={48} /></div>
               <h2 className="text-3xl font-black text-ink mb-4">MODE SENDIRI</h2>
               <p className="text-ink-light font-bold">Berlatih dan asah pengetahuanmu bersama Babe Jaka!</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} onClick={createRoom} className="bg-white p-10 rounded-[40px] shadow-xl border-2 border-white cursor-pointer group flex flex-col items-center text-center">
               <div className="w-24 h-24 bg-secondary/10 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-all"><Swords size={48} /></div>
               <h2 className="text-3xl font-black text-ink mb-4">MODE TANDING</h2>
               <p className="text-ink-light font-bold">Tantang temanmu secara real-time!</p>
               <div className="mt-8 flex gap-2 w-full">
                  <input type="text" placeholder="KODE" onClick={(e) => e.stopPropagation()} className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 font-bold uppercase" onKeyDown={(e) => { if (e.key === 'Enter') joinRoom((e.target as HTMLInputElement).value); }} />
                  <button className="bg-secondary text-white p-3 rounded-xl"><LogIn /></button>
               </div>
            </motion.div>
         </div>
      </div>
    );
  }

  if (gameMode === "multi-lobby") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
         <div className="bg-white p-12 rounded-[48px] shadow-2xl max-w-2xl w-full border-4 border-white">
            <h2 className="text-xl font-black text-ink-light tracking-widest uppercase mb-8">RUANG TANDING</h2>
            <div className="bg-gray-50 p-6 rounded-3xl mb-12 border border-gray-100">
               <span className="text-[10px] font-black text-gray-400 block mb-2">KODE RUANGAN</span>
               <div className="text-5xl font-black text-secondary">{roomId}</div>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-12">
               <div className="flex flex-col items-center gap-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${roomData?.players.p1.isReady ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}><Users /></div>
                  <span className="font-black text-ink">{roomData?.players.p1.name}</span>
               </div>
               <div className="flex flex-col items-center gap-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${roomData?.players.p2?.isReady ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>{roomData?.players.p2 ? <Users /> : <Plus className="text-gray-300" />}</div>
                  <span className="font-black text-ink">{roomData?.players.p2?.name || "Menunggu..."}</span>
               </div>
            </div>
            <button onClick={toggleReady} disabled={!roomData?.players.p2} className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-glow-blue ${roomData?.players[playerRole!]?.isReady ? 'bg-green-500 text-white' : 'bg-secondary text-white'}`}>
              {roomData?.players[playerRole!]?.isReady ? "SIAP!" : "SIAP BERMAIN"}
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] relative overflow-hidden">
      <div className="relative z-50 p-6 flex items-center justify-between">
        <button onClick={() => setGameMode("select")} className="p-2 hover:bg-white/50 rounded-full transition-all text-gray-600"><ArrowLeft size={24} /></button>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
           <Users size={16} className="text-secondary" />
           <span className="text-[10px] font-black tracking-widest uppercase text-ink-light">{gameMode === "single" ? "MODE SENDIRI" : `TANDING: ${roomId}`}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-sm">
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-ink-light tracking-widest uppercase opacity-60">POIN BINTANG</span>
             <div className="flex items-center gap-1.5"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /><span className="text-xl font-black text-ink">{profile.points}</span></div>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pt-8 px-4">
         <div className="relative w-full max-w-5xl h-80 mb-12 flex items-center justify-center">
            <div className="absolute bottom-16 left-0 right-0 h-1.5 bg-gray-300 rounded-full"></div>
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-0.5 h-32 bg-gray-300/50"></div>
            <div className="absolute bottom-[80px] w-full overflow-hidden h-20 flex items-center">
              <motion.div className="relative h-4 bg-[#A0522D] shadow-xl rounded-full flex items-center justify-center" animate={{ x: -ropeOffset * 6 }} transition={{ type: "spring", stiffness: 60, damping: 12 }} style={{ width: '200%', left: '-50%' }}>
                 <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '20px 20px' }}></div>
                 <div className="absolute left-1/2 -translate-x-1/2 w-8 h-12 bg-yellow-400 border-4 border-yellow-500 shadow-lg rounded-md z-30 flex items-center justify-center"><div className="w-full h-1 bg-yellow-600/30"></div></div>
              </motion.div>
            </div>
            <div className="absolute inset-0 flex justify-between items-end px-4 md:px-20 pb-16">
               <motion.div animate={{ x: -ropeOffset * 6, rotate: lead < 0 || (gameMode !== 'single' && multiRopePos < 50) ? 12 : 0 }} className="flex items-end gap-[-40px]">
                  <div className="relative w-28 h-28 z-20"><img src="https://i.ibb.co.com/vxhZR8wB/MASKOT-BABE.png" alt="P1" className="w-full h-full object-contain" /></div>
                  <div className="absolute -top-12 left-0 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-glow-red">{gameMode === "single" ? "KAMU" : roomData?.players.p1.name}</div>
               </motion.div>
               <motion.div animate={{ x: -ropeOffset * 6, rotate: lead > 0 || (gameMode !== 'single' && multiRopePos > 50) ? -12 : 0 }} className="flex items-end flex-row-reverse gap-[-40px]">
                  <div className="relative w-28 h-28 z-20 scale-x-[-1]"><img src="https://i.ibb.co.com/d4jXMJp2/babe-bingung.png" alt="P2" className="w-full h-full object-contain grayscale opacity-60" /></div>
                  <div className="absolute -top-12 right-0 bg-gray-600 text-white text-[10px] font-black px-3 py-1 rounded-full">{gameMode === "single" ? "BOT" : roomData?.players.p2?.name || "LAWAN"}</div>
               </motion.div>
            </div>
         </div>

         <AnimatePresence mode="wait">
            {gameState !== "gameOver" ? (
              <motion.div key={currentLevel} className="w-full max-w-2xl">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-white mb-8 text-center w-full relative">
                   <h2 className="text-xl md:text-2xl font-black text-ink leading-tight mb-8">{QUESTIONS[currentLevel].soal}</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {QUESTIONS[currentLevel].pilihan.map((p, idx) => (
                        <button key={idx} ref={el => { answerRefs.current[idx] = el; }} onClick={() => handleAnswer(idx)} disabled={feedback !== null}
                          className={`py-4 px-6 rounded-2xl font-bold text-sm transition-all border-b-4 ${feedback?.index === idx ? (feedback.type === "correct" ? "bg-green-500 border-green-700 text-white" : "bg-red-500 border-red-700 text-white animate-shake") : "bg-gray-50 border-gray-200 text-ink hover:bg-white hover:border-secondary hover:text-secondary"}`}
                        >{p}</button>
                      ))}
                   </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-lg w-full">
                <h2 className="text-4xl font-black text-ink mb-2">PERMAINAN SELESAI!</h2>
                <p className="text-ink-light font-bold mb-8">
                  {gameMode === 'single' ? (playerScore - opponentScore > 0 ? "Menang!" : "Kalah!") : (roomData.metadata.winner === playerRole ? "Kamu Menang!" : "Kamu Kalah!")}
                </p>
                <button onClick={() => window.location.reload()} className="w-full bg-secondary text-white font-black py-4 rounded-2xl shadow-glow-blue flex items-center justify-center gap-2 hover:-translate-y-1 transition-all"><RefreshCw size={20} /> MULAI LAGI</button>
              </div>
            )}
         </AnimatePresence>
      </div>
      <StarFly burst={pendingStars} onStarHit={() => addPoints(1)} />
    </div>
  );
}
