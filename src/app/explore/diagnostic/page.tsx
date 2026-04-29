"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function DiagnosticHubPage() {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  const STAGES = [
    { id: 'A', title: 'Pembaca Dini', desc: 'Mengenal huruf & bunyi suku kata.', angle: 0, color: '#C62828' },
    { id: 'B', title: 'Pembaca Awal', desc: 'Mulai merangkai kata & kalimat pendek.', angle: 72, color: '#1A237E' },
    { id: 'C', title: 'Pembaca Semenjana', desc: 'Lancar membaca & paham isi cerita.', angle: 144, color: '#2E7D32' },
    { id: 'D', title: 'Pembaca Madya', desc: 'Mampu analisis & ambil pesan cerita.', angle: 216, color: '#FBC02D' },
    { id: 'E', title: 'Pembaca Mahir', desc: 'Berpikir kritis & evaluasi teks sulit.', angle: 288, color: '#3949AB' },
  ];

  return (
    <div className="h-[100dvh] bg-batik-subtle flex flex-col items-center justify-start font-body relative overflow-hidden pt-[130px] md:pt-[150px] pb-6 px-4">
      
      {/* Decorative Aura */}
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="w-full max-w-4xl relative z-10 flex flex-col items-center text-center h-full justify-between">
         
         {/* Top Section: Title & Desc */}
         <div className="flex flex-col items-center w-full max-w-2xl">
           <div className="mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 text-primary rounded-2xl text-[9px] font-black tracking-[0.2em] uppercase shadow-sm animate-fade-in-up">
                Diagnosis Literasi Pintar
              </div>
           </div>

           <div className="mb-2">
              <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tight leading-[1.1] mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Uji Kemampuan <span className="text-gradient-premium">Membacamu</span>
              </h1>
              <p className="text-sm md:text-base text-ink-light font-bold leading-relaxed opacity-80 animate-fade-in-up max-w-xl mx-auto" style={{ animationDelay: '0.2s' }}>
                 Babe Jaka akan memandumu melewati serangkaian tes adaptif untuk mengukur kelancaran dan pemahaman bacaanmu secara akurat.
              </p>
           </div>
         </div>

         {/* Middle Section: Level Indicators */}
         <div className="w-full max-w-2xl my-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="grid grid-cols-5 gap-2 md:gap-4">
               {STAGES.map((stage) => (
                  <div key={stage.id} className="flex flex-col items-center gap-2 p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white/80 shadow-sm transition-transform hover:-translate-y-1">
                     <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg" style={{ backgroundColor: stage.color }}>
                       {stage.id}
                     </div>
                     <span className="text-[9px] md:text-[10px] font-black text-ink opacity-60 uppercase tracking-widest text-center leading-tight">
                        {stage.id === 'A' ? 'Dini' : stage.id === 'B' ? 'Awal' : stage.id === 'C' ? 'Semenjana' : stage.id === 'D' ? 'Madya' : 'Mahir'}
                     </span>
                  </div>
               ))}
            </div>
         </div>

         {/* Bottom Section: Action */}
         <div className="w-full max-w-md flex flex-col items-center mt-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link 
              href="/explore/diagnostic/integrated"
              className="btn-heritage flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-base md:text-lg mb-6 shadow-xl"
            >
              MULAI DIAGNOSIS SEKARANG
              <span className="material-symbols-rounded text-xl font-bold">rocket_launch</span>
            </Link>

            <div className="flex items-center justify-center gap-6 mb-2">
               <div className="flex flex-col items-center gap-1 opacity-50">
                  <span className="material-symbols-rounded text-secondary text-lg">bolt</span>
                  <span className="text-[8px] font-black text-ink-light uppercase tracking-widest">Adaptif</span>
               </div>
               <div className="flex flex-col items-center gap-1 opacity-50">
                  <span className="material-symbols-rounded text-secondary text-lg">verified</span>
                  <span className="text-[8px] font-black text-ink-light uppercase tracking-widest">Akurat</span>
               </div>
               <div className="flex flex-col items-center gap-1 opacity-50">
                  <span className="material-symbols-rounded text-secondary text-lg">timer</span>
                  <span className="text-[8px] font-black text-ink-light uppercase tracking-widest">Real-time</span>
               </div>
            </div>
         </div>

         {/* Footer */}
         <p className="mt-4 text-[8px] font-black text-ink-light tracking-[0.2em] uppercase opacity-30 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
           Powered by Google Gemini AI • Jakarta Global Kota
         </p>

      </main>
    </div>
  );
}

