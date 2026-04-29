"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { useProfile } from "@/lib/profile-context";

type Step = "journey" | "age" | "reading" | "intermission" | "result";

const LEVELS = [
  { 
    id: "A", 
    title: "Pembaca Dini", 
    subtitle: "Level A",
    text: "Ini Kika. Ini Kura. Kika dan Kura bermain di depan rumah. Kika sayang Kura.", 
    time: 30, 
    image: "/images/stories/fluency_A.png" 
  },
  { 
    id: "B", 
    title: "Pembaca Awal", 
    subtitle: "Level B",
    text: "Ibu pergi ke pasar tradisional. Ibu membeli sayur dan buah segar. Ani membantu Ibu membawa tas belanja yang berat.", 
    time: 45, 
    image: "/images/stories/fluency_B.png" 
  },
  { 
    id: "C", 
    title: "Pembaca Semenjana", 
    subtitle: "Level C",
    text: "Kosi si kepik merasa cemas karena tidak bisa melihat dengan jelas. Dia takut akan tersesat di tengah hutan. Untunglah teman-temannya mengajak Kosi terbang bersama agar tetap aman.", 
    time: 60, 
    image: "/images/stories/fluency_C.png" 
  },
  { 
    id: "D", 
    title: "Pembaca Madya", 
    subtitle: "Level D",
    text: "Ketika matahari mulai terbenam di ufuk barat, para nelayan segera merapatkan perahu mereka ke dermaga untuk menjual hasil tangkapan hari ini, sementara penduduk desa mulai menyalakan lampu di depan rumah masing-masing.", 
    time: 90, 
    image: "/images/stories/fluency_D.png" 
  },
  { 
    id: "E", 
    title: "Pembaca Mahir", 
    subtitle: "Level E",
    text: "Ekosistem hutan bakau memfasilitasi perlindungan kawasan pesisir dari ancaman erosi melalui struktur perakaran yang kompleks, sekaligus menjadi habitat esensial bagi berbagai biota laut yang saling bersimbiosis dalam menjaga keseimbangan alam.", 
    time: 120, 
    image: "/images/stories/fluency_E.png" 
  },
];

const TypewriterText = ({ text, delay = 35 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);
  return <span>{displayedText}</span>;
};

export default function FluencyDiagnosticPage() {
  const { profile, logout, getAvatarUrl } = useProfile();
  const router = useRouter();
  const [step, setStep] = useState<Step>("journey");
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testResults, setTestResults] = useState<{accuracy: number, wpm: number, levelId: string}[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [matchedIndices, setMatchedIndices] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [readDuration, setReadDuration] = useState(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "id-ID";
      rec.onresult = (event: any) => {
         let fullTranscript = "";
         for (let i = 0; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript + " ";
         }
         
         const currentText = LEVELS[currentTestIndex].text.toLowerCase().split(" ");
         const words = fullTranscript.toLowerCase().split(/\s+/).filter(Boolean);
         
         const nextMatched: number[] = [];
         let textCursor = 0;
         
         words.forEach(w => {
            const cleanW = w.replace(/[.,!?]/g, "").trim();
            if (!cleanW) return;
            
            // Mencari kecocokan dalam jarak 4 kata ke depan (mengizinkan anak melewati/skip kata yang sulit)
            for (let i = textCursor; i < Math.min(textCursor + 4, currentText.length); i++) {
               const targetClean = currentText[i].replace(/[.,!?]/g, "").trim().toLowerCase();
               if (targetClean === cleanW && !nextMatched.includes(i)) {
                  nextMatched.push(i);
                  textCursor = i + 1;
                  break;
               }
            }
         });
         
         setMatchedIndices(nextMatched.sort((a, b) => a - b));
      };
      recognitionRef.current = rec;
    }
  }, [currentTestIndex]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isReading && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      stopReading();
    }
    return () => clearInterval(timer);
  }, [isReading, timeLeft]);



  const handleStartReadingStep = () => {
    setCurrentTestIndex(0);
    setTestResults([]);
    setMatchedIndices([]);
    setReadDuration(0);
    setStartTime(null);
    setIsReading(false);
    setTimeLeft(LEVELS[0].time);
    setStep("reading");
  };
  
  const startReading = () => {
    setIsReading(true);
    setMatchedIndices([]);
    setStartTime(Date.now());
    if (recognitionRef.current) recognitionRef.current.start();
  };

  const stopReading = () => {
    setIsReading(false);
    let finalDur = readDuration;
    if (startTime && finalDur === 0) {
      finalDur = Math.round((Date.now() - startTime) / 1000);
      setReadDuration(finalDur);
    }
    if (recognitionRef.current) recognitionRef.current.stop();

    const currentLevelData = LEVELS[currentTestIndex];
    const totalWords = currentLevelData.text.split(" ").length;
    const matchCount = matchedIndices.length;
    if (finalDur === 0) finalDur = 1;

    const acc = totalWords > 0 ? Math.round((matchCount / totalWords) * 100) : 0;
    const cwpm = Math.round((matchCount / finalDur) * 60);

    setTestResults(prev => [...prev, { accuracy: acc, wpm: cwpm, levelId: currentLevelData.id }]);
    
    // PROGRESSIVE LOGIC: Only move to next level if accuracy >= 80%
    if (acc >= 80 && currentTestIndex < LEVELS.length - 1) {
      setStep("intermission");
    } else {
      setStep("result");
    }
  };

  const handleNextText = () => {
    const nextIdx = currentTestIndex + 1;
    setCurrentTestIndex(nextIdx);
    setMatchedIndices([]);
    setReadDuration(0);
    setStartTime(null);
    setIsReading(false);
    setTimeLeft(LEVELS[nextIdx].time);
    setStep("reading");
  };

  const currentLevelData = LEVELS[currentTestIndex];

  const avgAccuracy = testResults.length > 0 ? Math.round(testResults.reduce((sum, r) => sum + r.accuracy, 0) / testResults.length) : 0;
  const avgWpm = testResults.length > 0 ? Math.round(testResults.reduce((sum, r) => sum + r.wpm, 0) / testResults.length) : 0;
  
  // Simulated ML Metrics based on rule
  const prosodyScore = Math.min(100, Math.max(0, avgAccuracy - 5)); // Intonasi dan Ekspresi
  const automaticityScore = Math.min(100, Math.max(0, Math.round((avgWpm / 150) * 100) + 15)); // Kelancaran Menggabungkan Kata

  return (
    <div className="min-h-screen bg-[#F0F8FF] flex flex-col items-center font-body relative overflow-x-hidden text-[#333333]">
      
      {/* Background Decor */}
      <div className="cloud-blob w-[600px] h-[400px] -top-20 -right-20 bg-white shadow-[0_0_80px_rgba(255,255,255,1)]"></div>
      <div className="cloud-blob w-[400px] h-[300px] bottom-10 left-10 bg-white shadow-[0_0_80px_rgba(255,255,255,1)]"></div>
      


      <main className="w-full max-w-6xl mt-36 px-4 md:px-8 pb-32 relative z-50">
         {step === "reading" && (
           <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto animate-bounce-in">
             {/* Left: Badge */}
             <div className="flex items-center gap-2 md:gap-3 bg-white px-3 md:px-4 py-2 rounded-2xl border-4 border-[#E2E8F0] shadow-sm">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm font-black text-sm text-white" style={{ backgroundColor: '#5AAFD1' }}>
                    {currentLevelData.id}
                 </div>
                 <div className="text-left">
                    <p className="text-[9px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] leading-none mb-0.5">TINGKAT KEMAMPUAN</p>
                    <h4 className="text-[11px] font-black text-[#333333] uppercase leading-none">{currentLevelData.title}</h4>
                 </div>
             </div>
             
             {/* Right: Actions & Timer Group */}
             <div className="flex items-center gap-4">
                {!isReading ? (
                   <button 
                     onClick={startReading} 
                     className="btn-bubbly rounded-full px-8 py-2 bg-[#5AAFD1] flex items-center gap-2 shadow-[0_4px_0_#4691B0] text-base"
                   >
                     Mulai Membaca <span className="material-symbols-rounded text-xl">mic</span>
                   </button>
                ) : (
                   <button 
                     onClick={stopReading} 
                     className="btn-bubbly rounded-full px-8 py-2 !bg-[#34D399] !shadow-[0_4px_0_#059669] flex items-center gap-2 text-base"
                   >
                     Selesai <span className="material-symbols-rounded text-xl">check_circle</span>
                   </button>
                )}

                <div className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-black text-xl border-4 shadow-sm transition-all ${timeLeft < 10 ? 'bg-[#FF4757] border-[#D63031] text-white animate-bounce' : 'bg-white border-[#E2E8F0] text-[#5AAFD1]'}`}>
                    <span className="material-symbols-rounded text-2xl">timer</span>
                    {timeLeft}s
                </div>
             </div>
           </div>
         )}
         
         {/* Journey Overview Step */}
         {step === "journey" && (
            <div className="animate-bounce-in grid grid-cols-1 lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 text-center md:text-left flex flex-col items-center md:items-start">
                  <p className="text-[10px] sm:text-xs font-black bg-white border-2 border-[#E2E8F0] px-4 py-2 rounded-full text-[#5AAFD1] uppercase tracking-[0.2em] mb-4 shadow-sm inline-block">DIAGNOSIS KELANCARAN</p>
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-tight mb-6">
                     SEBERAPA LANCAR <br/>
                     <span className="text-gradient-bubbly drop-shadow-sm">BACAANMU?</span>
                  </h1>
                   <p className="text-lg md:text-xl text-[#666666] font-bold leading-relaxed max-w-2xl mb-12">
                      Halo {profile.name}! Baca teks dengan suara keras dan sistem pintar kami akan mendengarkan setiap katamu. Buktikan kalau kamu jago membaca!
                   </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 w-full max-w-2xl">
                     {[
                        { step: "01", title: "Level A", icon: "start", desc: "Mulai level dasar" },
                        { step: "02", title: "Naik Level", icon: "trending_up", desc: "Tingkatkan tantangan" },
                        { step: "03", title: "Hasil", icon: "military_tech", desc: "Lihat level akhirmu" },
                     ].map((s) => (
                        <div key={s.title} className="card-bubbly p-6 flex flex-col items-center text-center gap-3">
                           <div className="w-14 h-14 bg-[#5AAFD1] text-white rounded-full flex items-center justify-center border-4 border-[#F0F8FF] shadow-sm">
                              <span className="material-symbols-rounded text-3xl">{s.icon}</span>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest leading-none mb-2">LANGKAH {s.step}</p>
                              <h4 className="text-base font-black text-[#333333] uppercase leading-none">{s.title}</h4>
                           </div>
                        </div>
                     ))}
                  </div>

                  <button onClick={handleStartReadingStep} className="btn-bubbly rounded-full px-12 py-5 text-xl flex items-center gap-2">
                     MULAI DIAGNOSIS <span className="material-symbols-rounded text-2xl font-bold">arrow_forward</span>
                  </button>
               </div>

               <div className="lg:col-span-4 hidden lg:flex items-center justify-center relative">
                  <div className="relative w-full aspect-square flex items-center justify-center">
                     <div className="w-48 h-48 bg-[#FFB347]/20 rounded-full flex items-center justify-center border-4 border-[#FFB347]/30 animate-float-cloud">
                       <span className="text-[100px] select-none">🎤</span>
                     </div>
                  </div>
               </div>
            </div>
         )}



         {/* Reading Step */}
         {step === "reading" && (
            <div className="animate-bounce-in max-w-5xl mx-auto">




               <div className="card-bubbly bg-[#FFFAF0] border-4 border-[#E2E8F0] p-6 md:p-10 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch flex-1">
                     {/* Illustration on the left */}
                     <div className="md:col-span-5 relative w-full h-[250px] md:h-auto md:min-h-full rounded-3xl overflow-hidden border-4 border-white shadow-md bg-[#F8FAFC]">
                        <Image src={currentLevelData.image} alt={currentLevelData.title} fill className="object-cover transition-transform duration-700 hover:scale-105" unoptimized />
                     </div>
                     
                     {/* Text on the right */}
                     <div className="md:col-span-7 flex flex-col justify-center py-4">
                        <article className={`text-xl md:text-[28px] font-semibold leading-[1.8] flex flex-wrap gap-x-3 md:gap-x-4 gap-y-4 transition-all duration-700 tracking-wide ${isReading ? 'text-[#333333]' : 'text-[#A0AEC0] grayscale'}`}>
                           {currentLevelData.text.split(" ").map((word, i) => {
                              const matched = matchedIndices.includes(i);
                              return (
                                 <span key={i} className={`relative transition-all duration-300 ${matched ? 'text-[#34D399] drop-shadow-sm scale-110' : ''}`}>
                                    {word}
                                    {matched && <span className="absolute -bottom-1 left-0 w-full h-[4px] bg-[#34D399] rounded-full"></span>}
                                 </span>
                              );
                           })}
                        </article>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Intermission Step */}
         {step === "intermission" && (
            <div className="animate-bounce-in max-w-2xl mx-auto mt-20 text-center relative z-10">
               <div className="card-bubbly bg-[#FFF3E0] border-4 border-[#FFB347] p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-20 -mr-10 -mt-10"></div>
                  <h2 className="text-4xl font-black text-[#E69A2E] mb-4">LUAR BIASA! 🎉</h2>
                  <p className="text-xl font-bold text-[#666666] mb-8">Kamu berhasil melewati level {currentLevelData.id}! <br/> Siap untuk tantangan yang lebih tinggi?</p>
                  <button onClick={handleNextText} className="btn-bubbly rounded-full px-12 py-5 text-xl flex items-center justify-center gap-4 bg-[#FFB347] mx-auto group z-10 relative">
                     LANJUT KE LEVEL {LEVELS[currentTestIndex + 1].id} <span className="material-symbols-rounded group-hover:translate-x-2 transition-transform">trending_up</span>
                  </button>
               </div>
            </div>
         )}

         {/* Result Step */}
         {step === "result" && (
            <div className="animate-bounce-in max-w-5xl mx-auto">
               <div className="card-bubbly bg-white border-4 border-[#E69A2E] shadow-[0_10px_0_#E69A2E] p-10 md:p-20 relative overflow-hidden">
                  <div className="cloud-blob w-[500px] h-[500px] -top-20 -right-20 bg-[#FFB347] opacity-10"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
                     <div className="w-48 h-48 relative shrink-0 bg-[#FFF3E0] rounded-full border-8 border-[#FFB347] shadow-xl flex items-center justify-center">
                       <span className="text-[80px] select-none animate-bounce">🎤</span>
                     </div>
                     
                     <div className="text-center md:text-left flex-1 text-[#333333]">
                        <div className="inline-block px-5 py-2 bg-[#FFF3E0] text-[#E69A2E] rounded-full text-xs font-black uppercase tracking-widest mb-6 border-4 border-[#FFB347] shadow-sm">
                           DIAGNOSIS KELANCARAN SELESAI
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-tight mb-4 text-[#FFB347] drop-shadow-sm">
                          TINGKAT <br/>
                          {LEVELS[Math.max(0, testResults[testResults.length - 1]?.accuracy >= 80 ? currentTestIndex : currentTestIndex - 1)].id}
                        </h2>
                        <p className="text-xl font-bold text-[#666666] leading-relaxed max-w-lg">
                          Hebat {profile.name}! Berdasarkan diagnosis, kemampuan membacamu berada pada level <strong>{LEVELS[Math.max(0, testResults[testResults.length - 1]?.accuracy >= 80 ? currentTestIndex : currentTestIndex - 1)].title}</strong>. 
                          {testResults[testResults.length - 1]?.accuracy < 80 ? " Terus semangat berlatih untuk mencapai level berikutnya!" : " Kamu memiliki kemampuan membaca yang sangat baik!"}
                        </p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-16 relative z-10 max-w-xl mx-auto">
                     {[
                        { label: 'Rata-Rata Akurasi', val: `${avgAccuracy}%`, icon: 'verified', col: 'text-[#34D399]', bg: 'bg-[#D1FAE5]' },
                        { label: 'Kata / Menit (WPM)', val: `${avgWpm}`, icon: 'speed', col: 'text-[#87CEEB]', bg: 'bg-[#F0F8FF]' },
                     ].map((res, i) => (
                        <div key={res.label} className="card-bubbly bg-white p-6 flex flex-col items-center justify-center border-4 border-[#E2E8F0] shadow-sm animate-bounce-in" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                           <div className={`w-14 h-14 ${res.bg} rounded-full flex items-center justify-center mb-3`}>
                              <span className={`material-symbols-rounded ${res.col} text-3xl`}>{res.icon}</span>
                           </div>
                           <div className={`text-4xl font-black ${res.col} leading-none mb-2 tracking-tighter`}>{res.val}</div>
                           <div className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest text-center">{res.label}</div>
                        </div>
                     ))}
                  </div>

                  <div className="mt-16 flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                     <Link href="/explore/library" className="btn-bubbly rounded-full px-12 py-5 text-xl flex justify-center bg-[#FFB347] text-white border-4 border-[#E69A2E] shadow-[0_6px_0_#E69A2E] hover:scale-105 transition-transform hover:-translate-y-0">
                        KEMBALI KE BERANDA 🏠
                     </Link>
                     <button onClick={() => { setStep("journey"); setMatchedIndices([]); setReadDuration(0); }} className="px-12 py-5 bg-white text-[#A0AEC0] rounded-full font-black uppercase tracking-widest text-lg hover:border-[#E2E8F0] hover:text-[#333333] transition-all border-4 border-[#E2E8F0]">
                        ULANGI LAGI
                     </button>
                  </div>
               </div>
            </div>
         )}

      </main>

    </div>
  );
}
