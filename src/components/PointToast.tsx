"use client";
import React, { useEffect, useState } from "react";

interface PointToastProps {
  amount: number;
  onClose: () => void;
}

export function PointToast({ amount, onClose }: PointToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500); // Wait for exit animation
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className="bg-[#FFB347] text-white px-8 py-4 rounded-3xl shadow-2xl border-4 border-white flex items-center gap-4 animate-bounce">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-3xl">
          ⭐
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Poin Bertambah!</p>
          <p className="text-2xl font-black">+{amount} Bintang</p>
        </div>
      </div>
    </div>
  );
}
