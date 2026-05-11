"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Trophy, Target, Star, Maximize, Minimize } from "lucide-react";
import { useProfile } from "@/lib/profile-context";
import { StarFly } from "@/components/StarFly";

// --- Game Data ---
const QUESTIONS = [
  // Bagian 1: Sejarah Jakarta
  {
    id: 1,
    soal: "Sebelum diubah namanya menjadi Jayakarta oleh Fatahillah pada tahun 1527, Jakarta dikenal dengan nama...",
    pilihan: ["Batavia", "Tarumanegara", "Sunda Kelapa", "Banten Girang"],
    jawabanBenar: 2
  },
  {
    id: 2,
    soal: "Tanggal berapakah yang diperingati sebagai Hari Ulang Tahun (HUT) Kota Jakarta?",
    pilihan: ["17 Agustus", "22 Juni", "1 Juni", "20 Mei"],
    jawabanBenar: 1
  },
  {
    id: 3,
    soal: "Pada masa penjajahan kolonial Belanda, nama Jakarta diubah menjadi...",
    pilihan: ["Buitenzorg", "Batavia", "Kutaraja", "Fort de Kock"],
    jawabanBenar: 1
  },
  {
    id: 4,
    soal: "Pada masa pendudukan Jepang di Indonesia, nama Batavia diganti menjadi...",
    pilihan: ["Jakarta Tokubetsu Shi", "Edo", "Syonan-to", "Batavia Shimbun"],
    jawabanBenar: 0
  },
  {
    id: 5,
    soal: "Siapakah pahlawan nasional dari Betawi yang namanya diabadikan menjadi salah satu jalan protokol terpanjang dan pusat bisnis di Jakarta?",
    pilihan: ["Ismail Marzuki", "Benyamin Sueb", "Mohammad Husni Thamrin", "Chairil Anwar"],
    jawabanBenar: 2
  },
  {
    id: 6,
    soal: "Rapat Raksasa yang dihadiri oleh Presiden Soekarno pada 19 September 1945 untuk mempertahankan kemerdekaan diadakan di...",
    pilihan: ["Lapangan Banteng", "Lapangan Ikada (kini kawasan Monas)", "Tugu Proklamasi", "Istana Negara"],
    jawabanBenar: 1
  },
  {
    id: 7,
    soal: "Gubernur DKI Jakarta yang dijuluki \"Bang Ali\" dan dikenal banyak membangun fasilitas modern, serta mencetuskan Pekan Raya Jakarta (PRJ) adalah...",
    pilihan: ["Tjokropranolo", "Sutiyoso", "Ali Sadikin", "Wiyogo Atmodarminto"],
    jawabanBenar: 2
  },
  {
    id: 8,
    soal: "Pelabuhan bersejarah di Jakarta Utara yang sudah ada sejak zaman Kerajaan Hindu Tarumanegara adalah...",
    pilihan: ["Pelabuhan Tanjung Priok", "Pelabuhan Merak", "Pelabuhan Sunda Kelapa", "Pelabuhan Muara Angke"],
    jawabanBenar: 2
  },
  {
    id: 9,
    soal: "Monumen Nasional (Monas) memiliki mahkota berupa lidah api kemerdekaan yang dilapisi oleh emas murni. Berapa berat total emas tersebut saat ini?",
    pilihan: ["20 kg", "35 kg", "50 kg", "75 kg"],
    jawabanBenar: 2
  },
  {
    id: 10,
    soal: "Siapakah tokoh yang memimpin penaklukan Sunda Kelapa dan mengganti namanya menjadi Jayakarta?",
    pilihan: ["Raden Patah", "Fatahillah", "Sultan Ageng Tirtayasa", "Sultan Hasanuddin"],
    jawabanBenar: 1
  },
  // Bagian 2: Seni dan Budaya Betawi
  {
    id: 11,
    soal: "Boneka raksasa khas Betawi yang biasanya diarak dalam pesta rakyat dan dipercaya dapat menolak bala disebut...",
    pilihan: ["Barong", "Ondel-ondel", "Sigale-gale", "Wayang Golek"],
    jawabanBenar: 1
  },
  {
    id: 12,
    soal: "Kesenian teater tradisional Betawi yang sering membawakan cerita komedi dan diiringi musik Gambang Kromong adalah...",
    pilihan: ["Ketoprak", "Ludruk", "Lenong", "Randai"],
    jawabanBenar: 2
  },
  {
    id: 13,
    soal: "Alat musik tradisional Betawi berbentuk seperti biola yang dimainkan dengan cara digesek dan mendapat pengaruh kuat dari budaya Tionghoa adalah...",
    pilihan: ["Tehyan", "Rebab", "Tarawangsa", "Sampe"],
    jawabanBenar: 0
  },
  {
    id: 14,
    soal: "Kesenian musik tiup khas Betawi yang mendapat pengaruh dari budaya Eropa (Portugis dan Belanda) dan sering dimainkan untuk mengarak pengantin adalah...",
    pilihan: ["Tanjidor", "Marawis", "Qasidah", "Keroncong"],
    jawabanBenar: 0
  },
  {
    id: 15,
    soal: "Tradisi berbalas pantun dan adu silat dalam upacara penyambutan pengantin pria pada pernikahan adat Betawi disebut...",
    pilihan: ["Buka Pintu", "Palang Pintu", "Seserahan", "Ngarak Pengantin"],
    jawabanBenar: 1
  },
  {
    id: 16,
    soal: "Nama rumah adat tradisional suku Betawi yang memiliki atap berbentuk pelana lipat adalah...",
    pilihan: ["Rumah Joglo", "Rumah Gadang", "Rumah Kebaya", "Rumah Limasan"],
    jawabanBenar: 2
  },
  {
    id: 17,
    soal: "Ornamen kayu berbentuk segitiga berjajar yang melambangkan kejujuran dan kerja keras, biasanya terdapat di pinggiran atap (lisplang) rumah adat Betawi disebut...",
    pilihan: ["Gigi Balang", "Pucuk Rebung", "Langit-langit", "Tumpal"],
    jawabanBenar: 0
  },
  {
    id: 18,
    soal: "Kain khas peninggalan budaya Betawi yang biasa dikalungkan di leher oleh kaum pria, baik saat shalat maupun berlatih silat, disebut...",
    pilihan: ["Selendang", "Sarung", "Cukin", "Ulos"],
    jawabanBenar: 2
  },
  {
    id: 19,
    soal: "Tarian tradisional Betawi yang sangat dinamis dan sering digunakan untuk menyambut tamu kehormatan atau membuka acara adalah...",
    pilihan: ["Tari Jaipong", "Tari Sirih Kuning", "Tari Piring", "Tari Kecak"],
    jawabanBenar: 1
  },
  {
    id: 20,
    soal: "Pakaian adat khas pria Betawi sehari-hari yang terdiri dari kemeja tanpa kerah dan celana komprang disebut...",
    pilihan: ["Baju Sadariah / Tikim", "Baju Surjan", "Baju Bodo", "Baju Pangsi"],
    jawabanBenar: 0
  },
  // Bagian 3: Kuliner Khas Betawi
  {
    id: 21,
    soal: "Makanan khas Betawi yang terbuat dari beras ketan, telur (ayam/bebek), ebi, dan kelapa sangrai, dimasak di atas wajan tanpa minyak adalah...",
    pilihan: ["Nasi Ulam", "Ketoprak", "Kerak Telor", "Kue Rangi"],
    jawabanBenar: 2
  },
  {
    id: 22,
    soal: "Minuman penyegar khas Betawi yang terbuat dari jahe, daun serai, dan kayu secang (memberi warna merah), serta tidak mengandung alkohol sama sekali adalah...",
    pilihan: ["Tuak", "Bir Pletok", "Bandrek", "Bajigur"],
    jawabanBenar: 1
  },
  {
    id: 23,
    soal: "Roti manis khas Betawi yang selalu ada dalam seserahan pernikahan adat dan melambangkan kesetiaan abadi adalah...",
    pilihan: ["Roti Gambang", "Roti Buaya", "Roti Sisir", "Roti Kadet"],
    jawabanBenar: 1
  },
  {
    id: 24,
    soal: "Hidangan sup berkuah gurih khas Jakarta yang menggunakan daging atau jeroan sapi, dengan kuah campuran santan dan susu adalah...",
    pilihan: ["Soto Tangkar", "Soto Betawi", "Soto Mie", "Empal Gentong"],
    jawabanBenar: 1
  },
  {
    id: 25,
    soal: "Sayur khas Betawi yang memiliki kuah hitam pekat karena menggunakan kluwek, disajikan dengan ikan air tawar, adalah...",
    pilihan: ["Gabus Pucung", "Sayur Babanci", "Pindang Bandeng", "Pecak Lele"],
    jawabanBenar: 0
  },
  {
    id: 26,
    soal: "Kue kering tradisional Betawi yang renyah dan digoreng menggunakan cetakan berbentuk bunga dinamakan...",
    pilihan: ["Kue Cucur", "Kue Kembang Goyang", "Kue Akar Kelapa", "Kue Semprong"],
    jawabanBenar: 1
  },
  {
    id: 27,
    soal: "Minuman atau pencuci mulut khas Betawi yang terbuat dari adonan tepung beras dan sagu aren berlapis warna (merah, putih, hijau), disajikan dengan kuah santan dan gula merah adalah...",
    pilihan: ["Es Doger", "Es Podeng", "Es Selendang Mayang", "Es Pisang Ijo"],
    jawabanBenar: 2
  },
  {
    id: 28,
    soal: "Hidangan sayur langka khas Betawi yang namanya mengandung kata \"sayur\" namun sebenarnya tidak menggunakan sayuran sama sekali, melainkan daging sapi/kelapa muda dan belimbing wuluh adalah...",
    pilihan: ["Sayur Besan", "Sayur Babanci", "Sayur Godog", "Sayur Lodeh"],
    jawabanBenar: 1
  },
  {
    id: 29,
    soal: "Asinan khas Jakarta yang terdiri dari sawi, kol, tauge, tahu, dan kerupuk mi kuning yang disiram kuah kacang bercampur cuka disebut...",
    pilihan: ["Asinan Bogor", "Asinan Betawi", "Rujak Juhi", "Ketoprak"],
    jawabanBenar: 1
  },
  {
    id: 30,
    soal: "Makanan percampuran budaya Betawi dan Tionghoa yang terbuat dari irisan daging dan moncong sapi, disajikan dengan kangkung, juhi, dan disiram bumbu kacang kemerahan adalah...",
    pilihan: ["Rujak Cingur", "Rujak Shanghai", "Gado-gado", "Toge Goreng"],
    jawabanBenar: 1
  },
  // Bagian 4: Landmark dan Tata Kota Jakarta
  {
    id: 31,
    soal: "Selain burung Elang Bondol, flora yang menjadi maskot resmi Provinsi DKI Jakarta adalah...",
    pilihan: ["Bunga Melati", "Bunga Anggrek", "Salak Condet", "Pohon Mahoni"],
    jawabanBenar: 2
  },
  {
    id: 32,
    soal: "Satu-satunya wilayah di Provinsi DKI Jakarta yang berstatus sebagai Kabupaten Administrasi adalah...",
    pilihan: ["Jakarta Utara", "Kepulauan Seribu", "Jakarta Barat", "Kota Tua"],
    jawabanBenar: 1
  },
  {
    id: 33,
    soal: "Taman hiburan raksasa di tepi laut utara Jakarta yang di dalamnya terdapat Dunia Fantasi (Dufan) adalah...",
    pilihan: ["Taman Mini Indonesia Indah", "Taman Impian Jaya Ancol", "Kebun Binatang Ragunan", "Taman Anggrek"],
    jawabanBenar: 1
  },
  {
    id: 34,
    soal: "Tempat wisata edukasi di Jakarta Timur yang menampilkan miniatur kebudayaan dari seluruh provinsi di Indonesia adalah...",
    pilihan: ["Taman Suropati", "Taman Ismail Marzuki", "Monumen Pancasila Sakti", "Taman Mini Indonesia Indah (TMII)"],
    jawabanBenar: 3
  },
  {
    id: 35,
    soal: "Stasiun kereta api bersejarah di kawasan Kota Tua Jakarta yang dibangun pada masa Belanda dan dikenal dengan sebutan \"Stasiun Beos\" adalah...",
    pilihan: ["Stasiun Gambir", "Stasiun Manggarai", "Stasiun Jakarta Kota", "Stasiun Jatinegara"],
    jawabanBenar: 2
  },
  {
    id: 36,
    soal: "Pasar tekstil dan grosir terbesar di Asia Tenggara yang terletak di Jakarta Pusat adalah...",
    pilihan: ["Pasar Senen", "Pasar Baru", "Pasar Tanah Abang", "Pasar Jatinegara"],
    jawabanBenar: 2
  },
  {
    id: 37,
    soal: "Masjid terbesar di Asia Tenggara yang menjadi simbol toleransi karena letaknya berseberangan dengan Gereja Katedral di Jakarta adalah...",
    pilihan: ["Masjid Sunda Kelapa", "Masjid Istiqlal", "Masjid Cut Meutia", "Masjid Agung Al-Azhar"],
    jawabanBenar: 1
  },
  {
    id: 38,
    soal: "Sungai terpanjang dan terbesar yang membelah kota Jakarta, sering kali menjadi pusat perhatian saat musim hujan, adalah...",
    pilihan: ["Sungai Ciliwung", "Sungai Cisadane", "Sungai Citarum", "Kali Sunter"],
    jawabanBenar: 0
  },
  {
    id: 39,
    soal: "Kawasan perkampungan di Jagakarsa, Jakarta Selatan, yang ditetapkan pemerintah sebagai pusat pelestarian Perkampungan Budaya Betawi adalah...",
    pilihan: ["Condet", "Kemayoran", "Setu Babakan", "Rawa Belong"],
    jawabanBenar: 2
  },
  {
    id: 40,
    soal: "Stadion sepak bola megah berskala internasional dengan atap yang bisa dibuka-tutup yang berlokasi di Jakarta Utara adalah...",
    pilihan: ["Stadion Utama Gelora Bung Karno", "Jakarta International Stadium (JIS)", "Stadion Lebak Bulus", "Stadion Patriot"],
    jawabanBenar: 1
  },
  // Bagian 5: Tokoh, Transportasi, dan Trivia Umum
  {
    id: 41,
    soal: "Siapakah tokoh legenda jagoan Betawi asal Rawa Belong yang dikenal seperti \"Robin Hood\" karena merampok penjajah untuk dibagikan kepada rakyat miskin?",
    pilihan: ["Si Jampang", "Si Pitung", "Murtado", "Sabeni"],
    jawabanBenar: 1
  },
  {
    id: 42,
    soal: "Selain Si Pitung, terdapat tokoh pendekar Betawi legendaris yang dijuluki \"Macan Kemayoran\". Siapakah dia?",
    pilihan: ["Murtado", "Ji'ih", "Pitung", "Darip"],
    jawabanBenar: 0
  },
  {
    id: 43,
    soal: "Sistem transportasi Bus Rapid Transit (BRT) pertama di Asia Tenggara yang beroperasi di Jakarta dengan jalur khusus adalah...",
    pilihan: ["KRL Commuter Line", "MRT Jakarta", "LRT Jakarta", "TransJakarta"],
    jawabanBenar: 3
  },
  {
    id: 44,
    soal: "Jalan tol yang melingkari pinggiran wilayah Jakarta untuk mengurai kemacetan dalam kota sering disingkat dengan...",
    pilihan: ["JORR (Jakarta Outer Ring Road)", "JITUT (Jakarta Intra Urban Toll)", "Jagorawi", "Tol Cipularang"],
    jawabanBenar: 0
  },
  {
    id: 45,
    soal: "Kosakata santai khas Jakarta \"Gue\" (saya) dan \"Lu\" (kamu) sebenarnya merupakan kata serapan yang berasal dari bahasa...",
    pilihan: ["Arab", "Hokkien (Tionghoa)", "Portugis", "Belanda"],
    jawabanBenar: 1
  },
  {
    id: 46,
    soal: "Semboyan resmi Provinsi DKI Jakarta yang tertulis pada lambang daerahnya adalah \"Jaya Raya\", yang memiliki makna...",
    pilihan: ["Kota yang damai", "Kota yang besar dan berjaya", "Kota pahlawan", "Kota persahabatan"],
    jawabanBenar: 1
  },
  {
    id: 47,
    soal: "Seniman legendaris Betawi, Benyamin Sueb, membintangi sebuah sinetron fenomenal pada era 90-an yang menceritakan keluarga Betawi modern. Judul sinetron tersebut adalah...",
    pilihan: ["Si Manis Jembatan Ancol", "Keluarga Cemara", "Si Doel Anak Sekolahan", "Bajaj Bajuri"],
    jawabanBenar: 2
  },
  {
    id: 48,
    soal: "Sebelum dipindahkan ke kawasan JIExpo Kemayoran, Pekan Raya Jakarta (Jakarta Fair) pertama kali diselenggarakan secara rutin di kawasan...",
    pilihan: ["Senayan", "Monas (Taman Ria)", "Ancol", "Lapangan Banteng"],
    jawabanBenar: 1
  },
  {
    id: 49,
    soal: "Pusat kesenian dan kebudayaan di Cikini, Jakarta Pusat, yang memiliki planetarium dan dinamakan dari seorang maestro musik Indonesia adalah...",
    pilihan: ["Taman Ismail Marzuki (TIM)", "Gedung Kesenian Jakarta (GKJ)", "Bentara Budaya Jakarta", "Ciputra Artpreneur"],
    jawabanBenar: 0
  },
  {
    id: 50,
    soal: "Kereta massal bawah tanah pertama di Indonesia yang beroperasi di Jakarta memanjang dari Lebak Bulus hingga Bundaran HI dinamakan...",
    pilihan: ["KRL", "MRT (Mass Rapid Transit)", "LRT (Light Rail Transit)", "Aeromovel"],
    jawabanBenar: 1
  }
];

const MAX_QUESTIONS = 5;

export default function SlingshotGame() {
  const router = useRouter();
  const { profile, addPoints } = useProfile();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
     const handleFullscreenChange = () => {
        setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement));
     };
     document.addEventListener('fullscreenchange', handleFullscreenChange);
     document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
     document.addEventListener('mozfullscreenchange', handleFullscreenChange);
     document.addEventListener('MSFullscreenChange', handleFullscreenChange);
     return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
     };
  }, []);

  const toggleFullscreen = () => {
     if (!document.fullscreenElement && !(document as any).webkitFullscreenElement && !(document as any).mozFullScreenElement && !(document as any).msFullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
     } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
        else if ((document as any).mozCancelFullScreen) (document as any).mozCancelFullScreen();
        else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
     }
  };
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [pendingStars, setPendingStars] = useState<{ count: number; timestamp: number; positions: { x: number; y: number }[] }>({ count: 0, timestamp: 0, positions: [] });
  const [gameState, setGameState] = useState("playing"); // playing, flying, result, gameOver
  const [feedback, setFeedback] = useState<null | { type: "correct" | "wrong"; index: number }>(null);
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [gameQuestions, setGameQuestions] = useState(QUESTIONS.slice(0, MAX_QUESTIONS));
  
  const slingRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Shuffle logic
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, MAX_QUESTIONS); 
  };

  useEffect(() => {
    setGameQuestions(shuffleArray(QUESTIONS));
  }, []);

  const question = gameQuestions[currentLevel] || gameQuestions[0];

  // Handle shooting logic
  const handleRelease = (event: any, info: any) => {
    if (gameState !== "playing") return;

    // Apply same drag limit as handleDrag for consistency
    let ox = info.offset.x;
    let oy = info.offset.y;
    const maxDrag = 120;
    const dist = Math.sqrt(ox ** 2 + oy ** 2);
    if (dist > maxDrag) {
      const ratio = maxDrag / dist;
      ox *= ratio;
      oy *= ratio;
    }

    const isMobile = window.innerWidth < 768;
    const powerX = isMobile ? 1.5 : 4.5;
    const powerY = isMobile ? 1.5 : 4.5;
    
    // Reverse direction for slingshot feel
    const targetX = -ox * powerX;
    const targetY = -oy * powerY; // Dynamic depth based on pull

    setGameState("flying");
    setIsDragging(false);

    // Animate ball
    setBallPos({ x: targetX, y: targetY });

    // Determine which bubble it hits (simple hit detection)
    setTimeout(() => {
      checkCollision(targetX, targetY);
    }, 800); 
  };

  const checkCollision = (tx: number, ty: number) => {
    // Dynamic bubble centers relative to screen center
    const dynamicBubbles = bubbleRefs.current.map((el) => {
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      return (rect.left + rect.width / 2) - (window.innerWidth / 2);
    });

    let hitIndex = -1; 
    let minDist = Infinity;

    dynamicBubbles.forEach((bx, i) => {
      const d = Math.abs(tx - bx);
      if (d < minDist) {
        minDist = d;
        hitIndex = i;
      }
    });

    if (hitIndex !== -1) {
      if (hitIndex === question.jawabanBenar) {
        setScore(s => s + 5);
        
        // Trigger Star Burst from the hit bubble's screen position
        const now = Date.now();
        const bubbleEl = bubbleRefs.current[hitIndex];
        let startX = window.innerWidth / 2;
        let startY = window.innerHeight / 2;

        if (bubbleEl) {
          const rect = bubbleEl.getBoundingClientRect();
          startX = rect.left + rect.width / 2;
          startY = rect.top + rect.height / 2;
        }

        const positions = Array.from({ length: 5 }).map(() => ({
          x: startX + (Math.random() * 60 - 30),
          y: startY + (Math.random() * 60 - 30)
        }));
        setPendingStars({ count: 5, timestamp: now, positions });

        setFeedback({ type: "correct", index: hitIndex });
      } else {
        setFeedback({ type: "wrong", index: hitIndex });
      }
    } else {
      setFeedback(null);
    }

    setGameState("hit");
    
    setTimeout(() => {
      setGameState("result");
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentLevel < gameQuestions.length - 1) {
      setCurrentLevel(l => l + 1);
      setGameState("playing");
      setFeedback(null);
      setBallPos({ x: 0, y: 0 });
    } else {
      setGameState("gameOver");
    }
  };

  const resetGame = () => {
    setGameQuestions(shuffleArray(QUESTIONS));
    setCurrentLevel(0);
    setScore(0);
    setGameState("playing");
    setFeedback(null);
    setBallPos({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 bg-[#F0F4F8] overflow-hidden flex flex-col font-sans select-none">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <img 
          src="https://i.ibb.co.com/K1Y0sBy/Gemini-Generated-Image-mk00bamk00bamk00.png" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Header */}
      <div className="relative z-[100] p-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <button onClick={toggleFullscreen} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-600 hidden md:flex">
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </button>
        </div>
        
        <div className="flex-1 max-w-md mx-8 flex flex-col items-center gap-1">
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentLevel + 1) / Math.min(gameQuestions.length, MAX_QUESTIONS)) * 100}%` }}
              className="h-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
          <span className="text-[10px] font-black text-ink-light tracking-widest uppercase opacity-60">
            SOAL {Math.min(currentLevel + 1, MAX_QUESTIONS)} DARI {Math.min(gameQuestions.length, MAX_QUESTIONS)}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-sm">
             <div className="flex flex-col items-end border-r border-gray-100 pr-3">
                <span className="text-[9px] font-black text-ink-light tracking-widest uppercase opacity-40">PEMAIN</span>
                <span className="text-xs font-black text-ink-light">{profile.name}</span>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-ink-light tracking-widest uppercase opacity-60">POIN BINTANG</span>
               <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />
                  <span className="text-xl font-black text-ink">{profile.points || 0}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Arena */}
      <div ref={containerRef} className="flex-1 relative flex flex-col items-center pt-8 px-2">
        
        {/* 3D Wood Question Board */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative w-full max-w-lg mb-12"
        >
          <div className="absolute -inset-1 bg-black/10 rounded-3xl blur-sm transform translate-y-2"></div>
          <div className="relative bg-gradient-to-b from-[#8B4513] to-[#5D2E0C] border-b-8 border-[#3D1E08] p-6 rounded-3xl shadow-2xl">
             <div className="bg-[#FFF8E7]/10 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                <p className="text-white text-center font-black text-lg md:text-xl leading-tight drop-shadow-md">
                  "{question.soal}"
                </p>
             </div>
             {/* Board Texture details */}
             <div className="absolute top-2 left-4 w-2 h-2 rounded-full bg-black/30"></div>
             <div className="absolute top-2 right-4 w-2 h-2 rounded-full bg-black/30"></div>
             <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-black/30"></div>
             <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-black/30"></div>
          </div>
        </motion.div>

        {/* Target Arena (The House & Bubbles) */}
        <div className="relative w-full flex-1 flex flex-col items-center justify-start pt-2">
          
          {/* Answer Bubbles (3D Capsules) - Horizontal Row */}
          <div className="grid grid-cols-4 gap-1.5 md:gap-4 w-full max-w-5xl z-20 px-1 md:px-4">
            {question.pilihan.map((text, idx) => {
              const isHit = feedback?.index === idx;
              const isCorrect = idx === question.jawabanBenar;
              
              // 3D Color Palette
              const bubbleColors = [
                "from-rose-400 via-rose-500 to-rose-700 shadow-rose-900/40", // Red
                "from-sky-400 via-sky-500 to-sky-700 shadow-sky-900/40",   // Blue
                "from-emerald-400 via-emerald-500 to-emerald-700 shadow-emerald-900/40", // Green
                "from-amber-400 via-amber-500 to-amber-700 shadow-amber-900/40" // Amber
              ];

              return (
                <motion.div
                  key={`${currentLevel}-${idx}`}
                  ref={el => { bubbleRefs.current[idx] = el; }}
                  initial={{ scale: 1, opacity: 1, y: 50 }}
                  animate={
                    isHit 
                      ? (isCorrect ? { scale: [1, 1.5, 0], opacity: [1, 1, 0] } : { x: [0, -10, 10, -10, 10, 0] })
                      : { y: [0, -5, 0], opacity: 1, scale: 1 }
                  }
                  transition={
                    isHit 
                      ? { duration: 0.5 } 
                      : { repeat: Infinity, duration: 2 + idx * 0.5, ease: "easeInOut" }
                  }
                  className={`relative rounded-full text-center transition-all cursor-pointer group`}
                >
                  {/* The 3D Capsule Look - Colorful Version */}
                  <div className={`
                    relative px-2 md:px-4 py-3 md:py-5 rounded-2xl md:rounded-3xl font-black 
                    text-[13px] md:text-sm tracking-tight leading-tight flex items-center justify-center min-h-[65px] md:min-h-[80px]
                    shadow-[0_8px_0_0_rgba(0,0,0,0.25),inset_0_4px_4px_rgba(255,255,255,0.4)]
                    bg-gradient-to-br border border-white/30 group-hover:scale-105 active:scale-95 transition-transform
                    ${!feedback ? bubbleColors[idx % 4] + " text-white" : ""}
                    ${feedback && isCorrect && isHit ? 'from-green-400 to-green-600 !text-white' : ''}
                    ${feedback && !isCorrect && isHit ? 'from-red-400 to-red-600 !text-white' : ''}
                    ${feedback && !isHit ? 'opacity-20 grayscale' : ''}
                  `}>
                    <span className="drop-shadow-md">{text}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Slingshot Section (Bottom) */}
        <div className="relative w-full h-64 mt-auto flex justify-center items-end pb-12">
          
          {/* Slingshot Handle (Custom Image) */}
          <div className="absolute bottom-0 w-48 h-64 flex justify-center pointer-events-none">
            <img 
              src="https://i.ibb.co.com/t59W6Hw/KATAPEL.png" 
              alt="Slingshot Handle" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Sling Rubber (Visual) */}
          <svg className="absolute bottom-32 w-48 h-32 pointer-events-none overflow-visible">
             <motion.line 
               x1="40" y1="50" 
               animate={{ x2: isDragging ? ballPos.x + 96 : 96, y2: isDragging ? ballPos.y + 40 : 40 }}
               transition={{ type: "spring", stiffness: 400, damping: 20 }}
               stroke="#3D1E08" strokeWidth="8" strokeLinecap="round" 
             />
             <motion.line 
               x1="152" y1="50" 
               animate={{ x2: isDragging ? ballPos.x + 96 : 96, y2: isDragging ? ballPos.y + 40 : 40 }}
               transition={{ type: "spring", stiffness: 400, damping: 20 }}
               stroke="#3D1E08" strokeWidth="8" strokeLinecap="round" 
             />
          </svg>

          {/* Trajectory Guide (Dots) */}
          {isDragging && (
            <div className="absolute bottom-[152px] pointer-events-none overflow-visible w-0 h-0 flex justify-center items-center z-30">
              {[...Array(7)].map((_, i) => {
                const step = (i + 1) / 7;
                const isMobile = window.innerWidth < 768;
                const powerX = isMobile ? 1.5 : 4.5;
                const powerY = isMobile ? 1.5 : 4.5;
                const dx = -ballPos.x * powerX * step;
                const dy = -ballPos.y * powerY * step;
                const scale = 1.3 - (step * 0.8); // More dramatic perspective
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, x: dx, y: dy, scale }}
                    className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1),0_0_30px_rgba(255,255,255,0.4)]"
                  />
                );
              })}
            </div>
          )}

          {/* Explosion / Particles (When Hit) */}
          {(gameState === "hit" || gameState === "result") && (
            <div className="absolute pointer-events-none overflow-visible" style={{ left: `calc(50% + ${ballPos.x}px)`, bottom: `calc(120px - ${ballPos.y}px)` }}>
              {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const dist = 50 + Math.random() * 50;
                const tx = Math.cos(angle) * dist;
                const ty = Math.sin(angle) * dist;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                    animate={{ x: tx, y: ty, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`absolute w-3 h-3 rounded-full ${feedback?.type === "correct" ? "bg-green-400" : "bg-red-400"} shadow-lg`}
                  />
                );
              })}
              {/* Central Flash */}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute -left-4 -top-4 w-8 h-8 bg-white rounded-full blur-md"
              />
            </div>
          )}

          {/* Projectile (Ball) Origin Container */}
          <div className="absolute bottom-[152px] pointer-events-none overflow-visible w-16 h-16 flex justify-center items-center z-[999]">
            <motion.div
              key={currentLevel}
              drag={gameState === "playing"}
              dragConstraints={{ top: 0, bottom: 150, left: -100, right: 100 }}
              dragElastic={0.1}
              onDragStart={() => setIsDragging(true)}
              onDrag={(e, info) => setBallPos({ x: info.offset.x, y: info.offset.y })}
              onDragEnd={handleRelease}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: ballPos.x,
                y: ballPos.y,
                scale: gameState === "flying" ? 0.35 : 1,
                opacity: (gameState === "playing" || gameState === "flying") ? 1 : 0
              }}
              transition={
                gameState === "flying" 
                ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
                : (isDragging ? { type: "tween", duration: 0 } : { type: "spring", damping: 15, stiffness: 300 })
              }
              className={`
                pointer-events-auto
                w-16 h-16 cursor-grab active:cursor-grabbing
                relative flex items-center justify-center
                ${isDragging ? 'scale-110' : ''}
              `}
            >
              <img 
                src="https://i.ibb.co.com/Z3ZtMW4/Desain-tanpa-judul.png" 
                alt="Projectile"
                className="w-full h-full object-contain drop-shadow-2xl pointer-events-none"
                style={{ filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.5))" }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Popups & States */}
      <AnimatePresence>
        {gameState === "result" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-premium">
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${feedback?.type === "correct" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                {feedback?.type === "correct" ? <Trophy size={48} /> : <Target size={48} />}
              </div>
              <h2 className={`text-3xl font-black mb-2 ${feedback?.type === "correct" ? "text-green-600" : "text-red-600"}`}>
                {feedback?.type === "correct" ? "MANTEP!" : "YAHH..."}
              </h2>
              <p className="font-bold text-ink-light mb-6 opacity-60">
                {feedback?.type === "correct" 
                  ? "Jawaban kamu bener banget! Lanjut?" 
                  : `Jawaban yang bener: ${question.pilihan[question.jawabanBenar]}`}
              </p>
              <button 
                onClick={nextQuestion}
                className="w-full py-4 bg-secondary text-white rounded-2xl font-black text-lg tracking-widest shadow-glow-blue"
              >
                LANJUT
              </button>
            </div>
          </motion.div>
        )}

        {gameState === "gameOver" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-secondary/90 backdrop-blur-xl"
          >
            <div className="text-center text-white">
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full mx-auto mb-8 flex items-center justify-center border-4 border-white"
              >
                <Trophy size={64} />
              </motion.div>
              <h1 className="text-5xl font-black mb-2 tracking-tighter italic">SELESAI!</h1>
              <p className="text-xl font-bold mb-10 opacity-80 px-10">
                Hebat! Kamu dapet skor <span className="text-primary font-black underline">{score}</span> poin.
              </p>
              
              <div className="flex flex-col gap-4 max-w-xs mx-auto">
                <button 
                  onClick={resetGame}
                  className="w-full py-5 bg-white text-secondary rounded-2xl font-black text-xl tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-105 transition-all"
                >
                  <RefreshCw /> MAIN LAGI
                </button>
                <button 
                  onClick={() => router.push('/')}
                  className="w-full py-5 bg-white/10 text-white border-2 border-white rounded-2xl font-black text-xl tracking-widest hover:bg-white/20 transition-all"
                >
                  KEMBALI
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
      {/* Star Animation Layer */}
      <StarFly burst={pendingStars} onStarHit={() => addPoints(1)} />
    </div>
  );
}
