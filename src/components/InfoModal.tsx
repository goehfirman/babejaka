"use client";
import React from "react";
import { X, Info, Target, Swords, Star, BookOpen, Brain, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InfoModalProps {
  onClose: () => void;
}

export default function InfoModal({ onClose }: InfoModalProps) {
  const sections = [
    {
      title: "Filosofi & Tujuan",
      icon: <Brain className="text-primary" />,
      content: "BABE JAKA (Baca Bersama Jaga Jakarta) hadir sebagai jembatan antara pelestarian budaya Betawi dan kemajuan teknologi. Kami percaya bahwa dengan mengenal akar budaya melalui literasi, generasi muda Jakarta akan tumbuh menjadi warga global yang berkarakter dan cerdas."
    },
    {
      title: "Fitur Utama",
      icon: <BookOpen className="text-secondary" />,
      content: (
        <ul className="space-y-2 text-sm">
          <li>• <span className="font-bold">Perpustakaan Digital:</span> Eksplorasi cerita rakyat dan sejarah Jakarta yang interaktif.</li>
          <li>• <span className="font-bold">Diagnosis Literasi:</span> Uji kemampuan membaca dan pemahamanmu dengan bantuan kecerdasan buatan (AI).</li>
          <li>• <span className="font-bold">Pusat Permainan:</span> Belajar sejarah dan budaya lewat tantangan yang seru.</li>
        </ul>
      )
    },
    {
      title: "Cara Bermain",
      icon: <Swords className="text-primary" />,
      content: (
        <div className="space-y-4">
          <div>
            <p className="font-bold text-ink mb-1 flex items-center gap-2"><Target size={14} className="text-primary" /> Katapel Jakarta</p>
            <p className="text-xs text-ink-light leading-relaxed">Tarik dan bidik sasaran jawaban yang benar. Pastikan bidikanmu tepat untuk mengumpulkan poin tertinggi!</p>
          </div>
          <div>
            <p className="font-bold text-ink mb-1 flex items-center gap-2"><Swords size={14} className="text-secondary" /> Tarik Tambang</p>
            <p className="text-xs text-ink-light leading-relaxed">Adu pengetahuan dengan teman atau bot. Jawab pertanyaan kuis secepat mungkin untuk menarik lawan ke areamu.</p>
          </div>
        </div>
      )
    },
    {
      title: "Bintang & Leaderboard",
      icon: <Star className="text-yellow-500" />,
      content: "Kumpulkan bintang dengan membaca buku (minimal 10 detik per halaman) atau memenangkan permainan. Bintangmu akan menentukan posisimu di Leaderboard (Papan Peringkat) global Jagoan Kata!"
    }
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-md" onClick={onClose}></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-batik-subtle p-8 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Info size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-ink italic leading-tight">Panduan <span className="text-primary">Babe Jaka</span></h2>
              <p className="text-xs font-bold text-ink-light uppercase tracking-widest opacity-60">Segala hal yang perlu kamu tahu</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all">
            <X size={24} className="text-ink-light" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scroll">
          <div className="grid gap-8">
            {sections.map((section, idx) => (
              <div key={idx} className="flex gap-5 group">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-ink mb-2">{section.title}</h3>
                  <div className="text-ink-light font-bold text-sm leading-relaxed">
                    {section.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 text-center shrink-0">
          <button 
            onClick={onClose}
            className="btn-heritage px-12 py-4 rounded-2xl font-black text-lg shadow-glow-red"
          >
            SAYA MENGERTI
          </button>
        </div>
      </motion.div>
    </div>
  );
}
