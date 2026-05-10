"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useProfile } from "@/lib/profile-context";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import NamePromptModal from "@/components/NamePromptModal";
import BabeSpeechBubble from "@/components/BabeSpeechBubble";

export default function LandingPage() {
  const { profile, logout } = useProfile();
  const router = useRouter();
  const [showNameModal, setShowNameModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const isDefaultUser = profile.name === "Petualang Baca";
  
  const handleMulai = () => {
    if (isDefaultUser) {
      setPendingRedirect("/explore/library");
      setShowNameModal(true);
      return;
    }
    router.push("/explore/library");
  };

  const handleDiagnosis = () => {
    if (isDefaultUser) {
      setPendingRedirect("/explore/diagnostic");
      setShowNameModal(true);
      return;
    }
    router.push("/explore/diagnostic");
  };

  const STAGES = [
    { id: 'A', title: 'Pembaca Dini', desc: 'Mengenal huruf & bunyi suku kata.', img: 'https://i.ibb.co.com/d4jXMJp2/babe-bingung.png', angle: 0, color: '#C62828' },
    { id: 'B', title: 'Pembaca Awal', desc: 'Mulai merangkai kata & kalimat pendek.', img: 'https://i.ibb.co.com/Zp0mYVKv/babe-jempol.png', angle: 72, color: '#1A237E' },
    { id: 'C', title: 'Pembaca Semenjana', desc: 'Lancar membaca & paham isi cerita.', img: 'https://i.ibb.co.com/h18PBQMP/babe-nunjuk.png', angle: 144, color: '#2E7D32' },
    { id: 'D', title: 'Pembaca Madya', desc: 'Mampu analisis & ambil pesan cerita.', img: 'https://i.ibb.co.com/hx2BYfbm/babe-keprok.png', angle: 216, color: '#FBC02D' },
    { id: 'E', title: 'Pembaca Mahir', desc: 'Berpikir kritis & evaluasi teks sulit.', img: 'https://i.ibb.co.com/Q7RP9xm0/babe-baca.png', angle: 288, color: '#3949AB' },
  ];

  const [activeStage, setActiveStage] = useState<number | null>(null);

  return (
    <main className="min-h-screen relative overflow-x-hidden pt-[120px] md:pt-[150px]">
      
      {/* Background Decor - Modern Digital Jakarta */}
      <div className="absolute top-0 left-0 w-full h-[800px] pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[70%] bg-secondary/10 rounded-full blur-[150px]"></div>
      </div>
      
      {/* HERO SECTION */}
      <section className="relative z-10 pt-8 pb-20 px-6 md:px-8 max-w-7xl mx-auto flex flex-col items-start text-left lg:flex-row lg:justify-between min-h-[80vh] gap-12">
        {/* Left: Text Content */}
        <div className="max-w-2xl lg:w-1/2">
        
          <h1 className="mb-6 text-ink" style={{ animation: 'bounce-in 0.8s forwards' }}>
            <BrandLogo size="lg" stacked className="ml-[-8px]" />
          </h1>

          <p className="md:mt-[-1rem] mb-6 text-xl md:text-3xl text-black tracking-wide" style={{ fontFamily: "'Changa One', sans-serif", animation: 'bounce-in 0.9s forwards' }}>
            Ayo <span className="text-primary">Baca Bersama</span> demi <span className="text-secondary">Jaga Jakarta</span>
          </p>
        
          <p className="text-lg md:text-xl text-ink-light font-bold leading-relaxed mb-8 max-w-xl" style={{ animation: 'bounce-in 1s forwards' }}>
            Siap keliling Jakarta lewat cerita? Bersama Babe Jaka, kamu bisa asah kemampuan membacamu jadi makin jago sambil mengenal kerennya budaya Betawi. Yuk, mulai baca sekarang!
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4" style={{ animation: 'bounce-in 1.2s forwards' }}>
            <button onClick={handleMulai} className="btn-heritage flex items-center gap-3">
              PERPUSTAKAAN <span className="material-symbols-rounded font-bold text-2xl">menu_book</span>
            </button>
            <button onClick={handleDiagnosis} className="btn-heritage-outline">
              DIAGNOSIS <span className="material-symbols-rounded font-bold text-2xl">troubleshoot</span>
            </button>
          </div>
        </div>

        {/* Right: Babe Jaka Persona */}
        <div className="lg:w-1/2 flex items-center justify-center relative mt-20 md:mt-28">
          <div className="relative w-full max-w-[510px] aspect-square animate-float-subtle">
            {/* Interactive Speech Bubble */}
            <BabeSpeechBubble />
            
            {/* Holographic Ring Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            
            {/* Main Visual: Babe Jaka Hero Image */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <Image 
                  src="https://i.ibb.co.com/vxhZR8wB/MASKOT-BABE.png" 
                  alt="Babe Jaka Hero" 
                  fill 
                  className="object-contain"
                  priority
                />
            </div>

            {/* Jakarta Global City Badge - Breathing & Enlarged */}
            <div className="absolute top-[10%] -right-28 w-80 h-80 z-20 animate-float-breathing">
                <Image 
                  src="https://i.ibb.co.com/jn3fgc0/jakarta-global-city.png" 
                  alt="Jakarta Global City" 
                  fill
                  className="object-contain"
                />
            </div>

          </div>
        </div>
      </section>

      {/* JENJANG PEMBACA SECTION */}
      <section className="bg-secondary/5 py-32 px-8 relative overflow-hidden bg-batik-subtle">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-ink tracking-tighter mb-4">
              Jenjang <span className="text-primary italic">Pembaca</span>
            </h2>
            <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-6"></div>
            <p className="text-ink-light font-bold max-w-xl mx-auto text-lg leading-relaxed">
               Setiap Jagoan Kata punya tahap perkembangannya sendiri. <br/> Di jenjang mana kamu hari ini?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {STAGES.map((level, i) => (
              <div 
                key={level.id} 
                className="group relative"
                onClick={() => setActiveStage(activeStage === i ? null : i)}
              >
                <div className="card-heritage p-8 h-full flex flex-col items-center text-center group-hover:border-primary/40">
                  <img 
                    src={level.img} 
                    alt={level.title} 
                    className="w-32 h-32 md:w-44 md:h-44 object-contain mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 drop-shadow-xl" 
                  />
                  <span className="px-3 py-1 rounded-md text-[10px] font-black text-white mb-3 tracking-widest uppercase" style={{ backgroundColor: level.color }}>
                    Level {level.id}
                  </span>
                  <h3 className="text-xl font-black text-ink leading-tight mb-2 group-hover:text-primary transition-colors">{level.title}</h3>
                  <p className="text-sm text-ink-light font-bold opacity-70">{level.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BABE JAKA MISSION */}
      <section className="py-32 px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl hologram-border">
               <Image 
                src="https://i.ibb.co.com/Y4FKRjTv/bg.png" 
                alt="Jakarta Future" 
                fill 
                className="object-cover"
               />
               <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent flex items-end p-10">
                  <p className="text-white text-2xl font-black italic tracking-wide">"Berpikir global, bertindak lokal"</p>
               </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-black text-ink mb-8 leading-tight">Misi Global <span className="text-secondary">Babe Jaka</span></h2>
            <div className="space-y-6">
               {[
                 { icon: 'collections', title: 'Budaya Betawi Kontemporer', desc: 'Mengenalkan identitas lokal dalam kemasan modern dan interaktif.' },
                 { icon: 'dashboard', title: 'Konektivitas Global', desc: 'Mempersiapkan anak-anak Jakarta menjadi warga dunia yang cakap berteknologi.' },
                 { icon: 'rocket_launch', title: 'Diagnosis Berbasis AI', desc: 'Personalisasi metode belajar membaca dengan kecanggihan Google Gemini.' }
               ].map((item, idx) => (
                 <div key={idx} className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-primary border border-gray-100 group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-rounded">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-ink mb-1">{item.title}</h4>
                      <p className="text-ink-light font-bold leading-relaxed">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-20 px-8 bg-white relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <BrandLogo size="md" className="opacity-80 hover:opacity-100 transition-opacity" />
          
          <p className="text-xs font-black text-ink-light tracking-[0.2em] opacity-40">© 2026 BABE JAKA - JAKARTA KOTA GLOBAL</p>
          
        </div>
      </footer>

      {showNameModal && (
        <NamePromptModal 
          onClose={() => {
            setShowNameModal(false);
            setPendingRedirect(null);
          }} 
          onSuccess={() => {
            if (pendingRedirect) {
              router.push(pendingRedirect);
            }
          }}
        />
      )}

      {/* TENTANG PENGEMBANG BUTTON (BOTTOM RIGHT) */}
      <button 
        onClick={() => setShowDevModal(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[110] bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 p-2 md:px-6 md:py-4 rounded-2xl font-black text-xs text-primary tracking-widest hover:scale-105 hover:bg-white hover:shadow-2xl transition-all flex items-center gap-3 group"
      >
        <span className="relative hidden md:block">
          TENTANG PENGEMBANG
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
        </span>
        <div className="w-12 h-12 md:w-8 md:h-8 rounded-xl md:rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
          <span className="material-symbols-rounded text-2xl md:text-lg">person</span>
        </div>
      </button>

      {/* DEV MODAL */}
      {showDevModal && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl transition-all animate-in fade-in duration-300"
          onClick={() => setShowDevModal(false)}
        >
          <div 
            className="relative max-w-2xl w-full animate-in zoom-in duration-300 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-[32px] shadow-lg border border-white/10">
              <img 
                src="https://i.ibb.co.com/KcvnDh2X/Teguh-Firmansyah-adalah-pendidik-yang-berdedikasi-dengan-keahlian-dalam-mengelola-kelas-merancang-k.png" 
                alt="Tentang Pengembang"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
