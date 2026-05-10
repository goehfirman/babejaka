"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, LogIn, Swords, Users, Star, RefreshCw } from "lucide-react";

interface LobbyProps {
  onCreate: () => void;
  onJoin: (code: string) => void;
  onSingle: () => void;
  isJoining?: boolean;
}

export default function TarikTambangLobby({ onCreate, onJoin, onSingle, isJoining }: LobbyProps) {
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

        {/* Multiplayer: Join/Create via Code */}
        <motion.div 
          whileHover={{ y: -10 }}
          className="bg-white/90 backdrop-blur-md p-8 rounded-[40px] shadow-premium border-2 border-white text-center flex flex-col justify-between"
        >
          <div>
            <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
              <Users size={40} />
            </div>
            <h2 className="text-2xl font-black text-ink mb-4 uppercase">Ajak Teman</h2>
            <p className="text-ink-light font-bold text-xs mb-6">Masukkan 4 angka rahasia untuk bertanding dengan temanmu!</p>
            
            <div className="space-y-4 mt-6">
              <div className="relative">
                <input 
                  type="text" 
                  maxLength={4}
                  value={joinCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setJoinCode(val);
                  }}
                  placeholder="____" 
                  className="w-full px-6 py-6 bg-gray-50 rounded-3xl border-4 border-gray-100 font-black text-center text-4xl tracking-[0.5em] focus:border-secondary outline-none transition-all placeholder:text-gray-200"
                />
                <button 
                  onClick={() => {
                    const random = Math.floor(1000 + Math.random() * 9000).toString();
                    setJoinCode(random);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-secondary hover:bg-secondary hover:text-white transition-all active:scale-90"
                  title="Acak Kode"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
              <button 
                onClick={() => onJoin(joinCode)}
                disabled={joinCode.length !== 4 || isJoining}
                className={`w-full py-6 rounded-3xl font-black text-xl transition-all flex items-center justify-center gap-2 ${
                  joinCode.length === 4 && !isJoining ? 'bg-secondary text-white shadow-glow-blue active:scale-95' : 'bg-gray-100 text-gray-300'
                }`}
              >
                {isJoining ? <RefreshCw className="animate-spin" /> : "MULAI TANDING"}
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
