"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useProfile } from "@/lib/profile-context";
import { useRouter } from "next/navigation";
import { gradeEssayAction } from "@/actions/grade-essay";
import { BOOKS } from "@/lib/books-data";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Constants ---

// --- Content Collections (Variations) ---

const LEVEL_VARIATIONS: Record<string, any[]> = {
  "A": [
    { id: "A", title: "Pembaca Dini", subtitle: "Level A", text: "Ini Monas. Monas tinggi sekali. Emas Monas berkilau.", time: 30, image: "/images/stories/jakarta_monas.png" },
    { id: "A", title: "Pembaca Dini", subtitle: "Level A", text: "Bus melaju. Bus warna biru. Aku naik bus TransJakarta.", time: 30, image: "/images/stories/jakarta_transjakarta.png" }
  ],
  "B": [
    { id: "B", title: "Pembaca Awal", subtitle: "Level B", text: "Pagi ini aku naik TransJakarta. Busnya bersih dan dingin. Aku pergi ke halte Bundaran HI.", time: 45, image: "/images/stories/jakarta_transjakarta.png" },
    { id: "B", title: "Pembaca Awal", subtitle: "Level B", text: "Beni makan kerak telor di taman. Kerak telor itu gurih dan enak. Ada serundeng di dalamnya.", time: 45, image: "/images/stories/jakarta_monas.png" }
  ],
  "C": [
    { id: "C", title: "Pembaca Semenjana", subtitle: "Level C", text: "Ondel-ondel menari dengan riang diiringi musik tanjidor. Mereka adalah simbol budaya Betawi yang harus kita jaga.", time: 60, image: "/images/stories/jakarta_ondel_ondel.png" },
    { id: "C", title: "Pembaca Semenjana", subtitle: "Level C", text: "Festival Kota Jakarta sangat ramai. Ada panggung musik dan banyak penjual makanan khas Betawi di sana.", time: 60, image: "/images/stories/jakarta_ondel_ondel.png" }
  ],
  "D": [
    { id: "D", title: "Pembaca Madya", subtitle: "Level D", text: "Stasiun MRT Bundaran HI sangat modern. Kereta melaju cepat di bawah tanah dan di atas jalan raya, memudahkan warga Jakarta bepergian.", time: 90, image: "/images/stories/jakarta_mrt.png" },
    { id: "D", title: "Pembaca Madya", subtitle: "Level D", text: "Sistem transportasi terintegrasi di Jakarta kini semakin canggih. Warga bisa berpindah dari TransJakarta ke MRT dengan satu kartu saja.", time: 90, image: "/images/stories/jakarta_mrt.png" }
  ],
  "E": [
    { id: "E", title: "Pembaca Mahir", subtitle: "Level E", text: "Jakarta kini bertransformasi menjadi kota global yang kompetitif. Pembangunan infrastruktur digital dan sistem transportasi efisien menjadi pilar utama kemajuan kota.", time: 120, image: "/images/stories/jakarta_global.png" },
    { id: "E", title: "Pembaca Mahir", subtitle: "Level E", text: "Kemajuan Jakarta mencerminkan semangat kolaborasi antara teknologi modern dan kearifan budaya lokal yang tetap terjaga di tengah modernitas perkotaan.", time: 120, image: "/images/stories/jakarta_global.png" }
  ]
};

const STORY_VARIATIONS: Record<string, any[]> = {
  "B-1": [
    {
      id: "B-1", title: "Naik TransJakarta", theme: "Level B-1 — Pembaca Awal", icon: "directions_bus", color: "#34D399", colorDark: "#059669", image: "/images/stories/jakarta_transjakarta.png",
      text: "Pagi ini aku naik TransJakarta. Busnya bersih dan dingin. Aku pergi ke halte Bundaran HI untuk melihat air mancur yang indah.",
      questions: [
        { type: "mc", question: "Ke mana aku pergi hari ini?", options: ["Ke pasar", "Ke Bundaran HI", "Ke sekolah", "Ke rumah nenek"], correctAnswers: [1], barrettLevel: "literal" },
        { type: "cmc", question: "Bagaimana kondisi bus TransJakarta menurut teks?", options: ["Kotor", "Bersih", "Dingin", "Panas"], correctAnswers: [1, 2], barrettLevel: "literal" },
        { type: "mc", question: "Apa yang ingin dilihat di Bundaran HI?", options: ["Gedung tinggi", "Air mancur", "Pasar", "Burung"], correctAnswers: [1], barrettLevel: "reorganization" },
        { type: "essay", question: "Mengapa penting menjaga kebersihan di dalam bus umum?", referenceAnswer: "Agar semua penumpang merasa nyaman dan bus tetap terawat.", barrettLevel: "inferential" },
        { type: "essay", question: "Apakah kamu suka naik kendaraan umum? Mengapa?", referenceAnswer: "Ya, karena bisa mengurangi kemacetan dan polusi udara di Jakarta.", barrettLevel: "evaluative" }
      ]
    }
  ],
  "B-2": [
    {
      id: "B-2", title: "Makan Kerak Telor", theme: "Level B-2 — Pembaca Awal", icon: "restaurant", color: "#87CEEB", colorDark: "#5AAFD1", image: "/images/stories/jakarta_monas.png",
      text: "Beni makan kerak telor di taman dekat Monas. Kerak telor itu gurih dan enak. Ada serundeng dan telur bebek di dalamnya. Beni membelinya dari bapak penjual yang ramah.",
      questions: [
        { type: "mc", question: "Apa makanan khas yang dimakan Beni?", options: ["Nasi Goreng", "Kerak Telor", "Sate Padang", "Siomay"], correctAnswers: [1], barrettLevel: "literal" },
        { type: "cmc", question: "Apa saja bahan kerak telor yang disebutkan?", options: ["Serundeng", "Kecap Manis", "Telur Bebek", "Keju"], correctAnswers: [0, 2], barrettLevel: "literal" },
        { type: "mc", question: "Beni makan kerak telor di dekat...", options: ["Pasar", "Gedung Sate", "Monas", "Stasiun"], correctAnswers: [2], barrettLevel: "reorganization" },
        { type: "essay", question: "Berasal dari manakah makanan kerak telor tersebut?", referenceAnswer: "Kerak telor adalah makanan khas dari Betawi, Jakarta.", barrettLevel: "inferential" },
        { type: "essay", question: "Menurutmu, mengapa kita harus bangga dengan makanan tradisional?", referenceAnswer: "Karena itu adalah identitas budaya kita yang unik dan lezat.", barrettLevel: "evaluative" }
      ]
    }
  ],
  "B-3": [
    {
      id: "B-3", title: "Jalan-jalan di Monas", theme: "Level B-3 — Pembaca Awal", icon: "park", color: "#60A5FA", colorDark: "#2563EB", image: "/images/stories/jakarta_monas.png",
      text: "Monas adalah ikon kota Jakarta. Di puncaknya terdapat emas yang berkilau di bawah sinar matahari. Banyak orang berolahraga dan piknik di lapangan Silang Monas yang luas dan rindang.",
      questions: [
        { type: "mc", question: "Apa yang ada di puncak Monas?", options: ["Lampu", "Emas", "Bintang", "Bendera"], correctAnswers: [1], barrettLevel: "literal" },
        { type: "cmc", question: "Apa saja kegiatan orang di lapangan Monas?", options: ["Berolahraga", "Tidur", "Piknik", "Berenang"], correctAnswers: [0, 2], barrettLevel: "literal" },
        { type: "mc", question: "Monas merupakan ikon dari kota...", options: ["Bandung", "Surabaya", "Jakarta", "Medan"], correctAnswers: [2], barrettLevel: "reorganization" },
        { type: "essay", question: "Bagaimana perasaanmu setelah mengunjungi Monas?", referenceAnswer: "Bangga dan senang bisa melihat simbol perjuangan bangsa.", barrettLevel: "inferential" },
        { type: "essay", question: "Mengapa kita harus menjaga kebersihan di taman Monas?", referenceAnswer: "Agar taman tetap indah dan nyaman dikunjungi semua orang.", barrettLevel: "evaluative" }
      ]
    }
  ],
  "C": [
    {
      id: "C", title: "Pesona Ondel-Ondel", theme: "Level C — Semenjana", icon: "theater_comedy", color: "#FFB347", colorDark: "#E69A2E", image: "/images/stories/jakarta_ondel_ondel.png",
      text: "Ondel-ondel menari dengan riang diiringi musik tanjidor. Sepasang ondel-ondel merah dan putih menyapa warga Jakarta yang lewat. Mereka adalah simbol budaya Betawi yang harus kita jaga bersama-sama agar tidak hilang ditelan zaman.",
      questions: [
        { type: "mc", question: "Musik apa yang mengiringi ondel-ondel?", options: ["Gamelan", "Tanjidor", "Piano", "Kendang"], correctAnswers: [1], barrettLevel: "literal" },
        { type: "cmc", question: "Apa warna ondel-ondel yang ada di cerita?", options: ["Merah", "Biru", "Putih", "Kuning"], correctAnswers: [0, 2], barrettLevel: "literal" },
        { type: "mc", question: "Ondel-ondel merupakan simbol budaya dari suku...", options: ["Jawa", "Sunda", "Betawi", "Bali"], correctAnswers: [2], barrettLevel: "reorganization" },
        { type: "essay", question: "Mengapa kita harus menjaga budaya ondel-ondel?", referenceAnswer: "Agar warisan budaya kita tetap lestari dan dikenal generasi mendatang.", barrettLevel: "inferential" },
        { type: "essay", question: "Bagaimana caramu ikut serta melestarikan budaya Betawi?", referenceAnswer: "Dengan mempelajari sejarahnya dan bangga menggunakannya.", barrettLevel: "evaluative" }
      ]
    }
  ],
  "D": [
    {
      id: "D", title: "Modernitas MRT Jakarta", theme: "Level D — Madya", icon: "train", color: "#A78BFA", colorDark: "#7C3AED", image: "/images/stories/jakarta_mrt.png",
      text: "Stasiun MRT Bundaran HI sangat modern dengan fasilitas lengkap. Kereta melaju cepat dan tenang, baik di bawah tanah maupun di atas jalan raya. Transportasi terintegrasi ini menjadi solusi cerdas untuk mengatasi kepadatan lalu lintas di ibu kota.",
      questions: [
        { type: "mc", question: "Sebutkan salah satu stasiun MRT di Jakarta!", options: ["Stasiun Gambir", "Stasiun Bundaran HI", "Stasiun Senen", "Stasiun Kota"], correctAnswers: [1], barrettLevel: "literal" },
        { type: "cmc", question: "Di mana saja jalur kereta MRT melaju?", options: ["Bawah laut", "Bawah tanah", "Atas jalan raya", "Hutan"], correctAnswers: [1, 2], barrettLevel: "literal" },
        { type: "mc", question: "Masalah utama Jakarta yang ingin diatasi dengan MRT adalah...", options: ["Banjir", "Kemacetan", "Kriminalitas", "Sampah"], correctAnswers: [1], barrettLevel: "reorganization" },
        { type: "essay", question: "Apa manfaat transportasi umum yang terintegrasi bagi warga?", referenceAnswer: "Memudahkan mobilitas dan menghemat waktu perjalanan.", barrettLevel: "inferential" },
        { type: "essay", question: "Setujukah kamu jika MRT diperluas ke seluruh wilayah Jakarta? Jelaskan!", referenceAnswer: "Setuju, agar lebih banyak orang beralih dari kendaraan pribadi ke transportasi umum.", barrettLevel: "evaluative" }
      ]
    }
  ],
  "E": [
    {
      id: "E", title: "Jakarta Kota Global", theme: "Level E — Mahir", icon: "language", color: "#F472B6", colorDark: "#DB2777", image: "/images/stories/jakarta_global.png",
      text: "Jakarta kini bertransformasi menjadi kota global yang kompetitif di kancah internasional. Pembangunan infrastruktur digital dan sistem transportasi yang efisien menjadi pilar utama kemajuan. Namun, di tengah modernitas tersebut, pelestarian identitas budaya Betawi tetap menjadi jiwa yang menggerakkan keunikan kota ini menuju masa depan yang gemilang.",
      questions: [
        { type: "mc", question: "Apa visi Jakarta di kancah internasional?", options: ["Kota Wisata", "Kota Global", "Kota Industri", "Kota Pelabuhan"], correctAnswers: [1], barrettLevel: "literal" },
        { type: "cmc", question: "Apa saja pilar utama kemajuan Jakarta menurut teks?", options: ["Pasar Tradisional", "Infrastruktur Digital", "Sistem Transportasi", "Pertanian"], correctAnswers: [1, 2], barrettLevel: "literal" },
        { type: "mc", question: "Meskipun modern, Jakarta tetap harus melestarikan budaya...", options: ["Batak", "Betawi", "Minang", "Dayak"], correctAnswers: [1], barrettLevel: "reorganization" },
        { type: "essay", question: "Apa tantangan terbesar Jakarta dalam menjadi kota global?", referenceAnswer: "Menyeimbangkan kemajuan teknologi dengan pelestarian nilai-nilai budaya lokal.", barrettLevel: "inferential" },
        { type: "essay", question: "Menurutmu, citra seperti apa yang ingin dibangun Jakarta di mata dunia?", referenceAnswer: "Citra kota yang modern, canggih, namun tetap berakar pada budaya dan ramah bagi semua.", barrettLevel: "evaluative" }
      ]
    }
  ]
};

const LEVEL_CHARACTERISTICS: Record<string, any> = {
  "A": {
    id: "A", name: "Pembaca Dini", age: "0–7 tahun", symbol: "Bintang", color: "#FF4757",
    kpmRange: "0–30 KPM",
    ability: "Mengenal ikon kota seperti Monas dan bus TransJakarta melalui kalimat sangat pendek.",
    content: "Fokus pada objek ikonik Jakarta (Monas, Bus Biru).",
    language: "Kosakata sederhana (5–20 kata), maks 5 kata per kalimat.",
    visual: "Gambar Monas dan Bus sangat dominan."
  },
  "B1": {
    id: "B1", name: "Pembaca Awal", age: "6–8 tahun", symbol: "Lingkaran", color: "#8E44AD",
    kpmRange: "30–50 KPM",
    ability: "Memahami alur cerita harian di Jakarta seperti naik transportasi umum.",
    content: "Kisah perjalanan menggunakan TransJakarta ke Bundaran HI.",
    language: "Maksimal 7 kata per kalimat, bahasa sehari-hari.",
    visual: "Ilustrasi bus TransJakarta mendukung teks."
  },
  "B2": {
    id: "B2", name: "Pembaca Awal", age: "7–9 tahun", symbol: "Lingkaran", color: "#8E44AD",
    kpmRange: "50–70 KPM",
    ability: "Mengenal kuliner tradisional Jakarta dan interaksi sosial sederhana.",
    content: "Pengalaman makan Kerak Telor dan mengenal bahan-bahannya.",
    language: "Maksimal 9 kata per kalimat, deskripsi makanan.",
    visual: "Gambar Kerak Telor membantu pemahaman subjek."
  },
  "B3": {
    id: "B3", name: "Pembaca Awal", age: "8–10 tahun", symbol: "Lingkaran", color: "#8E44AD",
    kpmRange: "70–90 KPM",
    ability: "Memahami deskripsi tempat wisata sejarah di Jakarta.",
    content: "Fakta-fakta menarik tentang Monas sebagai ikon ibu kota.",
    language: "Maksimal 12 kata per kalimat, teks mulai dominan.",
    visual: "Ilustrasi Monas yang lebih detail."
  },
  "C": {
    id: "C", name: "Pembaca Semenjana", age: "10–13 tahun", symbol: "Lingkaran", color: "#5AAFD1",
    kpmRange: "90–110 KPM",
    ability: "Memahami narasi budaya Betawi dan pentingnya pelestarian tradisi.",
    content: "Budaya Ondel-Ondel dan musik Tanjidor dalam festival kota.",
    language: "Variasi kalimat tunggal/majemuk, kosakata budaya Jakarta.",
    visual: "Foto atau ilustrasi Ondel-Ondel yang ekspresif."
  },
  "D": {
    id: "D", name: "Pembaca Madya", age: "13–15 tahun", symbol: "Segitiga", color: "#22C55E",
    kpmRange: "110–130 KPM",
    ability: "Memahami konsep infrastruktur modern dan solusi masalah perkotaan.",
    content: "Modernitas MRT Jakarta dan sistem transportasi terintegrasi.",
    language: "Kosakata kompleks terkait teknologi dan urbanisme.",
    visual: "Gambar stasiun MRT yang futuristik."
  },
  "E": {
    id: "E", name: "Pembaca Mahir", age: "16+ tahun", symbol: "Segi Empat", color: "#FACC15",
    kpmRange: "130–150+ KPM",
    ability: "Mampu menganalisis visi strategis Jakarta sebagai kota global.",
    content: "Transformasi Jakarta menuju kota global dan pelestarian identitas lokal.",
    language: "Kosakata bidang ekonomi, sosial, dan kebudayaan tingkat tinggi.",
    visual: "Grafik atau citra skyline Jakarta yang modern."
  }
};

const LEVELS_IDS = ["A", "B", "C", "D", "E"];


// --- Sub-Components ---

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

// --- Report Template (Replaces Certificate) ---
const ReportTemplate = React.forwardRef<HTMLDivElement, { 
  profileName: string; 
  levelData: any; 
  fluencyData: any; 
  compScore: number | null;
  fluencyRubric: any;
  barrettMastery: any;
  smartAdvice: string;
}>(({ profileName, levelData, fluencyData, compScore, fluencyRubric, barrettMastery, smartAdvice }, ref) => {
  const reportId = useMemo(() => {
    const random = Math.floor(1000 + Math.random() * 9000);
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `RPT-${date}-${random}`;
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      left: '0', 
      top: '0', 
      width: '793px', // A4 Portrait Width
      height: '1122px', // A4 Portrait Height
      zIndex: -1000, 
      opacity: 0, 
      pointerEvents: 'none',
      backgroundColor: '#FFFFFF'
    }}>
      <div 
        ref={ref}
        id="report-content"
        style={{ 
          width: '793px', 
          height: '1122px',
          boxSizing: 'border-box',
          backgroundColor: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
          padding: '40px'
        }}
      >
        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '4px solid #5AAFD1', paddingBottom: '20px', marginBottom: '30px' }}>
          <img src="/images/redi_robo.png" alt="BABE JAKA" style={{ width: '80px', height: '80px', objectFit: 'contain', marginRight: '20px' }} />
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#333333', margin: 0, textTransform: 'uppercase' }}>Laporan Hasil Diagnosis Membaca</h1>
            <p style={{ fontSize: '14px', color: '#666666', margin: 0, marginTop: '4px', fontWeight: 'bold', letterSpacing: '1px' }}>BABE JAKA LITERACY DIAGNOSTIC</p>
          </div>
        </div>

        {/* Student Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', backgroundColor: '#F0F8FF', padding: '20px', borderRadius: '12px', border: '1px solid #E0F2FE' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#A0AEC0', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Nama Siswa</p>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#333333', margin: 0 }}>{profileName}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: '#A0AEC0', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Jenjang Membaca</p>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#5AAFD1', margin: 0 }}>{levelData.id} - {levelData.name}</h2>
          </div>
        </div>

        {/* Tabel Laporan Komprehensif */}
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#333333', marginBottom: '16px', borderLeft: '4px solid #34D399', paddingLeft: '10px' }}>Tabel Laporan Komprehensif</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC' }}>
              <th style={{ padding: '12px', border: '1px solid #E2E8F0', textAlign: 'left', color: '#666666' }}>Aspek Penilaian</th>
              <th style={{ padding: '12px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#666666' }}>Skor Mentah</th>
              <th style={{ padding: '12px', border: '1px solid #E2E8F0', textAlign: 'center', color: '#666666' }}>Peringkat Rubrik (1-4)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', fontWeight: 'bold' }}>Ketepatan (Akurasi)</td>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>{fluencyData.accuracy}%</td>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', textAlign: 'center', fontWeight: 'bold', color: '#5AAFD1' }}>{fluencyRubric?.accuracy || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', fontWeight: 'bold' }}>Kecepatan (WPM)</td>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>{fluencyData.wpm}</td>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', textAlign: 'center', fontWeight: 'bold', color: '#5AAFD1' }}>{fluencyRubric?.rate || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', fontWeight: 'bold' }}>Kelancaran (Automaticity)</td>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>Diukur via Jeda</td>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', textAlign: 'center', fontWeight: 'bold', color: '#5AAFD1' }}>{fluencyRubric?.automaticity || '-'}</td>
            </tr>
            <tr>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', fontWeight: 'bold' }}>Intonasi (Prosody)</td>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>Diukur via Konsistensi</td>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', textAlign: 'center', fontWeight: 'bold', color: '#5AAFD1' }}>{fluencyRubric?.prosody || '-'}</td>
            </tr>
            <tr style={{ backgroundColor: '#F0F9FF' }}>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', fontWeight: 'bold' }}>Pemahaman Membaca</td>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', textAlign: 'center', fontWeight: 'bold' }}>{compScore || '-'} / 100</td>
              <td style={{ padding: '12px', border: '1px solid #E2E8F0', textAlign: 'center', fontWeight: 'bold', color: '#5AAFD1' }}>N/A</td>
            </tr>
          </tbody>
        </table>

        {/* Karakteristik Jenjang */}
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#333333', marginBottom: '16px', borderLeft: '4px solid #FFB347', paddingLeft: '10px' }}>Karakteristik Jenjang: {levelData.id}</h3>
        <div style={{ backgroundColor: '#FFFDF0', padding: '20px', borderRadius: '12px', border: '1px solid #FEF08A', marginBottom: '30px', fontSize: '14px', lineHeight: '1.6', color: '#333333' }}>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            <li style={{ marginBottom: '8px' }}><strong>Target Usia:</strong> {levelData.age}</li>
            <li style={{ marginBottom: '8px' }}><strong>Kemampuan Utama:</strong> {levelData.ability}</li>
            <li style={{ marginBottom: '8px' }}><strong>Bahasa & Kosakata:</strong> {levelData.language}</li>
            <li><strong>Materi Bacaan:</strong> {levelData.content}</li>
          </ul>
        </div>

        {/* Saran */}
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#333333', marginBottom: '16px', borderLeft: '4px solid #F472B6', paddingLeft: '10px' }}>Saran & Rekomendasi</h3>
        <div style={{ backgroundColor: '#FDF2F8', padding: '20px', borderRadius: '12px', border: '1px solid #FBCFE8', fontSize: '14px', lineHeight: '1.6', color: '#831843' }}>
          <p style={{ margin: 0, fontStyle: 'italic', fontWeight: 'bold' }}>"{smartAdvice}"</p>
        </div>

        {/* Footer Signature */}
        <div style={{ position: 'absolute', bottom: '40px', right: '40px', textAlign: 'right' }}>
           <p style={{ fontSize: '12px', color: '#A0AEC0', marginBottom: '8px', fontWeight: 'bold' }}>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
           <p style={{ fontSize: '16px', fontWeight: 900, color: '#333333', margin: 0 }}>Tim BABE JAKA</p>
           <p style={{ fontSize: '10px', color: '#666666', marginTop: '4px' }}>ID Laporan: {reportId}</p>
        </div>
      </div>
    </div>
  );
});

ReportTemplate.displayName = "ReportTemplate";

// --- Main Page ---

export default function IntegratedDiagnosticPage() {
  const { profile, logout, getAvatarUrl } = useProfile();
  const router = useRouter();

  // Unified State Machine
  // journey -> fluency_reading -> fluency_intermission -> decision -> comp_reading -> result
  const [step, setStep] = useState<string>("fluency_reading");
  
  // Content Pool State (Randomized per session/start)
  const [selectedLevels, setSelectedLevels] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

  // Fluency State
  type FluencyEntry = {
    accuracy: number;
    wpm: number;
    levelId: string;
    pauseCount: number;       // pauses > 1.5s during reading
    avgGapMs: number;         // average ms between word recognitions
    speedConsistency: number; // 0-100, higher = more consistent reading pace
    kpmRange: string;         // target KPM range for this level
  };
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [fluencyHistory, setFluencyHistory] = useState<FluencyEntry[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [matchedIndices, setMatchedIndices] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [startTime, setStartTime] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const isReadingRef = useRef(false);
  const currentLevelIdxRef = useRef(0);
  const shouldRestartRef = useRef(false);
  // Transcript persistence across auto-restarts (tablet fix)
  const savedTranscriptRef = useRef<string>("");
  const lastSessionFinalsRef = useRef<string>("");
  const bestMatchRef = useRef<number[]>([]);
  // Word-timing tracking for Kelancaran & Intonasi measurement
  const wordTimestampsRef = useRef<number[]>([]);
  const lastMatchCountRef = useRef<number>(0);

  // Comprehension State
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [compAnswers, setCompAnswers] = useState<any[]>([]);
  const [essayResults, setEssayResults] = useState<Record<number, {score: number, feedback: string}>>({});
  const [isGrading, setIsGrading] = useState(false);
  const [compScore, setCompScore] = useState<number | null>(null);
  const [barrettMastery, setBarrettMastery] = useState<Record<string, number>>({ 
    literal: 0, 
    reorganization: 0, 
    inferential: 0, 
    evaluative: 0 
  });

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    setIsGeneratingPDF(true);
    
    // Small delay to ensure images are fully loaded in the DOM
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // Higher quality
        useCORS: false, // Not needed for local assets
        logging: false,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [793, 1122]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 793, 1122);
      pdf.save(`Laporan_BABEJAKA_${profile.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("Gagal mengunduh laporan. Silakan coba lagi.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // --- Randomization Logic ---
  const initializePool = () => {
    // Pick one random variation for each level A-E
    const levels = LEVELS_IDS.map(id => {
      const vars = LEVEL_VARIATIONS[id];
      return vars[Math.floor(Math.random() * vars.length)];
    });
    setSelectedLevels(levels);
    // Story will be picked later based on final fluency level
  };

  useEffect(() => {
    initializePool();
  }, []);

  // Keep refs in sync with state so callbacks never use stale values
  useEffect(() => { isReadingRef.current = isReading; }, [isReading]);
  useEffect(() => { currentLevelIdxRef.current = currentLevelIdx; }, [currentLevelIdx]);

  // --- Word matching helper (shared logic) ---
  const matchWordsSequentially = (spokenWords: string[], targetText: string): number[] => {
    const targetWords = targetText.toLowerCase().split(" ");
    const matched: number[] = [];
    let cursor = 0;

    // Deduplicate consecutive identical words (tablet echo/reverb fix)
    const deduped: string[] = [];
    spokenWords.forEach((w, i) => {
      if (i === 0 || w !== spokenWords[i - 1]) deduped.push(w);
    });

    deduped.forEach(w => {
      const cleanW = w.replace(/[.,!?"""]/g, "").trim();
      if (!cleanW) return;
      // Lookahead window of 5 words (allows skipping difficult words)
      for (let i = cursor; i < Math.min(cursor + 5, targetWords.length); i++) {
        const targetClean = targetWords[i].replace(/[.,!?"""]/g, "").trim().toLowerCase();
        if (targetClean === cleanW && !matched.includes(i)) {
          matched.push(i);
          cursor = i + 1;
          break;
        }
      }
    });

    return matched.sort((a, b) => a - b);
  };

  // --- Speech Recognition Logic (Tablet-Robust v2) ---
  useEffect(() => {
    // Cleanup previous instance completely
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onaudiostart = null;
        recognitionRef.current.onaudioend = null;
        recognitionRef.current.abort();
      } catch (_) { /* ignore */ }
      recognitionRef.current = null;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || selectedLevels.length === 0) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "id-ID";
    rec.maxAlternatives = 1;

    rec.onaudiostart = () => { setIsMicActive(true); };
    rec.onaudioend = () => { setIsMicActive(false); };

    rec.onresult = (event: any) => {
      // Separate final and interim results from CURRENT recognition session
      let sessionFinals = "";
      let sessionInterim = "";
      for (let i = 0; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          sessionFinals += transcript + " ";
        } else {
          sessionInterim += transcript + " ";
        }
      }

      // Save session finals for persistence across restarts
      lastSessionFinalsRef.current = sessionFinals;

      // Build FULL transcript: saved from previous sessions + current session
      const fullTranscript = savedTranscriptRef.current + sessionFinals + sessionInterim;

      const idx = currentLevelIdxRef.current;
      const currentLevel = selectedLevels[idx];
      if (!currentLevel) return;

      const spokenWords = fullTranscript.toLowerCase().split(/\s+/).filter(Boolean);
      const newMatched = matchWordsSequentially(spokenWords, currentLevel.text);

      // Only update if we matched MORE words (never regress due to interim fluctuations)
      if (newMatched.length > bestMatchRef.current.length) {
        // Record timestamp for each NEWLY matched word
        const now = Date.now();
        const newWordCount = newMatched.length - lastMatchCountRef.current;
        for (let k = 0; k < newWordCount; k++) {
          wordTimestampsRef.current.push(now);
        }
        lastMatchCountRef.current = newMatched.length;
        bestMatchRef.current = newMatched;
        setMatchedIndices(newMatched);
      } else if (newMatched.length === bestMatchRef.current.length) {
        // Same count but possibly different indices — just update display
        bestMatchRef.current = newMatched;
        setMatchedIndices(newMatched);
      }
    };

    // AUTO-RESTART: On tablets/mobile, Chrome often silently stops recognition
    rec.onend = () => {
      setIsMicActive(false);
      if (isReadingRef.current && shouldRestartRef.current) {
        // Persist finals from the session that just ended
        savedTranscriptRef.current += lastSessionFinalsRef.current;
        lastSessionFinalsRef.current = "";

        // Quick restart for responsiveness
        setTimeout(() => {
          if (isReadingRef.current && shouldRestartRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e: any) {
              console.warn("[SpeechRecognition] auto-restart failed:", e.message);
            }
          }
        }, 80);
      }
    };

    rec.onerror = (event: any) => {
      console.warn("[SpeechRecognition] error:", event.error);
      setIsMicActive(false);

      const recoverable = ["no-speech", "audio-capture", "network", "aborted"];
      if (recoverable.includes(event.error) && isReadingRef.current && shouldRestartRef.current) {
        setTimeout(() => {
          if (isReadingRef.current && shouldRestartRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (_) { /* ignore */ }
          }
        }, 200);
      }
    };

    recognitionRef.current = rec;

    return () => {
      shouldRestartRef.current = false;
      try {
        rec.onresult = null;
        rec.onend = null;
        rec.onerror = null;
        rec.onaudiostart = null;
        rec.onaudioend = null;
        rec.abort();
      } catch (_) { /* ignore */ }
    };
  }, [currentLevelIdx, selectedLevels]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isReading && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      stopFluencyReading();
    }
    return () => clearInterval(timer);
  }, [isReading, timeLeft]);

  // --- Fluency Actions ---
  const startDiagnostic = () => {
    initializePool(); // Fresh shuffle on start
    setCurrentLevelIdx(0);
    setFluencyHistory([]);
    if (selectedLevels.length > 0) {
      setTimeLeft(LEVEL_VARIATIONS["A"][0].time);
    } else {
      setTimeLeft(30);
    }
    setStep("fluency_reading");
  };

  // Sync timeLeft when selectedLevels is ready
  useEffect(() => {
    if (selectedLevels.length > 0 && step === "fluency_reading") {
       setTimeLeft(selectedLevels[currentLevelIdx].time);
    }
  }, [selectedLevels, currentLevelIdx, step]);

  const startFluencyReading = () => {
    setIsReading(true);
    isReadingRef.current = true;
    shouldRestartRef.current = true;
    // Reset transcript persistence for fresh reading session
    savedTranscriptRef.current = "";
    lastSessionFinalsRef.current = "";
    bestMatchRef.current = [];
    // Reset timing tracking
    wordTimestampsRef.current = [];
    lastMatchCountRef.current = 0;
    setMatchedIndices([]);
    setStartTime(Date.now());
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        try {
          recognitionRef.current.abort();
          setTimeout(() => {
            try { recognitionRef.current?.start(); } catch (_) { /* give up */ }
          }, 100);
        } catch (_) { /* ignore */ }
      }
    }
  };

  const stopFluencyReading = () => {
    setIsReading(false);
    isReadingRef.current = false;
    shouldRestartRef.current = false;
    setIsMicActive(false);
    const duration = startTime ? (Date.now() - startTime) / 1000 : 1;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_) { /* ignore */ }
    }

    const level = selectedLevels[currentLevelIdx];
    const totalWords = level.text.split(" ").length;
    const matchCount = matchedIndices.length;
    const acc = Math.round((matchCount / totalWords) * 100);
    const wpm = Math.round((matchCount / duration) * 60);

    // --- Compute timing metrics from word timestamps ---
    const timestamps = wordTimestampsRef.current;
    let pauseCount = 0;
    let totalGap = 0;
    const gaps: number[] = [];

    for (let i = 1; i < timestamps.length; i++) {
      const gap = timestamps[i] - timestamps[i - 1];
      gaps.push(gap);
      totalGap += gap;
      if (gap > 1500) pauseCount++; // pause = gap > 1.5 seconds
    }

    const avgGapMs = gaps.length > 0 ? Math.round(totalGap / gaps.length) : 0;

    // Speed consistency: coefficient of variation (lower CV = more consistent)
    // Convert to 0-100 score where 100 = perfectly consistent
    let speedConsistency = 50; // default if not enough data
    if (gaps.length >= 2) {
      const meanGap = totalGap / gaps.length;
      const variance = gaps.reduce((sum, g) => sum + Math.pow(g - meanGap, 2), 0) / gaps.length;
      const stdDev = Math.sqrt(variance);
      const cv = meanGap > 0 ? stdDev / meanGap : 1; // coefficient of variation
      // CV of 0 = perfect consistency (100), CV of 1+ = very inconsistent (0)
      speedConsistency = Math.max(0, Math.min(100, Math.round((1 - Math.min(cv, 1)) * 100)));
    }

    // Get kpmRange for this level
    const levelCharKey = level.id === 'A' ? 'A' : level.id === 'B' ? 'B1' : level.id;
    const kpmRange = LEVEL_CHARACTERISTICS[levelCharKey]?.kpmRange || "0–30 KPM";

    const newResult: FluencyEntry = {
      accuracy: acc,
      wpm: wpm,
      levelId: level.id,
      pauseCount,
      avgGapMs,
      speedConsistency,
      kpmRange
    };
    const nextHistory = [...fluencyHistory, newResult];
    setFluencyHistory(nextHistory);

    if (acc >= 80 && currentLevelIdx < selectedLevels.length - 1) {
      setStep("fluency_intermission");
    } else {
      // DECISION BRIDGE
      const finalLevel = level.id;
      if (finalLevel === 'A') {
        setStep("result");
      } else {
        // Determine sub-level for B comprehension
        let subLevel = "B-1";
        if (finalLevel === 'B') {
           if (wpm > 80 && acc > 95) subLevel = "B-3";
           else if (wpm > 60) subLevel = "B-2";
           else subLevel = "B-1";
        } else {
           subLevel = finalLevel; // C, D, E mapped directly
        }

        const possibleStories = STORY_VARIATIONS[subLevel] || STORY_VARIATIONS["B-1"];
        const pick = possibleStories[Math.floor(Math.random() * possibleStories.length)];
        setSelectedStory(pick);
        setStep("decision");
      }
    }
  };

  const nextFluencyLevel = () => {
    const next = currentLevelIdx + 1;
    setCurrentLevelIdx(next);
    setTimeLeft(selectedLevels[next].time);
    setMatchedIndices([]);
    setStep("fluency_reading");
  };

  // --- Comprehension Actions ---
  const startComprehension = () => {
    if (!selectedStory) return;
    setCompAnswers(selectedStory.questions.map((q:any) => q.type === 'cmc' ? [] : q.type === 'essay' ? "" : null));
    setEssayResults({});
    setCurrentQuestionIdx(0);
    setShowQuestions(false);
    setStep("comp_reading");
  };

  const handleGradeEssay = async () => {
    if (!selectedStory) return;
    setIsGrading(true);
    const q = selectedStory.questions[currentQuestionIdx];
    const ans = compAnswers[currentQuestionIdx];
    const res = await gradeEssayAction(selectedStory.text, q.question, ans, q.referenceAnswer || "");
    setEssayResults(prev => ({ ...prev, [currentQuestionIdx]: res }));
    setIsGrading(false);
  };

  const finishComprehension = () => {
    if (!selectedStory) return;
    
    const masteryTemp: Record<string, number[]> = {
      literal: [],
      reorganization: [],
      inferential: [],
      evaluative: []
    };

    let totalScore = 0;
    selectedStory.questions.forEach((q:any, i:number) => {
      let qScore = 0;
      if (q.type === 'mc') {
        if (compAnswers[i] === q.correctAnswers![0]) qScore = 100;
      } else if (q.type === 'cmc') {
        const corrects = q.correctAnswers!;
        const arr = compAnswers[i] as number[];
        let matches = 0, misses = 0;
        arr.forEach(a => corrects.includes(a) ? matches++ : misses++);
        qScore = Math.max(0, (matches / corrects.length) * 100 - (misses * 50));
      } else if (q.type === 'essay') {
        qScore = essayResults[i]?.score || 0;
      }
      
      totalScore += qScore;
      if (q.barrettLevel && masteryTemp[q.barrettLevel]) {
        masteryTemp[q.barrettLevel].push(qScore);
      }
    });

    // Calculate mastery per barrett level
    const masteryFinal: Record<string, number> = {};
    Object.keys(masteryTemp).forEach(level => {
      const scores = masteryTemp[level];
      masteryFinal[level] = scores.length > 0 ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 0;
    });

    setBarrettMastery(masteryFinal);
    setCompScore(Math.round(totalScore / selectedStory.questions.length));
    setStep("result");
  };

  // --- Calculations ---
  const getFinalPedagogicalData = () => {
    const level = selectedLevels[currentLevelIdx] || { id: 'A' };
    let targetId = level.id;
    
    // Detailed mapping for B sub-levels
    if (targetId === 'B' && selectedStory) {
      if (selectedStory.id === 'B-1') targetId = 'B1';
      else if (selectedStory.id === 'B-2') targetId = 'B2';
      else if (selectedStory.id === 'B-3') targetId = 'B3';
    }

    return LEVEL_CHARACTERISTICS[targetId] || LEVEL_CHARACTERISTICS['A'];
  };

  const finalLevelData = getFinalPedagogicalData();
  const finalFluency = useMemo(() => {
    if (fluencyHistory.length === 0) return { accuracy: 0, wpm: 0 };
    const sumAcc = fluencyHistory.reduce((sum, item) => sum + (item.accuracy || 0), 0);
    const sumWpm = fluencyHistory.reduce((sum, item) => sum + (item.wpm || 0), 0);
    return {
      accuracy: Math.round(sumAcc / fluencyHistory.length),
      wpm: Math.round(sumWpm / fluencyHistory.length)
    };
  }, [fluencyHistory]);

  // Comprehensive Fluency Rubric Score (1-16) — CUMULATIVE across all levels
  const fluencyRubric = useMemo(() => {
    if (step !== "result" || fluencyHistory.length === 0) return null;

    // Helper: score a single level entry
    const scoreOneLevel = (entry: FluencyEntry) => {
      const { accuracy: acc, wpm, pauseCount, avgGapMs, speedConsistency, kpmRange } = entry;

      // 1. KETEPATAN (Accuracy) — directly measured from speech recognition
      let accScore = 1;
      if (acc >= 95) accScore = 4;
      else if (acc >= 85) accScore = 3;
      else if (acc >= 70) accScore = 2;

      // 2. KECEPATAN (Rate) — WPM vs target KPM range for THIS level
      const kpmNums = kpmRange?.match(/\d+/g)?.map(Number) || [0, 30];
      const targetMin = kpmNums[0];
      const targetMax = kpmNums[1] || targetMin + 30;

      let rateScore = 1;
      if (wpm > 0) {
        if (wpm >= targetMax) rateScore = 4;
        else if (wpm >= targetMin) rateScore = 3;
        else if (wpm >= targetMin / 2) rateScore = 2;
      }

      // 3. KELANCARAN (Automaticity) — measured from pause patterns
      //    Fewer pauses + smaller gaps = more fluent reading
      let autoScore = 1;
      if (wpm > 0 && acc > 0) {
        if (pauseCount === 0 && avgGapMs < 600) autoScore = 4;       // Sangat lancar, tanpa jeda
        else if (pauseCount <= 1 && avgGapMs < 1000) autoScore = 3;  // Lancar, sedikit jeda
        else if (pauseCount <= 3 && avgGapMs < 1500) autoScore = 2;  // Ada jeda cukup sering
        // else autoScore = 1 — banyak jeda
      }

      // 4. INTONASI (Prosody) — estimated from speed consistency
      //    Consistent but not monotone reading pace indicates good prosody
      //    Very high consistency (>90) = possibly monotone
      //    Moderate consistency (50-90) = natural, expressive
      //    Low consistency (<50) = stuttering/irregular
      let prosodyScore = 1;
      if (wpm > 0 && acc > 0) {
        if (speedConsistency >= 60 && speedConsistency <= 90 && acc >= 85) prosodyScore = 4;
        else if (speedConsistency >= 45 && acc >= 70) prosodyScore = 3;
        else if (speedConsistency >= 30 && acc >= 50) prosodyScore = 2;
        // else prosodyScore = 1
      }

      return { accScore, rateScore, autoScore, prosodyScore };
    };

    // Score EACH level independently, then average
    const allScores = fluencyHistory.map(scoreOneLevel);
    const count = allScores.length;

    const avgAcc = Math.round(allScores.reduce((s, x) => s + x.accScore, 0) / count);
    const avgRate = Math.round(allScores.reduce((s, x) => s + x.rateScore, 0) / count);
    const avgAuto = Math.round(allScores.reduce((s, x) => s + x.autoScore, 0) / count);
    const avgProsody = Math.round(allScores.reduce((s, x) => s + x.prosodyScore, 0) / count);

    const total = avgAcc + avgRate + avgAuto + avgProsody;
    let label = "Tidak Lancar";
    if (total >= 13) label = "Sangat Lancar";
    else if (total >= 9) label = "Lancar";
    else if (total >= 5) label = "Kurang Lancar";

    return {
      accuracy: avgAcc,
      rate: avgRate,
      automaticity: avgAuto,
      prosody: avgProsody,
      total,
      label,
      perLevel: allScores // expose per-level detail
    };
  }, [step, fluencyHistory]);

  
  const recommendations = useMemo(() => {
    if (step !== "result") return [];
    
    // The BOOKS data in books-data.ts uses codes like "B1", "B2", "B3", "C", "D", "E" at the end of the level string
    const searchCode = finalLevelData.id;

    return BOOKS.filter(b => {
      const parts = b.level.split(" ");
      const lastPart = parts[parts.length - 1];
      return lastPart === searchCode;
    }).slice(0, 4);
  }, [step, finalLevelData.id]);

  const smartAdvice = useMemo(() => {
    if (step !== "result") return "";
    const adv = [];
    if (finalFluency.accuracy < 85) adv.push("Fokus pada kejelasan pengucapan setiap kata, jangan terburu-buru.");
    if (finalFluency.wpm < 60 && finalLevelData.id !== 'A') adv.push("Cobalah membaca teks yang sama berulang kali untuk melatih kecepatan.");
    if (compScore !== null && compScore < 70) adv.push("Setelah membaca satu paragraf, coba ceritakan kembali isinya dengan bahasamu sendiri.");
    
    // Add Barrett-specific advice
    if (barrettMastery.evaluative < 60) adv.push("Latihlah keberanianmu dalam memberikan pendapat tentang sikap tokoh di dalam cerita.");
    if (barrettMastery.reorganization < 60) adv.push("Cobalah untuk meringkas urutan kejadian setelah membaca sebuah cerita pendek.");

    if (adv.length === 0) return "Luar biasa! Pertahankan bakat membacamu dan terus eksplorasi buku-buku baru.";
    return adv.join(" ");
  }, [step, finalFluency, finalLevelData, compScore, barrettMastery]);

  // --- Render Helpers ---
  const currentLevel = selectedLevels[currentLevelIdx];
  const currentStory = selectedStory;

  return (
    <div className="min-h-screen bg-[#F0F8FF] font-body text-[#333333] relative overflow-x-hidden">


       {/* Main Layout Content */}
       <main className="w-full max-w-6xl mx-auto mt-32 px-6 md:px-8 pb-32 relative z-50">
         


         {/* 2. Fluency Reading — Read Along-Inspired */}
         {step === "fluency_reading" && selectedLevels.length > 0 && (
            <div className="animate-bounce-in max-w-6xl mx-auto">
               <div className="card-bubbly bg-[#FFFAF0] p-8 md:p-12 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Progress Bar (Read Along style) */}
                  {isReading && (
                    <div className="absolute top-0 left-0 right-0 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#5AAFD1] to-[#34D399] rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${currentLevel?.text ? Math.round((matchedIndices.length / currentLevel.text.split(" ").length) * 100) : 0}%` }}
                      />
                    </div>
                  )}

                  {/* Integrated Header - Badge, Stars & Timer */}
                  <div className="flex justify-between items-center mb-10">
                      {/* Left: Level Badge */}
                      <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-full border-4 border-[#E2E8F0] shadow-sm">
                         <div className="w-10 h-10 bg-[#5AAFD1] rounded-full flex items-center justify-center text-white font-black text-xl border-2 border-white shadow-sm">{currentLevel?.id}</div>

                         <div className="text-left font-black uppercase">
                            <p className="text-[9px] text-[#A0AEC0] tracking-widest leading-none mb-0.5">Kelancaran</p>
                            <h4 className="text-sm text-[#333333]">{currentLevel.title}</h4>
                         </div>
                      </div>

                      {/* Center: Star Counter (Read Along style) */}
                      {isReading && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#FFF8E1] to-[#FFFDE7] px-5 py-2 rounded-full border-2 border-[#FFD54F] shadow-sm">
                          <span className="material-symbols-rounded text-[#FFB300] text-2xl" style={{
                            animation: matchedIndices.length > 0 ? 'pulse 0.3s ease-in-out' : 'none'
                          }}>star</span>
                          <span className="font-black text-xl text-[#F57F17]">{matchedIndices.length}</span>
                          <span className="text-xs text-[#A0AEC0] font-bold">/ {currentLevel?.text?.split(" ").length || 0}</span>
                        </div>
                      )}

                      {/* Right: Actions & Timer Group */}
                      <div className="flex items-center gap-4">
                         {!isReading ? (
                            <button 
                              onClick={startFluencyReading} 
                              className="btn-bubbly rounded-full px-8 py-3 bg-[#5AAFD1] flex items-center gap-2 shadow-[0_4px_0_#4691B0] text-base"
                            >
                              Mulai Membaca <span className="material-symbols-rounded text-xl">mic</span>
                            </button>
                         ) : (
                            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-1.5 rounded-full border-2 border-[#E2E8F0]">
                               {/* Mic Indicator - reflects actual audio capture state */}
                               <div className="relative w-10 h-10 flex items-center justify-center">
                                 {isMicActive && <div className="absolute inset-0 rounded-full bg-[#5AAFD1] opacity-20 animate-ping"></div>}
                                 <div className={`relative w-8 h-8 rounded-full border-2 shadow-sm flex items-center justify-center z-10 transition-colors ${isMicActive ? 'bg-[#5AAFD1] border-[#4691B0]' : 'bg-[#FFB347] border-[#E69A2E]'}`}>
                                   <span className="material-symbols-rounded text-white text-base">{isMicActive ? 'mic' : 'mic_off'}</span>
                                 </div>
                               </div>

                               <button 
                                 onClick={stopFluencyReading} 
                                 className="btn-bubbly rounded-full px-8 py-3 !bg-[#34D399] !shadow-[0_4px_0_#059669] flex items-center gap-2 text-base"
                               >
                                 Selesai <span className="material-symbols-rounded text-xl">check_circle</span>
                               </button>
                            </div>
                         )}

                         <div className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-2xl border-4 transition-all ${timeLeft < 10 ? 'bg-[#FF4757] border-[#D63031] text-white animate-bounce' : 'bg-white border-[#E2E8F0] text-[#5AAFD1]'}`}>
                            <span className="material-symbols-rounded text-2xl">timer</span>{timeLeft}s
                         </div>
                      </div>
                   </div>
                  
                  <div className="grid md:grid-cols-12 gap-10 items-center">
                      <div className="md:col-span-4 relative aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-md bg-[#F8FAFC]">
                        {currentLevel?.image && <Image src={currentLevel.image} alt="Illust" fill className="object-cover" unoptimized />}
                        
                        {/* Encouragement Overlay (Read Along's Diya-style feedback) */}
                        {isReading && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                            <p className="text-white text-center font-bold text-sm animate-pulse">
                              {matchedIndices.length === 0 && "🎤 Ayo mulai membaca..."}
                              {matchedIndices.length > 0 && matchedIndices.length < Math.floor((currentLevel?.text?.split(" ").length || 1) * 0.3) && "👏 Bagus, terus membaca!"}
                              {matchedIndices.length >= Math.floor((currentLevel?.text?.split(" ").length || 1) * 0.3) && matchedIndices.length < Math.floor((currentLevel?.text?.split(" ").length || 1) * 0.7) && "⭐ Hebat! Kamu sudah setengah jalan!"}
                              {matchedIndices.length >= Math.floor((currentLevel?.text?.split(" ").length || 1) * 0.7) && matchedIndices.length < (currentLevel?.text?.split(" ").length || 1) && "🌟 Luar biasa! Sedikit lagi!"}
                              {matchedIndices.length >= (currentLevel?.text?.split(" ").length || 1) && "🏆 Sempurna! Semua kata terbaca!"}
                            </p>
                          </div>
                        )}
                      </div>
                     <div className="md:col-span-8">
                        <p className="text-2xl md:text-[32px] font-bold leading-[1.8] flex flex-wrap gap-x-3 gap-y-4">
                           {currentLevel?.text.split(" ").map((w: string, i: number) => {
                              const match = matchedIndices.includes(i);
                              // Find the "next expected" word (first unmatched)
                              const nextExpected = currentLevel.text.split(" ").findIndex((_: string, idx: number) => !matchedIndices.includes(idx));
                              const isNext = i === nextExpected && isReading && !match;
                              
                              return (
                                <span 
                                  key={i} 
                                  className={`relative transition-all duration-200 ${
                                    match 
                                      ? 'text-[#1E88E5] scale-105' // Blue for correct (Read Along style)
                                      : isNext 
                                        ? 'text-[#FFB300] underline decoration-wavy decoration-[#FFD54F]' // Yellow underline for next expected word
                                        : 'text-[#333333]'
                                  }`}
                                  style={match ? { animation: 'bounceIn 0.3s ease-out' } : undefined}
                                >
                                  {w}
                                  {match && (
                                    <>
                                      <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#1E88E5] rounded-full"></span>
                                      <span className="absolute -top-2 -right-1 text-xs" style={{ animation: 'fadeInUp 0.4s ease-out' }}>⭐</span>
                                    </>
                                  )}
                                </span>
                              );
                           })}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* 3. Intermission */}
         {step === "fluency_intermission" && (
            <div className="animate-bounce-in max-w-6xl mx-auto mt-10 text-center">
               <div className="card-bubbly bg-[#F0F8FF] p-12 border-[#5AAFD1] shadow-[0_30px_60px_rgba(90,175,209,0.15)]">
                  <h2 className="text-4xl font-black text-[#5AAFD1] mb-4">Luar Biasa! 🎉</h2>
                  <p className="text-xl font-bold text-[#666666] mb-8">Kamu sangat lancar di Level {currentLevel?.id}! <br/> Siap untuk tantangan yang lebih tinggi?</p>
                  <button onClick={nextFluencyLevel} className="btn-bubbly rounded-full px-10 py-4 text-lg bg-[#5AAFD1] mx-auto flex items-center gap-2 shadow-[0_6px_0_#4691B0]">LANJUT KE LEVEL {selectedLevels[currentLevelIdx+1]?.id} <span className="material-symbols-rounded">trending_up</span></button>
               </div>
            </div>
         )}

         {/* 4. Decision Transition */}
         {step === "decision" && (
            <div className="animate-bounce-in max-w-6xl mx-auto mt-10 text-center">
               <div className="card-bubbly bg-[#E0F2FE] p-12 border-[#5AAFD1] shadow-[0_30px_60px_rgba(90,175,209,0.15)]">
                  <h2 className="text-4xl font-black text-[#5AAFD1] mb-4">Kamu Hebat! 🏆</h2>
                  <p className="text-xl font-bold text-[#666666] mb-8">Kelancaran membacamu sudah di level {currentLevel?.id}. Sekarang, ayo kita uji pemahamanmu dengan satu cerita menarik!</p>

                  <button onClick={startComprehension} className="btn-bubbly rounded-full px-10 py-4 text-lg bg-[#5AAFD1] mx-auto flex items-center gap-2 shadow-[0_6px_0_#4691B0]">Lanjut ke Tes Pemahaman <span className="material-symbols-rounded text-2xl">psychology</span></button>
               </div>
            </div>
         )}

         {/* 5. Comprehension Reading & Test */}
         {step === "comp_reading" && (
            <div className="animate-bounce-in max-w-6xl mx-auto">
               <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-3 bg-white border-4 border-[#E2E8F0] px-6 py-2.5 rounded-full shadow-sm mb-4">
                     <span className="material-symbols-rounded text-2xl" style={{color: currentStory?.color}}>{currentStory?.icon}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#666666]">{currentStory?.theme}</span>
                  </div>
                  <h2 className="text-4xl font-black uppercase text-[#333333]">{currentStory?.title}</h2>
               </div>

               <div className="card-bubbly p-8 md:p-12 mb-10 bg-white">
                  <div className="grid md:grid-cols-12 gap-8 items-center">
                     <div className="md:col-span-5 relative aspect-[4/3] rounded-3xl overflow-hidden border-4 border-[#E2E8F0]">
                        {currentStory?.image && <Image src={currentStory.image} alt="Story" fill className="object-cover" unoptimized />}
                     </div>
                     <div className="md:col-span-7 h-64 overflow-y-auto pr-4 custom-scroll text-lg font-medium leading-[1.8]" style={{textIndent: '2em'}}>
                        {currentStory?.text}
                     </div>
                  </div>
               </div>

               {!showQuestions ? (
                  <div className="flex justify-center"><button onClick={() => setShowQuestions(true)} className="btn-bubbly-secondary px-10 py-4 bg-white !text-[#5AAFD1] border-4 border-[#E2E8F0] hover:border-[#87CEEB] shadow-[0_6px_0_#E2E8F0]">Munculkan Pertanyaan <span className="material-symbols-rounded">expand_more</span></button></div>
               ) : (
                  <div className="card-bubbly p-10 bg-white animate-fade-in-up">
                     <div className="flex items-center justify-between mb-8 border-b-2 border-[#F0F8FF] pb-4">
                        <span className="text-xs font-black uppercase tracking-widest text-[#A0AEC0]">Pertanyaan {currentQuestionIdx+1} / {currentStory?.questions.length}</span>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black" style={{backgroundColor: currentStory?.color}}>{currentQuestionIdx+1}</div>
                     </div>
                     
                     <h4 className="text-2xl font-black mb-10">{currentStory?.questions[currentQuestionIdx].question}</h4>
                     
                     {currentStory.questions[currentQuestionIdx].type === 'mc' && (
                        <div className="grid sm:grid-cols-2 gap-4">
                           {currentStory.questions[currentQuestionIdx].options?.map((opt: string, i: number) => (
                              <button key={i} onClick={() => { const n = [...compAnswers]; n[currentQuestionIdx] = i; setCompAnswers(n); }} className={`p-4 rounded-2xl border-4 font-bold text-left transition-all ${compAnswers[currentQuestionIdx] === i ? 'bg-[#87CEEB] border-[#87CEEB] text-white' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#666666] hover:bg-white'}`}>{opt}</button>
                           ))}
                        </div>
                     )}

                     {currentStory.questions[currentQuestionIdx].type === 'cmc' && (
                        <div className="grid sm:grid-cols-2 gap-4">
                           {currentStory.questions[currentQuestionIdx].options?.map((opt: string, i: number) => {
                              const sel = compAnswers[currentQuestionIdx].includes(i);
                              return <button key={i} onClick={() => { 
                                 const n = [...compAnswers]; 
                                 if (sel) n[currentQuestionIdx] = n[currentQuestionIdx].filter((x: any) => x !== i);
                                 else n[currentQuestionIdx] = [...n[currentQuestionIdx], i].sort();
                                 setCompAnswers(n);
                              }} className={`p-4 rounded-2xl border-4 font-bold text-left transition-all ${sel ? 'bg-[#34D399] border-[#34D399] text-white' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#666666] hover:bg-white'}`}>{opt}</button>
                           })}
                        </div>
                     )}

                     {currentStory.questions[currentQuestionIdx].type === 'essay' && (
                        <div className="flex flex-col gap-4">
                           <textarea className="w-full h-32 p-4 border-4 border-[#F0F8FF] rounded-2xl outline-none focus:border-[#87CEEB] text-lg font-bold" placeholder="Tulis jawabanmu..." value={compAnswers[currentQuestionIdx]} onChange={(e) => { const n = [...compAnswers]; n[currentQuestionIdx] = e.target.value; setCompAnswers(n); }} disabled={!!essayResults[currentQuestionIdx] || isGrading}></textarea>
                           {!essayResults[currentQuestionIdx] ? (
                              <button onClick={handleGradeEssay} disabled={isGrading || compAnswers[currentQuestionIdx].length < 3} className="self-end px-8 py-3 bg-[#5AAFD1] text-white rounded-full font-black uppercase tracking-widest text-sm shadow-[0_4px_0_#3894B7]">{isGrading ? "Mengoreksi..." : "Cek Jawaban AI"}</button>
                           ) : (
                              <div className="p-4 bg-[#F0F9FF] border-2 border-[#87CEEB] rounded-2xl text-sm font-bold text-[#5AAFD1] animate-bounce-in">{essayResults[currentQuestionIdx].feedback}</div>
                           )}
                        </div>
                     )}

                     <div className="mt-12 flex justify-between">
                        <button onClick={() => setCurrentQuestionIdx(v => Math.max(0, v-1))} disabled={currentQuestionIdx === 0} className="px-6 py-2 text-[#A0AEC0] font-bold uppercase text-xs">Kembali</button>
                        {currentQuestionIdx < (currentStory?.questions.length || 0) - 1 ? (
                           <button onClick={() => setCurrentQuestionIdx(v => v+1)} disabled={compAnswers[currentQuestionIdx] === null || (currentStory?.questions[currentQuestionIdx].type === 'essay' && !essayResults[currentQuestionIdx])} className="px-8 py-3 bg-[#333333] text-white rounded-xl font-black text-sm uppercase">Soal Berikutnya</button>
                        ) : (
                           <button onClick={finishComprehension} disabled={!essayResults[currentQuestionIdx] && currentStory?.questions[currentQuestionIdx].type === 'essay'} className="px-10 py-4 bg-[#5AAFD1] text-white rounded-xl font-black uppercase text-sm shadow-[0_6px_0_#4691B0]">Lihat Hasil Akhir!</button>
                        )}
                     </div>
                  </div>
               )}
            </div>
         )}

         {/* 6. Comprehensive Pedagogical Result Step */}
         {step === "result" && (
            <div className="animate-bounce-in max-w-6xl mx-auto">
               <div className="card-bubbly p-10 md:p-16 border-[#E2E8F0] bg-white relative overflow-hidden">
                  
                  {/* Result Header with Custom Symbol */}
                  <div className="flex flex-col md:flex-row items-center gap-12 mb-16 relative z-10 border-b-4 border-[#F0F8FF] pb-12">
                     <div 
                        className="w-48 h-48 flex items-center justify-center text-5xl font-black shadow-2xl border-8 border-white transform relative shrink-0"
                        style={{
                           backgroundColor: finalLevelData.color,
                           color: finalLevelData.id === 'E' ? '#333333' : '#FFFFFF',
                           clipPath: finalLevelData.id === 'A' 
                              ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' 
                              : finalLevelData.id === 'D'
                              ? 'polygon(50% 0%, 0% 100%, 100% 100%)' 
                              : 'none',
                           borderRadius: (finalLevelData.id.startsWith('B') || finalLevelData.id === 'C') 
                              ? '50%' 
                              : finalLevelData.id === 'E' ? '20px' : '0'
                        }}
                     >
                        <span className={finalLevelData.id === 'D' ? 'mt-8' : ''}>{finalLevelData.id}</span>
                     </div>
                     <div className="text-center md:text-left flex-1 relative group/title">
                        <div className="inline-block px-4 py-1.5 bg-[#F0F8FF] rounded-full text-[#5AAFD1] text-xs font-black uppercase tracking-widest mb-4">Profil Diagnostik BABE JAKA</div>
                        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4">
                           <h2 className="text-5xl md:text-7xl font-black text-[#333333] uppercase tracking-tighter leading-none shrink-0">{finalLevelData.name}</h2>
                        </div>
                         <p className="text-2xl font-bold text-[#666666] leading-relaxed">Selamat {profile.name}! Kemampuan membacamu selaras dengan karakteristik <span className="text-[#5AAFD1] font-black">Jenjang {finalLevelData.id}</span>.</p>
                         
                         <div className="mt-6 flex flex-wrap gap-4">
                            <button 
                               onClick={handleDownloadCertificate}
                               disabled={isGeneratingPDF}
                               className={`px-6 py-3 bg-[#5AAFD1] text-white rounded-full font-black flex items-center gap-2 shadow-[0_4px_0_#4691B0] hover:-translate-y-0.5 transition-all active:translate-y-1 ${isGeneratingPDF ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                               {isGeneratingPDF ? (
                                  <>PROSES... <span className="animate-spin material-symbols-rounded">sync</span></>
                               ) : (
                                  <>UNDUH LAPORAN DIAGNOSIS <span className="material-symbols-rounded">download</span></>
                               )}
                            </button>
                         </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative z-10">
                     <div className="bg-[#F8FAFC] p-8 rounded-[40px] border-4 border-[#E2E8F0] shadow-sm text-center">
                        <p className="text-[10px] font-black text-[#A0AEC0] uppercase mb-4 tracking-widest">Akurasi Kelancaran</p>
                        <p className="text-5xl font-black text-[#34D399] tracking-tighter">{finalFluency.accuracy}%</p>
                     </div>
                     <div className="bg-[#F8FAFC] p-8 rounded-[40px] border-4 border-[#E2E8F0] shadow-sm text-center">
                        <p className="text-[10px] font-black text-[#A0AEC0] uppercase mb-4 tracking-widest">Kecepatan (WPM)</p>
                        <p className="text-5xl font-black text-[#87CEEB] tracking-tighter">{finalFluency.wpm}</p>
                     </div>
                     <div className="bg-[#F0F8FF] p-8 rounded-[40px] border-4 border-[#E2E8F0] shadow-sm text-center">
                        <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest mb-4">Skor Pemahaman</p>
                        <p className="text-5xl font-black text-[#5AAFD1] tracking-tighter">{compScore !== null ? compScore : '-'}</p>
                     </div>
                  </div>

                   <div className="mb-20 relative z-10">
                      <h3 className="text-2xl font-black text-[#333333] mb-8 flex items-center gap-3"><span className="material-symbols-rounded text-3xl text-[#5AAFD1]">analytics</span> Laporan Komprehensif:</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                         {/* Left: Understanding Breakdown */}
                         <div className="lg:col-span-7 flex flex-col gap-6">
                            <div className="card-bubbly bg-[#F8FAFC] border-[#E2E8F0] p-8">
                               <h4 className="text-sm font-black uppercase tracking-widest text-[#666666] mb-8 flex items-center gap-2">
                                  <span className="material-symbols-rounded text-[#5AAFD1]">psychology</span> Analisis Pemahaman
                               </h4>
                               
                               <div className="space-y-8">
                                  {[
                                     { label: 'Pemahaman Literal', val: barrettMastery.literal, icon: 'list_alt', desc: 'Mengenali fakta tersurat dalam teks.', color: '#34D399' },
                                     { label: 'Reorganisasi', val: barrettMastery.reorganization, icon: 'account_tree', desc: 'Mengolah & menyusun ulang informasi.', color: '#87CEEB' },
                                     { label: 'Pemahaman Inferensial', val: barrettMastery.inferential, icon: 'tips_and_updates', desc: 'Menarik kesimpulan dari bacaan.', color: '#A78BFA' },
                                     { label: 'Pemahaman Evaluatif', val: barrettMastery.evaluative, icon: 'gavel', desc: 'Menilai & memberikan argumen kritis.', color: '#F472B6' }
                                  ].map((item, idx) => (
                                     <div key={idx} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                           <div className="flex items-center gap-2">
                                              <span className="material-symbols-rounded text-lg" style={{color: item.color}}>{item.icon}</span>
                                              <div>
                                                 <span className="text-xs font-black uppercase text-[#333333] tracking-wide">{item.label}</span>
                                                 <p className="text-[10px] font-bold text-[#A0AEC0]">{item.desc}</p>
                                              </div>
                                           </div>
                                           <span className="text-sm font-black" style={{color: item.color}}>{item.val}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-white border-2 border-[#F1F5F9] rounded-full overflow-hidden">
                                           <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${item.val}%`, backgroundColor: item.color }}></div>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         </div>
 
                         {/* Right: Fluency Indicators */}
                         <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="card-bubbly bg-[#F8FAFC] border-[#E2E8F0] p-8 h-full">
                               <h4 className="text-sm font-black uppercase tracking-widest text-[#666666] mb-8 flex items-center gap-2">
                                  <span className="material-symbols-rounded text-[#5AAFD1]">speed</span> Profil Kelancaran (1-16)
                               </h4>

                              <div className="flex flex-col gap-4">
                                 {[
                                    { label: 'Ketepatan', score: fluencyRubric?.accuracy, icon: 'spellcheck' },
                                    { label: 'Kecepatan', score: fluencyRubric?.rate, icon: 'timer' },
                                    { label: 'Kelancaran', score: fluencyRubric?.automaticity, icon: 'bolt' },
                                    { label: 'Intonasi', score: fluencyRubric?.prosody, icon: 'campaign' }
                                 ].map((row, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-2xl border-2 border-[#F1F5F9] group hover:border-[#5AAFD1]/30 transition-all">
                                       <div className="flex items-center gap-3">
                                          <span className="material-symbols-rounded text-[#5AAFD1]">{row.icon}</span>
                                          <span className="text-xs font-black uppercase text-[#666666] tracking-widest">{row.label}</span>
                                       </div>
                                       <div className="flex gap-1">
                                          {[1, 2, 3, 4].map(star => (
                                             <div key={star} className={`w-3 h-3 rounded-full ${star <= (row.score || 0) ? 'bg-[#5AAFD1]' : 'bg-[#E2E8F0]'}`}></div>
                                          ))}
                                       </div>
                                    </div>
                                 ))}

                                 <div className="mt-6 pt-6 border-t-2 border-[#F1F5F9] text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#A0AEC0] mb-2">Peringkat Akhir</p>
                                    <div className="inline-block px-6 py-2 rounded-full bg-[#F0F8FF] text-[#5AAFD1] font-black uppercase tracking-tighter text-2xl border-2 border-[#E0F2FE]">
                                       {fluencyRubric?.label}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="mb-20 relative z-10">
                     <h3 className="text-2xl font-black text-[#333333] mb-8 flex items-center gap-3"><span className="material-symbols-rounded text-3xl text-[#5AAFD1]">dashboard_customize</span> Karakteristik Jenjangmu:</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="card-bubbly !bg-[#F0F9FF] !border-[#E0F2FE] p-8">
                           <div className="flex items-center gap-3 mb-4 text-[#5AAFD1]">
                              <span className="material-symbols-rounded">psychology</span>
                              <h4 className="font-black uppercase tracking-widest text-sm">Kemampuan & Usia</h4>
                           </div>
                           <p className="text-[#666666] font-bold mb-4">Target Usia: <span className="text-[#333333]">{finalLevelData.age}</span></p>
                           <p className="text-[#333333] font-medium leading-relaxed">{finalLevelData.ability}</p>
                        </div>
                        <div className="card-bubbly !bg-[#FDF2F2] !border-[#FEE2E2] p-8">
                           <div className="flex items-center gap-3 mb-4 text-[#FF4757]">
                              <span className="material-symbols-rounded">menu_book</span>
                              <h4 className="font-black uppercase tracking-widest text-sm">Bahasa & Konten</h4>
                           </div>
                           <p className="text-[#333333] font-medium leading-relaxed mb-4">{finalLevelData.language}</p>
                           <p className="text-[#333333] font-medium leading-relaxed italic border-l-4 border-[#FF4757]/20 pl-4">{finalLevelData.content}</p>
                        </div>
                        <div className="card-bubbly !bg-[#F0FDF4] !border-[#DCFCE7] p-8">
                           <div className="flex items-center gap-3 mb-4 text-[#22C55E]">
                              <span className="material-symbols-rounded">palette</span>
                              <h4 className="font-black uppercase tracking-widest text-sm">Rekomendasi Visual</h4>
                           </div>
                           <p className="text-[#333333] font-medium leading-relaxed">{finalLevelData.visual}</p>
                        </div>
                        <div className="card-bubbly !bg-[#F0F8FF] !border-[#E0F2FE] p-8">
                           <div className="flex items-center gap-3 mb-4 text-[#5AAFD1]">
                              <span className="material-symbols-rounded">tips_and_updates</span>
                              <h4 className="font-black uppercase tracking-widest text-sm">Saran Peningkatan</h4>
                           </div>
                           <p className="text-[#333333] font-bold italic leading-relaxed">"{smartAdvice}"</p>
                        </div>
                     </div>
                  </div>

                  {recommendations.length > 0 && (
                    <div className="relative z-10">
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                          <h3 className="text-2xl font-black text-[#333333] flex items-center gap-3"><span className="material-symbols-rounded text-3xl text-[#FFB347]">auto_stories</span> Rekomendasi Bacaan Untukmu:</h3>
                          <Link href="/explore/library" className="px-5 py-2 rounded-xl bg-white border-2 border-[#E2E8F0] text-[#5AAFD1] font-black text-[10px] uppercase tracking-widest hover:bg-[#F0F8FF] transition-all self-start">Lihat Semua Koleksi</Link>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {recommendations.map(book => (
                             <Link 
                              key={book.id} 
                              href={`/explore/read/${book.id}`} 
                              className="group flex flex-col relative overflow-hidden h-[280px] rounded-[28px] border-4 border-[#E2E8F0] shadow-sm transform transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_20px_rgba(0,0,0,0.1)] p-0 bg-white"
                             >
                                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                                  <div 
                                    className={`w-9 h-9 flex items-center justify-center text-[10px] font-black shadow-lg border-2 border-white transform group-hover:scale-110 transition-transform ${
                                      book.level.includes('Dini') ? 'bg-[#FF4757] text-white' : 
                                      book.level.includes('Awal') ? 'bg-[#8E44AD] text-white rounded-full' : 
                                      book.level.includes('Semenjana') ? 'bg-[#1E3A8A] text-white rounded-full' : 
                                      book.level.includes('Madya') ? 'bg-[#22C55E] text-white' : 
                                      'bg-[#FACC15] text-[#333333] rounded-sm' 
                                    }`}
                                    style={{
                                      clipPath: book.level.includes('Dini') 
                                        ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' 
                                        : book.level.includes('Madya')
                                        ? 'polygon(50% 0%, 0% 100%, 100% 100%)' 
                                        : 'none'
                                    }}
                                  >
                                    <span className={book.level.includes('Madya') ? 'mt-2' : ''}>
                                      {book.level.includes('Dini') ? 'A' : 
                                       book.level.includes('B-1') ? 'B1' : 
                                       book.level.includes('B-2') ? 'B2' : 
                                       book.level.includes('B-3') ? 'B3' : 
                                       book.level.includes('Awal') ? 'B' : 
                                       book.level.includes('Semenjana') ? 'C' : 
                                       book.level.includes('Madya') ? 'D' : 
                                       'E'}
                                    </span>
                                  </div>
                                </div>
  
                                <div className="absolute inset-0 bg-white">
                                  <Image src={book.cover} alt={book.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                                </div>
  
                                <div className="absolute left-0 right-0 p-2 pb-3 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-20 -bottom-[50px] group-hover:bottom-0">
                                  <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t-4 border-[#E2E8F0]">
                                    <h3 className="text-[12px] font-black text-[#333333] leading-tight mb-2 line-clamp-2">{book.title}</h3>
                                    <div className="flex items-center gap-2">
                                      <span className="border-2 border-[#6C3483] px-2 py-0.5 rounded-full text-[8px] font-black text-[#6C3483] shadow-sm flex items-center">
                                        <span className="text-[10px] mr-1">📚</span>{book.level}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none"></div>
                             </Link>
                          ))}
                       </div>
                    </div>
                  )}

                  <div className="mt-20 flex flex-col md:flex-row justify-center items-center gap-6">
                     <button 
                        onClick={() => window.location.reload()} 
                        className="w-full md:w-auto px-10 py-5 bg-white text-[#87CEEB] border-4 border-[#87CEEB] rounded-full font-black text-xl hover:bg-[#F0F8FF] transition-all flex items-center justify-center gap-3 shadow-[0_6px_0_#5AAFD1]"
                     >
                        DIAGNOSIS ULANG <span className="material-symbols-rounded text-2xl">refresh</span>
                     </button>
                     <Link 
                        href="/explore/library" 
                        className="w-full md:w-auto px-10 py-5 bg-[#FFB347] text-white border-4 border-[#E69A2E] rounded-full font-black text-xl hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center gap-3 shadow-[0_6px_0_#CC8400]"
                     >
                        KEMBALI KE PERPUSTAKAAN <span className="material-symbols-rounded text-2xl font-bold">celebration</span>
                     </Link>
                  </div>
               </div>
            </div>
         )}
      </main>

      {step === "result" && (
         <ReportTemplate 
           ref={certificateRef}
           profileName={profile.name}
           levelData={finalLevelData}
           fluencyData={finalFluency}
           compScore={compScore}
           fluencyRubric={fluencyRubric}
           barrettMastery={barrettMastery}
           smartAdvice={smartAdvice}
         />
       )}
    </div>
  );
}
