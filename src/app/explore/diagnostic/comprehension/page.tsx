"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useProfile } from "@/lib/profile-context";
import { useRouter } from "next/navigation";
import { gradeEssayAction } from "@/actions/grade-essay";

type QuestionType = "mc" | "cmc" | "essay";

interface QuestionDef {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswers?: number[];
  referenceAnswer?: string;
}

type Step = "journey" | "reading" | "intermission" | "result";

const STORIES: {
  id: string; title: string; theme: string; icon: string; color: string; colorDark: string; colorLight: string; difficulty: string; image: string; text: string; questions: QuestionDef[];
}[] = [
  {
    id: "B-1", title: "Kika dan Kura", theme: "Level B-1 — Pembaca Awal (6-8 tahun)", icon: "home", color: "#34D399", colorDark: "#059669", colorLight: "#E0F2FE", difficulty: "Mudah", image: "/images/stories/comp_A.png",
    text: "Ini Kika. Ini Kura. Kika dan Kura bermain di depan rumah. Kika sayang Kura.",
    questions: [
      { type: "mc", question: "Siapa nama teman Kika?", options: ["Kura", "Kuki", "Kaka", "Kiri"], correctAnswers: [0] },
      { type: "cmc", question: "Tandai SEMUA tokoh yang ada di cerita ini!", options: ["Kika", "Kuki", "Kura", "Ibu"], correctAnswers: [0, 2] },
      { type: "essay", question: "Bagaimana perasaan Kika kepada Kura? Mengapa kita harus menyayangi teman?", referenceAnswer: "Kika sangat sayang pada Kura. Kita harus menyayangi teman agar hidup rukun dan bermain bersama jadi menyenangkan." }
    ]
  },
  {
    id: "B-2", title: "Membantu Ibu", theme: "Level B-2 — Pembaca Awal (7-9 tahun)", icon: "shopping_basket", color: "#87CEEB", colorDark: "#5AAFD1", colorLight: "#E0F2FE", difficulty: "Mudah", image: "/images/stories/fluency_B.png",
    text: "Pagi ini Ibu mengajak Ani ke pasar tradisional. Di sana banyak orang menjual sayur, buah, dan ikan segar. Ibu membeli bayam dan jeruk. \"Ani, tolong pegang tas belanjanya ya,\" kata Ibu dengan lembut.",
    questions: [
      { type: "mc", question: "Di mana latar tempat cerita ini?", options: ["Supermarket", "Taman kota", "Pasar tradisional", "Kebun"], correctAnswers: [2] },
      { type: "cmc", question: "Pilih SEMUA barang atau makanan yang dibeli Ibu di pasar menurut teks!", options: ["Apel", "Jeruk", "Bayam", "Ikan"], correctAnswers: [1, 2] },
      { type: "essay", question: "Apa peran Ani untuk membantu Ibu? Menurutmu, apakah sikap Ani baik? Jelaskan alasannya!", referenceAnswer: "Ani memegang tas belanjaan ibu. Sikap Ani sangat baik karena anak yang hebat selalu suka membantu meringankan beban orang tua." }
    ]
  },
  {
    id: "B-3", title: "Memancing di Desa", theme: "Level B-3 — Pembaca Awal (8-10 tahun)", icon: "sailing", color: "#60A5FA", colorDark: "#2563EB", colorLight: "#DBEAFE", difficulty: "Mudah", image: "/images/stories/comp_A.png",
    text: "Saat liburan sekolah tiba, Bima dan keluarganya pergi ke desa nenek. Udara di desa sangat sejuk dan segar karena banyak pepohonan. Bima sangat senang diajak memancing ikan di sungai kecil di belakang rumah nenek. Menurut ayah, memancing ikan bisa melatih kesabaran kita karena ikan tidak selalu langsung datang melahap umpan.",
    questions: [
      { type: "mc", question: "Ke mana Bima pergi saat liburan?", options: ["Ke desa nenek", "Ke pantai", "Ke gunung", "Ke kebun binatang"], correctAnswers: [0] },
      { type: "cmc", question: "Apa saja aktivitas atau kondisi yang Bima sukai di desa?", options: ["Melihat banyak gedung", "Udara sangat sejuk", "Bisa memancing di sungai", "Udara jalanan berdebu"], correctAnswers: [1, 2] },
      { type: "essay", question: "Menurut perkataan ayah Bima, apa manfaat yang didapat dari kegiatan memancing ikan?", referenceAnswer: "Memancing ikan melatih kesabaran kita karena kita harus sabar menunggu ikan datang menyantap umpan." }
    ]
  },
  {
    id: "C", title: "Kosi si Kepik", theme: "Level C — Semenjana (10-12 tahun)", icon: "landscape", color: "#FFB347", colorDark: "#E69A2E", colorLight: "#FFF3E0", difficulty: "Sedang", image: "/images/stories/comp_C.png",
    text: "Kosi si kepik merasa cemas karena tidak bisa melihat dengan jelas. Dia takut akan tersesat di tengah hutan. Untunglah teman-temannya mengajak Kosi terbang bersama agar tetap aman. Mereka mengingatkan Kosi agar jangan tertidur karena Kosi memang gampang mengantuk.",
    questions: [
      { type: "mc", question: "Mengapa Kosi merasa cemas?", options: ["Karena lapar", "Karena kelelahan", "Karena tidak bisa melihat jelas", "Karena cuaca dingin"], correctAnswers: [2] },
      { type: "cmc", question: "Apa yang ditakutkan oleh Kosi dan apa satu sifat uniknya?", options: ["Takut gelap", "Takut tersesat", "Gampang mengantuk", "Sayap patah"], correctAnswers: [1, 2] },
      { type: "essay", question: "Bagaimana cara teman-teman Kosi mencoba menolongnya? Jika kamu jadi temannya, apa yang akan kamu lakukan?", referenceAnswer: "Teman-temannya menolong dengan mengajak Kosi terbang bersama dan selalu mengingatkan agar dia tidak tertidur." }
    ]
  },
  {
    id: "D", title: "Energi Bersih", theme: "Level D — Madya (13-15 tahun)", icon: "bolt", color: "#A78BFA", colorDark: "#7C3AED", colorLight: "#EDE9FE", difficulty: "Sedang", image: "/images/stories/fluency_D.png",
    text: "Ketika teknologi berkembang pesat, kebutuhan akan energi bersih semakin mendesak untuk mengurangi dampak pemanasan global. Panel surya dan kincir angin mulai diimplementasikan di berbagai daerah terpencil untuk menyediakan listrik bagi penduduk yang selama ini belum terjangkau oleh jaringan pusat kota.",
    questions: [
      { type: "mc", question: "Mengapa energi bersih sangat dibutuhkan saat ini?", options: ["Untuk gaya hidup", "Mencegah pemanasan global", "Karena lebih murah", "Pamer teknologi"], correctAnswers: [1] },
      { type: "cmc", question: "Apa Saja sumber energi bersih yang disebutkan pada bacaan di atas?", options: ["Baterai", "Panel Surya", "Kincir Angin", "Bendungan Air"], correctAnswers: [1, 2] },
      { type: "essay", question: "Di manakah energi baru ini mulai dibangun dan mengapa penduduk di tempat tersebut sangat memerlukannya?", referenceAnswer: "Di daerah-daerah terpencil, karena penduduk di sana tidak atau belum terjangkau jaringan kabel listrik dari pusat kota." }
    ]
  },
  {
    id: "E", title: "Hutan Bakau", theme: "Level E — Mahir (>16 tahun)", icon: "science", color: "#F472B6", colorDark: "#DB2777", colorLight: "#FCE7F3", difficulty: "Sulit", image: "/images/stories/fluency_E.png",
    text: "Ekosistem hutan bakau memfasilitasi perlindungan kawasan pesisir dari ancaman erosi melalui struktur perakaran yang sangat kompleks. Habitat ini menjadi esensial bagi berbagai biota laut yang saling bersimbiosis dalam menjaga keseimbangan kehidupan, serta mampu menyaring banyak zat polutan berbahaya dari aliran air sungai sebelum lolos masuk ke laut lepas.",
    questions: [
      { type: "mc", question: "Bagaimana hutan bakau mencegah erosi pesisir?", options: ["Garam laut", "Struktur perakaran yang kompleks", "Menghalau nelayan", "Daun penetralisir"], correctAnswers: [1] },
      { type: "cmc", question: "Pilih 3 kegunaan habitat hutan bakau yang dibahas di teks!", options: ["Melindungi dari erosi pesisir", "Menyaring polutan", "Menghasilkan air tawar", "Habitat biota laut", "Menyediakan buah"], correctAnswers: [0, 1, 3] },
      { type: "essay", question: "Dalam teks terdapat istilah 'bersimbiosis'. Coba jelaskan dengan bahasamu sendiri apa arti bersimbiosis dan apa efeknya untuk laut lepas!", referenceAnswer: "Bersimbiosis artinya hubungan untuk hidup saling memanfaatkan yang menguntungkan. Efeknya alam menjadi seimbang, karena menjadi rumah untuk ekosistem biota laut." }
    ]
  }
];

export default function ComprehensionDiagnosticPage() {
  const { profile, logout, getAvatarUrl } = useProfile();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const [step, setStep] = useState<Step>("journey");
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyResults, setStoryResults] = useState<{score: number}[]>([]);

  // Q&A States
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [essayResults, setEssayResults] = useState<Record<number, {score: number, feedback: string}>>({});
  const [isGrading, setIsGrading] = useState(false);

  const story = STORIES[currentStoryIndex];

  // Initialize answers exactly to fit question types
  const initializeAnswers = (idx = currentStoryIndex) => {
     return STORIES[idx].questions.map(q => q.type === 'cmc' ? [] : q.type === 'essay' ? "" : null);
  };

  const handleStartReading = () => {
    setCurrentStoryIndex(0);
    setStoryResults([]);
    setAnswers(initializeAnswers(0));
    setEssayResults({});
    setCurrentQuestion(0);
    setShowQuestions(false);
    setStep("reading");
  };

  const handleNextStory = () => {
    const nextIdx = currentStoryIndex + 1;
    setCurrentStoryIndex(nextIdx);
    setAnswers(initializeAnswers(nextIdx));
    setEssayResults({});
    setCurrentQuestion(0);
    setShowQuestions(false);
    setStep("reading");
  };

  // Generic handler to update answers
  const updateAnswer = (val: any) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentQuestion] = val;
      return next;
    });
  };

  const handleToggleCMC = (optIndex: number) => {
    const current = answers[currentQuestion] as number[];
    if (current.includes(optIndex)) updateAnswer(current.filter(i => i !== optIndex));
    else updateAnswer([...current, optIndex].sort());
  };

  const gradeEssayNow = async () => {
    setIsGrading(true);
    const q = story.questions[currentQuestion];
    const ans = answers[currentQuestion] as string;
    const res = await gradeEssayAction(story.text, q.question, ans, q.referenceAnswer || "");
    
    setEssayResults(prev => ({ ...prev, [currentQuestion]: res }));
    setIsGrading(false);
  };

  const handleNextQuestion = () => setCurrentQuestion(prev => Math.min(prev + 1, story.questions.length - 1));
  const handlePrevQuestion = () => setCurrentQuestion(prev => Math.max(prev - 1, 0));

  const calculateTotalScore = () => {
    let totalScore = 0;
    story.questions.forEach((q, i) => {
      const ans = answers[i];
      if (q.type === 'mc') {
         if (ans === q.correctAnswers![0]) totalScore += 100;
      } else if (q.type === 'cmc') {
         const corrects = q.correctAnswers!;
         const arr = ans as number[];
         let matches = 0, misses = 0;
         arr.forEach(a => corrects.includes(a) ? matches++ : misses++);
         const scorePerc = Math.max(0, (matches / corrects.length) * 100 - (misses * 50));
         totalScore += scorePerc;
      } else if (q.type === 'essay') {
         totalScore += essayResults[i]?.score || 0;
      }
    });
    return Math.round(totalScore / story.questions.length);
  };

  const handleFinishStory = () => {
     const fnScore = calculateTotalScore();
     setStoryResults(prev => [...prev, { score: fnScore }]);
     if (fnScore >= 75 && currentStoryIndex < STORIES.length - 1) {
         setStep("intermission");
     } else {
         setStep("result");
     }
  };

  // Helper checks for Next Button
  const isQuestionAnswered = () => {
     const q = story.questions[currentQuestion];
     const ans = answers[currentQuestion];
     if (q.type === 'mc') return ans !== null;
     if (q.type === 'cmc') return (ans as number[]).length > 0;
     if (q.type === 'essay') return essayResults[currentQuestion] !== undefined;
     return false;
  };
  const isAllAnswered = answers.every((a, i) => {
     const typ = story.questions[i].type;
     if (typ === 'essay') return essayResults[i] !== undefined;
     if (typ === 'cmc') return a.length > 0;
     return a !== null;
  });

  const totalFinalScore = storyResults.length > 0 ? Math.round(storyResults.reduce((s, r) => s + r.score, 0) / storyResults.length) : 0;
  const currentQ = story.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-[#F0F8FF] flex flex-col items-center font-body relative overflow-x-hidden text-[#333333]">
      {/* Background Decor */}
      <div className="cloud-blob w-[600px] h-[400px] -top-20 -left-20 bg-white shadow-[0_0_80px_rgba(255,255,255,1)]"></div>
      <div className="cloud-blob w-[400px] h-[300px] bottom-10 right-10 bg-white shadow-[0_0_80px_rgba(255,255,255,1)]"></div>

      <main className="w-full max-w-6xl mt-32 px-4 md:px-8 pb-32 relative z-50">
        {/* Diagnostic Meta Info (Restored from old Nav) */}
        {step !== "journey" && (
          <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto animate-bounce-in">
             <div className="flex items-center gap-3 bg-white px-6 py-2.5 rounded-2xl border-4 border-[#E2E8F0] shadow-sm">
                <span className="material-symbols-rounded text-2xl" style={{ color: story.color }}>{story.icon}</span>
                <div className="text-left">
                   <p className="text-[9px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] leading-none mb-0.5">Materi Uji Pemahaman</p>
                   <h4 className="text-[12px] font-black uppercase leading-none" style={{ color: story.colorDark }}>{story.theme}</h4>
                </div>
             </div>

             {/* Right: Actions Group (Consistency with Fluency) */}
             {step === "reading" && !showQuestions && (
                <button 
                  onClick={() => {
                    setShowQuestions(true);
                    setTimeout(() => document.getElementById("quiz-section")?.scrollIntoView({ behavior: 'smooth' }), 300);
                  }} 
                  className="btn-bubbly rounded-full px-8 py-2 bg-[#5AAFD1] border-[#4691B0] text-white flex items-center gap-2 shadow-[0_4px_0_#4691B0] text-base"
                >
                  TAMPILKAN PERTANYAAN <span className="material-symbols-rounded text-xl">expand_more</span>
                </button>
             )}
          </div>
        )}

        {/* Journey Step */}
        {step === "journey" && (
            <div className="animate-bounce-in grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10">
               <div className="lg:col-span-8 text-center md:text-left flex flex-col items-center md:items-start">
                  <p className="text-[10px] sm:text-xs font-black bg-white border-2 border-[#E2E8F0] px-4 py-2 rounded-full text-[#5AAFD1] uppercase tracking-[0.2em] mb-4 shadow-sm inline-block">DIAGNOSIS PEMAHAMAN</p>
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-tight mb-6">
                     SEBERAPA DALAM <br/>
                     <span className="text-gradient-bubbly drop-shadow-sm">PEMAHAMANMU?</span>
                  </h1>
                  <p className="text-base md:text-lg text-[#666666] font-bold leading-relaxed max-w-2xl mb-12">
                     Halo {profile.name}! Bacalah teks yang diberikan secara teliti. Jika tulisan dirasa sulit, ingat bahwa kamu selalu bisa membaca kembali teks tersebut saat menjawab pertanyaan!
                  </p>
                  <button onClick={handleStartReading} className="btn-bubbly rounded-full px-12 py-5 text-xl flex items-center gap-2">
                     AYO MULAI! <span className="material-symbols-rounded text-2xl font-bold">menu_book</span>
                  </button>
               </div>
               <div className="lg:col-span-4 hidden lg:flex items-center justify-center relative">
                  <div className="w-48 h-48 bg-[#87CEEB]/20 rounded-full flex items-center justify-center border-4 border-[#87CEEB]/30 animate-float-cloud">
                    <span className="text-[100px] select-none">🧠</span>
                  </div>
               </div>
            </div>
        )}

        {/* Reading & Action Step (UNIFIED VIEW) */}
        {step === "reading" && (
          <div className="animate-bounce-in max-w-4xl mx-auto">
            {/* Header Text */}
            <div className="text-center mb-8">
                <span className="text-sm font-bold text-[#A0AEC0] uppercase tracking-widest">{step === "reading" ? "Silakan baca dalam hati!" : "Waktunya menjawab"}</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-4 text-[#333333]">{story.title}</h2>
              <p className="text-sm font-bold text-[#A0AEC0] uppercase tracking-widest">Baca materi ini terlebih dahulu</p>
            </div>

            {/* Reading Container */}
            <div className="card-bubbly border-4 border-[#E2E8F0] p-6 md:p-10 relative mb-10 overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
               {/* Decorative watermark */}
              <div className="absolute top-6 right-6 opacity-5">
                <span className="material-symbols-rounded text-8xl" style={{ color: story.colorDark }}>menu_book</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch h-full relative z-10 transition-all">
                <div className="md:col-span-5 relative w-full h-[250px] md:h-auto md:min-h-full rounded-3xl overflow-hidden border-4 border-[#E2E8F0] shadow-sm bg-[#F8FAFC]">
                  <Image src={story.image} alt={story.title} fill className="object-cover transition-transform duration-700 hover:scale-105" unoptimized />
                </div>
                <div className="md:col-span-7 py-2 z-10 overflow-y-auto pr-4 custom-scroll max-h-[350px]">
                  <article className="text-base md:text-[20px] font-medium leading-[1.8] text-[#333333] tracking-wide" style={{ textIndent: '2em' }}>
                    {story.text}
                  </article>
                </div>
              </div>
            </div>

            {showQuestions && (
               <div id="quiz-section" className="mt-8 bg-white border-4 border-[#E2E8F0] p-6 md:p-10 rounded-[40px] shadow-sm relative animate-fade-in-up">
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between mb-8 px-2 border-b-2 border-[#E2E8F0] pb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-lg shadow-inner" style={{ backgroundColor: story.color }}>
                        {currentQuestion + 1}
                      </div>
                      <span className="text-sm font-black text-[#666666] uppercase tracking-widest">
                        PERTANYAAN {currentQuestion + 1} / {story.questions.length}
                      </span>
                    </div>
                  </div>

                  {/* Question Display */}
                  <div className="mb-10">
                     {currentQ.type === 'cmc' && (
                        <div className="mb-3 inline-block bg-[#FCE7F3] text-[#DB2777] text-xs font-black uppercase tracking-widest px-3 py-1 rounded-md border-2 border-[#DB2777]">
                           Pilihan Ganda Kompleks (Lebih dari 1 Jawaban)
                        </div>
                     )}
                     {currentQ.type === 'essay' && (
                        <div className="mb-3 inline-block bg-[#E0F2FE] text-[#0284C7] text-xs font-black uppercase tracking-widest px-3 py-1 rounded-md border-2 border-[#0284C7]">
                           Uraian (Akan Dinilai Oleh AI)
                        </div>
                     )}
                     <h4 className="text-2xl sm:text-3xl font-black text-[#333333] tracking-wide leading-tight mt-2">
                        {currentQ.question}
                     </h4>
                  </div>

                  {/* Single Choice UI */}
                  {currentQ.type === 'mc' && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentQ.options!.map((opt: string, idx: number) => {
                           const isSel = answers[currentQuestion] === idx;
                           const col = story.color;
                           return (
                              <button key={idx} onClick={() => updateAnswer(idx)} className={`p-4 rounded-xl text-base font-black transition-all flex items-center gap-4 border-4 ${isSel ? 'text-white' : 'bg-white border-[#E2E8F0] text-[#666666] hover:-translate-y-1'}`} style={isSel ? { backgroundColor: col, borderColor: col } : {}}>
                                 <div className={`w-8 h-8 rounded-full flex justify-center items-center shrink-0 border-4 border-white ${isSel ? 'bg-white/30' : 'bg-[#E2E8F0]'}`}>
                                    {isSel && <span className="material-symbols-rounded text-sm text-white">check</span>}
                                 </div>
                                 <span className="text-left">{opt}</span>
                              </button>
                           );
                        })}
                     </div>
                  )}

                  {/* Complex Choice UI */}
                  {currentQ.type === 'cmc' && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentQ.options!.map((opt: string, idx: number) => {
                           const isSel = (answers[currentQuestion] as number[]).includes(idx);
                           const col = story.color;
                           return (
                              <button key={idx} onClick={() => handleToggleCMC(idx)} className={`p-4 rounded-xl text-base font-black transition-all flex items-center gap-4 border-4 ${isSel ? 'text-white' : 'bg-white border-[#E2E8F0] text-[#666666] hover:-translate-y-1'}`} style={isSel ? { backgroundColor: col, borderColor: col } : {}}>
                                 <div className={`w-8 h-8 rounded-[8px] flex justify-center items-center shrink-0 border-4 border-white transition-colors ${isSel ? 'bg-white/40' : 'bg-[#E2E8F0]'}`}>
                                    {isSel && <span className="material-symbols-rounded text-lg text-white">check_box</span>}
                                 </div>
                                 <span className="text-left">{opt}</span>
                              </button>
                           );
                        })}
                     </div>
                  )}

                  {/* Essay UI */}
                  {currentQ.type === 'essay' && (
                     <div className="flex flex-col gap-4">
                        <textarea 
                           className="w-full h-32 p-4 border-4 border-[#E2E8F0] rounded-2xl text-lg font-bold text-[#333333] outline-none focus:border-[#5AAFD1] disabled:bg-[#F8FAFC] disabled:opacity-80 transition-colors custom-scroll resize-none" 
                           placeholder="Ketikkan jawabanmu di sini..."
                           value={answers[currentQuestion]}
                           onChange={(e) => updateAnswer(e.target.value)}
                           disabled={essayResults[currentQuestion] !== undefined || isGrading}
                        ></textarea>

                        {/* Grading Action Area */}
                        {essayResults[currentQuestion] === undefined && (
                           <button onClick={gradeEssayNow} disabled={answers[currentQuestion].trim().length < 3 || isGrading} className={`self-end flex items-center gap-2 px-8 py-4 rounded-full font-black uppercase tracking-widest border-4 ${answers[currentQuestion].trim().length < 3 ? 'bg-[#E2E8F0] text-[#A0AEC0] cursor-not-allowed border-[#E2E8F0]' : 'btn-bubbly border-[#5AAFD1] bg-[#87CEEB]'}`}>
                               {isGrading ? (
                                  <><span className="material-symbols-rounded animate-spin">sync</span> AI MENGOREKSI...</>
                               ) : (
                                  <><span className="material-symbols-rounded">robot_2</span> CEK JAWABAN</>
                               )}
                           </button>
                        )}

                        {/* Feedback Result */}
                        {essayResults[currentQuestion] !== undefined && (
                           <div className="bg-[#E0F2FE] border-2 border-[#5AAFD1] rounded-2xl p-4 flex gap-4 mt-2 animate-bounce-in">
                              <div className="w-12 h-12 bg-[#87CEEB] text-white rounded-full flex items-center justify-center shrink-0 shadow-sm border-2 border-white">
                                 <span className="material-symbols-rounded">psychology</span>
                              </div>
                              <div>
                                 <h5 className="font-black text-[#5AAFD1] uppercase tracking-widest text-[10px] mb-1">UMPAN BALIK AI GURU (SKOR: {essayResults[currentQuestion].score})</h5>
                                 <p className="text-sm font-bold text-[#333333] leading-relaxed">{essayResults[currentQuestion].feedback}</p>
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Navigation Buttons Row */}
                  <div className="flex justify-between items-center mt-12 bg-[#F8FAFC] -mx-6 md:-mx-10 -mb-6 md:-mb-10 p-6 md:p-8 rounded-b-[36px] border-t-4 border-[#E2E8F0]">
                     <button onClick={handlePrevQuestion} disabled={currentQuestion === 0} className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-2 border-4 transition-all ${currentQuestion === 0 ? 'bg-transparent border-transparent text-[#A0AEC0] opacity-50' : 'bg-white border-[#E2E8F0] text-[#666666] hover:border-[#87CEEB]'}`}>
                        <span className="material-symbols-rounded text-lg">arrow_back</span> KEMBALI
                     </button>
                     
                     {currentQuestion < story.questions.length - 1 ? (
                        <button onClick={handleNextQuestion} disabled={!isQuestionAnswered()} className={`px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all border-4 shadow-sm ${!isQuestionAnswered() ? 'bg-[#E2E8F0] border-[#E2E8F0] text-[#A0AEC0] cursor-not-allowed' : 'bg-[#34D399] border-[#059669] text-white hover:scale-105'}`}>
                           LANJUT SOAL <span className="material-symbols-rounded text-xl">arrow_forward</span>
                        </button>
                     ) : (
                        <button onClick={handleFinishStory} disabled={!isAllAnswered} className={`px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all border-4 shadow-sm ${!isAllAnswered ? 'bg-[#E2E8F0] border-[#E2E8F0] text-[#A0AEC0] cursor-not-allowed' : 'bg-[#FFB347] border-[#E69A2E] text-white hover:scale-105 hover:bg-[#E69A2E]'}`}>
                           LIHAT HASIL <span className="material-symbols-rounded text-xl">workspace_premium</span>
                        </button>
                     )}
                  </div>
               </div>
            )}
          </div>
        )}

        {/* Intermission Step */}
        {step === "intermission" && (
           <div className="animate-bounce-in max-w-2xl mx-auto mt-20 text-center relative z-10">
              <div className="card-bubbly bg-[#E0F2FE] border-4 border-[#87CEEB] p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full opacity-30 -mr-10 -mt-10"></div>
                  <h2 className="text-4xl font-black text-[#5AAFD1] mb-4 drop-shadow-sm">LUAR BIASA! 🎉</h2>
                  <p className="text-xl font-bold text-[#666666] mb-8">Pemahamanmu sangat hebat di Level {story.id}! <br/> Siap untuk cerita yang lebih maju?</p>
                  <button onClick={handleNextStory} className="btn-bubbly rounded-full px-12 py-5 text-xl flex items-center justify-center gap-4 bg-[#87CEEB] mx-auto group shadow-[0_6px_0_#5AAFD1]">
                     LANJUT KE LEVEL {STORIES[currentStoryIndex + 1].id} <span className="material-symbols-rounded group-hover:translate-x-2 transition-transform">trending_up</span>
                  </button>
              </div>
           </div>
        )}

        {/* Result Step */}
        {step === "result" && (
          <div className="animate-bounce-in max-w-5xl mx-auto relative z-10">
             <div className="card-bubbly p-10 md:p-16 bg-white border-4 shadow-[0_10px_0_#DB2777]" style={{ borderColor: story.colorDark }}>
                <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                   <div className="w-32 h-32 text-6xl flex items-center justify-center animate-bounce">🏆</div>
                   <div className="text-center md:text-left">
                     <p className="text-xs font-black text-[#87CEEB] uppercase tracking-widest mb-1 border-2 border-[#E0F2FE] inline-block px-3 py-1 rounded-md">TES SELESAI</p>
                     <h2 className="text-4xl md:text-6xl font-black uppercase text-[#333333] mb-2 tracking-tighter">HASIL AKHIR Level {STORIES[Math.max(0, (storyResults[storyResults.length - 1]?.score >= 75) ? currentStoryIndex : currentStoryIndex - 1)].id}</h2>
                     <p className="text-lg font-bold text-[#666666]">Skor rata-rata bacaanmu adalah <span className="text-2xl text-[#34D399] font-black">{totalFinalScore}</span>. Hebat sekali kerja kerasmu hari ini!</p>
                   </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center border-t-4 border-[#E2E8F0] pt-10">
                   <Link href="/explore/library" className="btn-bubbly rounded-full px-10 py-5 flex items-center gap-3">
                      KEMBALI KE BERANDA 🏠
                   </Link>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
