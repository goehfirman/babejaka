"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, LogIn, Swords, Users, Star } from "lucide-react";

interface LobbyProps {
  onCreate: () => void;
  onJoin: (code: string) => void;
  onSingle: () => void;
}

export default function TarikTambangLobby({ onCreate, onJoin, onSingle }: LobbyProps) {
  const [joinCode, setJoinCode] = useState("");

  return (
    <div className="min-h-screen bg-batik-subtle flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Single Player Option */}
        <motion.div 
          whileHover={{ y: -10 }}
          onClick={onSingle}
          className="bg-white/90 backdrop-blur-md p-8 rounded-[40px] shadow-premium border-2 border-white cursor-pointer group text-center flex flex-col justify-between"
        >
          <div>
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 mx-auto group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
              <Star size={40} />
            </div>
            <h2 className="text-2xl font-black text-ink mb-4">LATIHAN SENDIRI</h2>
            <p className="text-ink-light font-bold text-sm leading-relaxed">Asah kemampuanmu melawan Babe Jaka sebelum menantang teman!</p>
          </div>
          <button className="mt-8 py-4 bg-primary/10 text-primary font-black rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">MULAI LATIHAN</button>
        </motion.div>

        {/* Multiplayer: Join Room */}
        <motion.div 
          whileHover={{ y: -10 }}
          className="bg-white/90 backdrop-blur-md p-8 rounded-[40px] shadow-premium border-2 border-white text-center flex flex-col justify-between"
        >
          <div>
            <div className="w-20 h-20 bg-ink/5 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner text-ink/40">
              <LogIn size={40} />
            </div>
            <h2 className="text-2xl font-black text-ink mb-4">GABUNG TANDING</h2>
            <div className="space-y-3 mt-6">
              <input 
                type="text" 
                maxLength={6}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="KODE (MISAL: BJ-772)" 
                className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100 font-black text-center tracking-[0.2em] focus:border-secondary outline-none transition-all"
              />
              <button 
                onClick={() => onJoin(joinCode)}
                disabled={joinCode.length < 3}
                className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${
                  joinCode.length >= 3 ? 'bg-ink text-white shadow-lg active:scale-95' : 'bg-gray-100 text-gray-300'
                }`}
              >
                GABUNG SEKARANG
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
