"use client";
import React, { useState } from "react";
import { useProfile } from "@/lib/profile-context";
import BrandLogo from "./BrandLogo";

interface NamePromptModalProps {
  onClose?: () => void;
  onSuccess?: (name: string) => void;
  isCompulsory?: boolean;
}

export default function NamePromptModal({ onClose, onSuccess, isCompulsory = false }: NamePromptModalProps) {
  const { login } = useProfile();
  const [inputName, setInputName] = useState("");
  const [inputSchool, setInputSchool] = useState("");

  const saveName = (e: React.FormEvent) => {
    e.preventDefault();
    const name = inputName.trim();
    const school = inputSchool.trim();
    if (name && school) {
      login(name, school);
      if (onSuccess) onSuccess(name);
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-fade-in">
      {/* Backdrop with strong blur and transparency */}
      <div 
        className="absolute inset-0 bg-ink/40 backdrop-blur-xl transition-opacity duration-500" 
        onClick={() => !isCompulsory && onClose?.()}
      ></div>
      
      {/* Modal Box with Reddish Gradient & Glassmorphism */}
      <div className="relative z-10 w-full max-w-[480px] p-8 md:p-12 
        bg-white/90 rounded-[40px] shadow-premium animate-bounce-in 
        border border-white/40 overflow-hidden"
      >
        {/* Subtle Reddish Glow/Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-10 scale-110">
            <BrandLogo size="md" showIcon={true} centered={true} />
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-ink tracking-tighter mb-4 text-center leading-tight">
            Halo, <span className="text-primary italic">Jagoan Kata!</span>
          </h2>
          
          <p className="text-xs md:text-sm font-bold text-ink-light mb-10 leading-relaxed text-center opacity-60 px-4">
            Tuliskan nama dan sekolahmu. Ayo kita berpetualang bersama Babe Jaka!
          </p>
          
          <form onSubmit={saveName} className="space-y-4">
            <div className="relative group">
              <input 
                type="text" 
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Namamu di sini"
                autoFocus
                className="w-full bg-white/80 border border-gray-100 rounded-2xl px-8 py-4 text-lg font-bold text-ink placeholder:text-gray-300 outline-none focus:border-primary focus:bg-white transition-all shadow-sm text-center focus:scale-[1.01]"
              />
            </div>

            <div className="relative group">
              <input 
                type="text" 
                value={inputSchool}
                onChange={(e) => setInputSchool(e.target.value)}
                placeholder="Nama sekolahmu"
                className="w-full bg-white/80 border border-gray-100 rounded-2xl px-8 py-4 text-lg font-bold text-ink placeholder:text-gray-300 outline-none focus:border-primary focus:bg-white transition-all shadow-sm text-center focus:scale-[1.01]"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={!inputName.trim() || !inputSchool.trim()}
              className={`w-full py-5 rounded-2xl font-black text-lg tracking-wider transition-all flex items-center justify-center gap-3 ${
                inputName.trim() && inputSchool.trim()
                ? 'btn-heritage shadow-glow-red' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              Mulai Petualangan
            </button>
          </form>

          {!isCompulsory && (
            <button 
              onClick={onClose}
              className="mt-8 w-full text-center text-ink-light font-bold text-sm hover:text-primary transition-all opacity-40 hover:opacity-100"
            >
              Lewati untuk sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
