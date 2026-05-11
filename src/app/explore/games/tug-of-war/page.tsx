"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Trophy, Users, Star, Swords, Volume2 } from "lucide-react";
import { useProfile } from "@/lib/profile-context";
import { StarFly } from "@/components/StarFly";
import { db } from "@/lib/firebase";
import { 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  getDoc, 
  serverTimestamp 
} from "firebase/firestore";
import TarikTambangLobby from "./TarikTambangLobby";

import confetti from "canvas-confetti";

// --- SFX Helper ---
const playSound = (type: 'pull' | 'win' | 'correct' | 'wrong') => {
  const sounds: Record<string, string> = {
    pull: "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3",
    win: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
    correct: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
    wrong: "https://assets.mixkit.co/active_storage/sfx/2855/2855-preview.mp3" // Distinct 'Tetot' buzzer
  };
  const audio = new Audio(sounds[type]);
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const playWinCelebration = () => {
  playSound('win');
  confetti({
    particleCount: 200,
    spread: 100,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'],
    gravity: 0.5,
    scalar: 1.2
  });
};

const QUESTIONS = [
  // Bagian 1: Sejarah Jakarta
  { id: 1, soal: "Sebelum diubah namanya menjadi Jayakarta oleh Fatahillah pada tahun 1527, Jakarta dikenal dengan nama...", pilihan: ["Batavia", "Tarumanegara", "Sunda Kelapa", "Banten Girang"], jawabanBenar: 2 },
  { id: 2, soal: "Tanggal berapakah yang diperingati sebagai Hari Ulang Tahun (HUT) Kota Jakarta?", pilihan: ["17 Agustus", "22 Juni", "1 Juni", "20 Mei"], jawabanBenar: 1 },
  { id: 3, soal: "Pada masa penjajahan kolonial Belanda, nama Jakarta diubah menjadi...", pilihan: ["Buitenzorg", "Batavia", "Kutaraja", "Fort de Kock"], jawabanBenar: 1 },
  { id: 4, soal: "Pada masa pendudukan Jepang di Indonesia, nama Batavia diganti menjadi...", pilihan: ["Jakarta Tokubetsu Shi", "Edo", "Syonan-to", "Batavia Shimbun"], jawabanBenar: 0 },
  { id: 5, soal: "Siapakah pahlawan nasional dari Betawi yang namanya diabadikan menjadi salah satu jalan protokol terpanjang dan pusat bisnis di Jakarta?", pilihan: ["Ismail Marzuki", "Benyamin Sueb", "Mohammad Husni Thamrin", "Chairil Anwar"], jawabanBenar: 2 },
  { id: 6, soal: "Rapat Raksasa yang dihadiri oleh Presiden Soekarno pada 19 September 1945 untuk mempertahankan kemerdekaan diadakan di...", pilihan: ["Lapangan Banteng", "Lapangan Ikada (kini kawasan Monas)", "Tugu Proklamasi", "Istana Negara"], jawabanBenar: 1 },
  { id: 7, soal: "Gubernur DKI Jakarta yang dijuluki \"Bang Ali\" dan dikenal banyak membangun fasilitas modern, serta mencetuskan Pekan Raya Jakarta (PRJ) adalah...", pilihan: ["Tjokropranolo", "Sutiyoso", "Ali Sadikin", "Wiyogo Atmodarminto"], jawabanBenar: 2 },
  { id: 8, soal: "Pelabuhan bersejarah di Jakarta Utara yang sudah ada sejak zaman Kerajaan Hindu Tarumanegara adalah...", pilihan: ["Pelabuhan Tanjung Priok", "Pelabuhan Merak", "Pelabuhan Sunda Kelapa", "Pelabuhan Muara Angke"], jawabanBenar: 2 },
  { id: 9, soal: "Monumen Nasional (Monas) memiliki mahkota berupa lidah api kemerdekaan yang dilapisi oleh emas murni. Berapa berat total emas tersebut saat ini?", pilihan: ["20 kg", "35 kg", "50 kg", "75 kg"], jawabanBenar: 2 },
  { id: 10, soal: "Siapakah tokoh yang memimpin penaklukan Sunda Kelapa dan mengganti namanya menjadi Jayakarta?", pilihan: ["Raden Patah", "Fatahillah", "Sultan Ageng Tirtayasa", "Sultan Hasanuddin"], jawabanBenar: 1 },
  // Bagian 2: Seni dan Budaya Betawi
  { id: 11, soal: "Boneka raksasa khas Betawi yang biasanya diarak dalam pesta rakyat dan dipercaya dapat menolak bala disebut...", pilihan: ["Barong", "Ondel-ondel", "Sigale-gale", "Wayang Golek"], jawabanBenar: 1 },
  { id: 12, soal: "Kesenian teater tradisional Betawi yang sering membawakan cerita komedi dan diiringi musik Gambang Kromong adalah...", pilihan: ["Ketoprak", "Ludruk", "Lenong", "Randai"], jawabanBenar: 2 },
  { id: 13, soal: "Alat musik tradisional Betawi berbentuk seperti biola yang dimainkan dengan cara digesek dan mendapat pengaruh kuat dari budaya Tionghoa adalah...", pilihan: ["Tehyan", "Rebab", "Tarawangsa", "Sampe"], jawabanBenar: 0 },
  { id: 14, soal: "Kesenian musik tiup khas Betawi yang mendapat pengaruh dari budaya Eropa (Portugis dan Belanda) dan sering dimainkan untuk mengarak pengantin adalah...", pilihan: ["Tanjidor", "Marawis", "Qasidah", "Keroncong"], jawabanBenar: 0 },
  { id: 15, soal: "Tradisi berbalas pantun dan adu silat dalam upacara penyambutan pengantin pria pada pernikahan adat Betawi disebut...", pilihan: ["Buka Pintu", "Palang Pintu", "Seserahan", "Ngarak Pengantin"], jawabanBenar: 1 },
  { id: 16, soal: "Nama rumah adat tradisional suku Betawi yang memiliki atap berbentuk pelana lipat adalah...", pilihan: ["Rumah Joglo", "Rumah Gadang", "Rumah Kebaya", "Rumah Limasan"], jawabanBenar: 2 },
  { id: 17, soal: "Ornamen kayu berbentuk segitiga berjajar yang melambangkan kejujuran dan kerja keras, biasanya terdapat di pinggiran atap (lisplang) rumah adat Betawi disebut...", pilihan: ["Gigi Balang", "Pucuk Rebung", "Langit-langit", "Tumpal"], jawabanBenar: 0 },
  { id: 18, soal: "Kain khas peninggalan budaya Betawi yang biasa dikalungkan di leher oleh kaum pria, baik saat shalat maupun berlatih silat, disebut...", pilihan: ["Selendang", "Sarung", "Cukin", "Ulos"], jawabanBenar: 2 },
  { id: 19, soal: "Tarian tradisional Betawi yang sangat dinamis dan sering digunakan untuk menyambut tamu kehormatan atau membuka acara adalah...", pilihan: ["Tari Jaipong", "Tari Sirih Kuning", "Tari Piring", "Tari Kecak"], jawabanBenar: 1 },
  { id: 20, soal: "Pakaian adat khas pria Betawi sehari-hari yang terdiri dari kemeja tanpa kerah dan celana komprang disebut...", pilihan: ["Baju Sadariah / Tikim", "Baju Surjan", "Baju Bodo", "Baju Pangsi"], jawabanBenar: 0 },
  // Bagian 3: Kuliner Khas Betawi
  { id: 21, soal: "Makanan khas Betawi yang terbuat dari beras ketan, telur (ayam/bebek), ebi, dan kelapa sangrai, dimasak di atas wajan tanpa minyak adalah...", pilihan: ["Nasi Ulam", "Ketoprak", "Kerak Telor", "Kue Rangi"], jawabanBenar: 2 },
  { id: 22, soal: "Minuman penyegar khas Betawi yang terbuat dari jahe, daun serai, dan kayu secang (memberi warna merah), serta tidak mengandung alkohol sama sekali adalah...", pilihan: ["Tuak", "Bir Pletok", "Bandrek", "Bajigur"], jawabanBenar: 1 },
  { id: 23, soal: "Roti manis khas Betawi yang selalu ada dalam seserahan pernikahan adat dan melambangkan kesetiaan abadi adalah...", pilihan: ["Roti Gambang", "Roti Buaya", "Roti Sisir", "Roti Kadet"], jawabanBenar: 1 },
  { id: 24, soal: "Hidangan sup berkuah gurih khas Jakarta yang menggunakan daging atau jeroan sapi, dengan kuah campuran santan dan susu adalah...", pilihan: ["Soto Tangkar", "Soto Betawi", "Soto Mie", "Empal Gentong"], jawabanBenar: 1 },
  { id: 25, soal: "Sayur khas Betawi yang memiliki kuah hitam pekat karena menggunakan kluwek, disajikan dengan ikan air tawar, adalah...", pilihan: ["Gabus Pucung", "Sayur Babanci", "Pindang Bandeng", "Pecak Lele"], jawabanBenar: 0 },
  { id: 26, soal: "Kue kering tradisional Betawi yang renyah dan digoreng menggunakan cetakan berbentuk bunga dinamakan...", pilihan: ["Kue Cucur", "Kue Kembang Goyang", "Kue Akar Kelapa", "Kue Semprong"], jawabanBenar: 1 },
  { id: 27, soal: "Minuman atau pencuci mulut khas Betawi yang terbuat dari adonan tepung beras dan sagu aren berlapis warna (merah, putih, hijau), disajikan dengan kuah santan dan gula merah adalah...", pilihan: ["Es Doger", "Es Podeng", "Es Selendang Mayang", "Es Pisang Ijo"], jawabanBenar: 2 },
  { id: 28, soal: "Hidangan sayur langka khas Betawi yang namanya mengandung kata \"sayur\" namun sebenarnya tidak menggunakan sayuran sama sekali, melainkan daging sapi/kelapa muda dan belimbing wuluh adalah...", pilihan: ["Sayur Besan", "Sayur Babanci", "Sayur Godog", "Sayur Lodeh"], jawabanBenar: 1 },
  { id: 29, soal: "Asinan khas Jakarta yang terdiri dari sawi, kol, tauge, tahu, dan kerupuk mi kuning yang disiram kuah kacang bercampur cuka disebut...", pilihan: ["Asinan Bogor", "Asinan Betawi", "Rujak Juhi", "Ketoprak"], jawabanBenar: 1 },
  { id: 30, soal: "Makanan percampuran budaya Betawi dan Tionghoa yang terbuat dari irisan daging dan moncong sapi, disajikan dengan kangkung, juhi, dan disiram bumbu kacang kemerahan adalah...", pilihan: ["Rujak Cingur", "Rujak Shanghai", "Gado-gado", "Toge Goreng"], jawabanBenar: 1 },
  // Bagian 4: Landmark dan Tata Kota Jakarta
  { id: 31, soal: "Selain burung Elang Bondol, flora yang menjadi maskot resmi Provinsi DKI Jakarta adalah...", pilihan: ["Bunga Melati", "Bunga Anggrek", "Salak Condet", "Pohon Mahoni"], jawabanBenar: 2 },
  { id: 32, soal: "Satu-satunya wilayah di Provinsi DKI Jakarta yang berstatus sebagai Kabupaten Administrasi adalah...", pilihan: ["Jakarta Utara", "Kepulauan Seribu", "Jakarta Barat", "Kota Tua"], jawabanBenar: 1 },
  { id: 33, soal: "Taman hiburan raksasa di tepi laut utara Jakarta yang di dalamnya terdapat Dunia Fantasi (Dufan) adalah...", pilihan: ["Taman Mini Indonesia Indah", "Taman Impian Jaya Ancol", "Kebun Binatang Ragunan", "Taman Anggrek"], jawabanBenar: 1 },
  { id: 34, soal: "Tempat wisata edukasi di Jakarta Timur yang menampilkan miniatur kebudayaan dari seluruh provinsi di Indonesia adalah...", pilihan: ["Taman Suropati", "Taman Ismail Marzuki", "Monumen Pancasila Sakti", "Taman Mini Indonesia Indah (TMII)"], jawabanBenar: 3 },
  { id: 35, soal: "Stasiun kereta api bersejarah di kawasan Kota Tua Jakarta yang dibangun pada masa Belanda dan dikenal dengan sebutan \"Stasiun Beos\" adalah...", pilihan: ["Stasiun Gambir", "Stasiun Manggarai", "Stasiun Jakarta Kota", "Stasiun Jatinegara"], jawabanBenar: 2 },
  { id: 36, soal: "Pasar tekstil dan grosir terbesar di Asia Tenggara yang terletak di Jakarta Pusat adalah...", pilihan: ["Pasar Senen", "Pasar Baru", "Pasar Tanah Abang", "Pasar Jatinegara"], jawabanBenar: 2 },
  { id: 37, soal: "Masjid terbesar di Asia Tenggara yang menjadi simbol toleransi karena letaknya berseberangan dengan Gereja Katedral di Jakarta adalah...", pilihan: ["Masjid Sunda Kelapa", "Masjid Istiqlal", "Masjid Cut Meutia", "Masjid Agung Al-Azhar"], jawabanBenar: 1 },
  { id: 38, soal: "Sungai terpanjang dan terbesar yang membelah kota Jakarta, sering kali menjadi pusat perhatian saat musim hujan, adalah...", pilihan: ["Sungai Ciliwung", "Sungai Cisadane", "Sungai Citarum", "Kali Sunter"], jawabanBenar: 0 },
  { id: 39, soal: "Kawasan perkampungan di Jagakarsa, Jakarta Selatan, yang ditetapkan pemerintah sebagai pusat pelestarian Perkampungan Budaya Betawi adalah...", pilihan: ["Condet", "Kemayoran", "Setu Babakan", "Rawa Belong"], jawabanBenar: 2 },
  { id: 40, soal: "Stadion sepak bola megah berskala internasional dengan atap yang bisa dibuka-tutup yang berlokasi di Jakarta Utara adalah...", pilihan: ["Stadion Utama Gelora Bung Karno", "Jakarta International Stadium (JIS)", "Stadion Lebak Bulus", "Stadion Patriot"], jawabanBenar: 1 },
  // Bagian 5: Tokoh, Transportasi, dan Trivia Umum
  { id: 41, soal: "Siapakah tokoh legenda jagoan Betawi asal Rawa Belong yang dikenal seperti \"Robin Hood\" karena merampok penjajah untuk dibagikan kepada rakyat miskin?", pilihan: ["Si Jampang", "Si Pitung", "Murtado", "Sabeni"], jawabanBenar: 1 },
  { id: 42, soal: "Selain Si Pitung, terdapat tokoh pendekar Betawi legendaris yang dijuluki \"Macan Kemayoran\". Siapakah dia?", pilihan: ["Murtado", "Ji'ih", "Pitung", "Darip"], jawabanBenar: 0 },
  { id: 43, soal: "Sistem transportasi Bus Rapid Transit (BRT) pertama di Asia Tenggara yang beroperasi di Jakarta dengan jalur khusus adalah...", pilihan: ["KRL Commuter Line", "MRT Jakarta", "LRT Jakarta", "TransJakarta"], jawabanBenar: 3 },
  { id: 44, soal: "Jalan tol yang melingkari pinggiran wilayah Jakarta untuk mengurai kemacetan dalam kota sering disingkat dengan...", pilihan: ["JORR (Jakarta Outer Ring Road)", "JITUT (Jakarta Intra Urban Toll)", "Jagorawi", "Tol Cipularang"], jawabanBenar: 0 },
  { id: 45, soal: "Kosakata santai khas Jakarta \"Gue\" (saya) dan \"Lu\" (kamu) sebenarnya merupakan kata serapan yang berasal dari bahasa...", pilihan: ["Arab", "Hokkien (Tionghoa)", "Portugis", "Belanda"], jawabanBenar: 1 },
  { id: 46, soal: "Semboyan resmi Provinsi DKI Jakarta yang tertulis pada lambang daerahnya adalah \"Jaya Raya\", yang memiliki makna...", pilihan: ["Kota yang damai", "Kota yang besar dan berjaya", "Kota pahlawan", "Kota persahabatan"], jawabanBenar: 1 },
  { id: 47, soal: "Seniman legendaris Betawi, Benyamin Sueb, membintangi sebuah sinetron fenomenal pada era 90-an yang menceritakan keluarga Betawi modern. Judul sinetron tersebut adalah...", pilihan: ["Si Manis Jembatan Ancol", "Keluarga Cemara", "Si Doel Anak Sekolahan", "Bajaj Bajuri"], jawabanBenar: 2 },
  { id: 48, soal: "Sebelum dipindahkan ke kawasan JIExpo Kemayoran, Pekan Raya Jakarta (Jakarta Fair) pertama kali diselenggarakan secara rutin di kawasan...", pilihan: ["Senayan", "Monas (Taman Ria)", "Ancol", "Lapangan Banteng"], jawabanBenar: 1 },
  { id: 49, soal: "Pusat kesenian dan kebudayaan di Cikini, Jakarta Pusat, yang memiliki planetarium dan dinamakan dari seorang maestro musik Indonesia adalah...", pilihan: ["Taman Ismail Marzuki (TIM)", "Gedung Kesenian Jakarta (GKJ)", "Bentara Budaya Jakarta", "Ciputra Artpreneur"], jawabanBenar: 0 },
  { id: 50, soal: "Kereta massal bawah tanah pertama di Indonesia yang beroperasi di Jakarta memanjang dari Lebak Bulus hingga Bundaran HI dinamakan...", pilihan: ["KRL", "MRT (Mass Rapid Transit)", "LRT (Light Rail Transit)", "Aeromovel"], jawabanBenar: 1 }
];

export default function TugOfWarGame() {
  const router = useRouter();
  const { profile, addPoints } = useProfile();
  
  const [gameMode, setGameMode] = useState<"select" | "single" | "multi-lobby" | "multi-playing">("select");
  const [roomId, setRoomId] = useState("");
  const [playerRole, setPlayerRole] = useState<"p1" | "p2" | null>(null);
  const [roomData, setRoomData] = useState<any>(null);
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameQuestions, setGameQuestions] = useState(QUESTIONS);
  
  // Seeded Shuffle Helper
  const shuffleWithSeed = (array: any[], seed: string) => {
    const shuffled = [...array];
    let seedNum = 0;
    for (let i = 0; i < seed.length; i++) {
      seedNum += seed.charCodeAt(i);
    }
    
    const random = () => {
      const x = Math.sin(seedNum++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (gameMode === "single") {
      const randomSeed = Math.random().toString(36).substring(7);
      setGameQuestions(shuffleWithSeed(QUESTIONS, randomSeed));
    } else if (roomId) {
      setGameQuestions(shuffleWithSeed(QUESTIONS, roomId));
    }
  }, [gameMode, roomId]);

  const [gameState, setGameState] = useState("playing");
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [pendingStars, setPendingStars] = useState<{ count: number; timestamp: number; positions: { x: number; y: number }[] }>({ count: 0, timestamp: 0, positions: [] });
  const [feedback, setFeedback] = useState<null | { type: "correct" | "wrong"; index: number }>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const answerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Calculation for 2.5D Rope Position
  const calculateMultiPos = () => {
    if (!roomData || !roomData.players) return 50;
    const p1Score = roomData.players.p1?.score || 0;
    const p2Score = roomData.players.p2?.score || 0;
    // P1 pulls to 0 (left), P2 pulls to 100 (right)
    return 50 + (p2Score - p1Score);
  };

  const ropePosition = gameMode === "single" ? (50 + (opponentScore - playerScore)) : calculateMultiPos();
  const ropeOffset = (ropePosition - 50) * 4;

  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, "rooms", roomId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRoomData(data);
        if (data.metadata.status === "playing") setGameMode("multi-playing");
        
        // SYNC QUESTION LEVEL
        if (data.gameplay?.currentLevel !== undefined) {
          setCurrentLevel(data.gameplay.currentLevel);
        }

        if (data.metadata.status === "finished") {
          setGameState("gameOver");
          if (data.metadata.winner === playerRole) playWinCelebration();
        }
      }
    });
    return () => unsub();
  }, [roomId, playerRole]);

  const [isJoining, setIsJoining] = useState(false);

  // --- Actions ---
  const joinRoom = async (code: string) => {
    if (isJoining) return;
    setIsJoining(true);
    try {
      const docRef = doc(db, "rooms", code);
      const snap = await getDoc(docRef);
      
      if (!snap.exists()) {
        // CREATE AS P1
        const newRoom = {
          metadata: { status: "waiting", createdAt: serverTimestamp(), winner: null },
          players: {
            p1: { name: profile.name, isReady: false, score: 0, lastAnswerStatus: null },
            p2: null
          },
          gameplay: { currentLevel: 0 }
        };
        await setDoc(docRef, newRoom);
        setRoomId(code);
        setPlayerRole("p1");
        setGameMode("multi-lobby");
      } else {
        // JOIN AS P2
        const data = snap.data();
        if (!data.players.p2) {
          if (data.players.p1.name === profile.name) {
            setRoomId(code);
            setPlayerRole("p1");
            setGameMode("multi-lobby");
          } else {
            await updateDoc(docRef, { "players.p2": { name: profile.name, isReady: false, score: 0, lastAnswerStatus: null } });
            setRoomId(code);
            setPlayerRole("p2");
            setGameMode("multi-lobby");
          }
        } else {
          if (data.players.p1.name === profile.name) {
            setRoomId(code); setPlayerRole("p1"); setGameMode("multi-lobby");
          } else if (data.players.p2.name === profile.name) {
            setRoomId(code); setPlayerRole("p2"); setGameMode("multi-lobby");
          } else {
            alert("Ruangan Penuh! Gunakan kode lain.");
          }
        }
      }
    } catch (err: any) {
      console.error("Database Connection Error:", err);
      alert(`Gagal terhubung ke database: ${err.message || 'Unknown Error'}`);
    } finally {
      setIsJoining(false);
    }
  };

  const handleAnswer = async (index: number) => {
    if (gameState !== "playing" || feedback !== null) return;
    const duration = (Date.now() - startTime) / 1000;
    const isCorrect = index === gameQuestions[currentLevel].jawabanBenar;
    setFeedback({ type: isCorrect ? "correct" : "wrong", index });

    if (isCorrect) playSound('correct'); else playSound('wrong');

    if (gameMode === "single") {
      let pS = playerScore;
      let oS = opponentScore;
      if (isCorrect) {
        const power = duration < 2 ? 4 : (duration < 5 ? 2 : 1);
        pS += power;
        setPlayerScore(pS);
        triggerStars(index);
        playSound('pull');
      } else {
        oS += 2;
        setOpponentScore(oS);
      }
      checkWin(pS, oS);
      setTimeout(() => { 
        setCurrentLevel(p => (p + 1) % gameQuestions.length); 
        setFeedback(null); 
        setStartTime(Date.now()); 
      }, 1500);
    } else {
      // Multiplayer
      if (!roomId || !playerRole || !roomData) return;
      
      const power = isCorrect ? (duration < 2 ? 4 : 2) : 0;
      const otherRole = playerRole === "p1" ? "p2" : "p1";
      
      const currentScore = (roomData.players as any)[playerRole].score || 0;
      const nextLevel = (roomData.gameplay.currentLevel + 1) % gameQuestions.length;
      
      const updates: any = {
        [`players.${playerRole}.score`]: currentScore + power,
        [`players.${playerRole}.lastAnswerStatus`]: isCorrect ? "correct" : "wrong",
        "gameplay.currentLevel": nextLevel // Sync next level for both
      };
 
      if (!isCorrect) {
        updates[`players.${otherRole}.score`] = (roomData.players[otherRole]?.score || 0) + 2;
      }
 
      await updateDoc(doc(db, "rooms", roomId), updates);
      if (isCorrect) { triggerStars(index); playSound('pull'); }
      
      // Check Win: Marker enters Finish Zone (40 or 60)
      const p1S = updates[`players.p1.score`] || roomData.players.p1.score;
      const p2S = updates[`players.p2.score`] || roomData.players.p2?.score || 0;
      const currentPos = 50 + (p2S - p1S);
      
      if (currentPos <= 40 || currentPos >= 60) {
        await updateDoc(doc(db, "rooms", roomId), {
          "metadata.status": "finished",
          "metadata.winner": currentPos <= 40 ? "p1" : "p2"
        });
      }
 
      setTimeout(() => { 
        setFeedback(null); 
        setStartTime(Date.now()); 
      }, 1500);
    }
  };
 
  const checkWin = (p: number, o: number) => {
    const currentPos = 50 + (o - p);
    if (currentPos <= 40 || currentPos >= 60) {
      setGameState("gameOver");
      if (currentPos <= 40) playWinCelebration();
    }
  };

  const triggerStars = (index: number) => {
    const btn = answerRefs.current[index];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setPendingStars({ 
        count: 5, 
        timestamp: Date.now(), 
        positions: Array.from({ length: 5 }).map(() => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }))
      });
    }
  };

  if (gameMode === "select") return <TarikTambangLobby onJoin={joinRoom} onSingle={() => setGameMode("single")} onBack={() => router.back()} onCreate={() => {}} isJoining={isJoining} />;

  if (gameMode === "multi-lobby") {
    if (!roomData) return (
      <div className="min-h-screen bg-batik-subtle flex items-center justify-center">
        <div className="animate-spin text-secondary"><RefreshCw size={48} /></div>
      </div>
    );

    return (
      <div className="min-h-screen bg-batik-subtle flex items-center justify-center p-6">
         <div className="bg-white/90 backdrop-blur-xl p-12 rounded-[48px] shadow-premium max-w-2xl w-full border-4 border-white text-center">
            <h2 className="text-sm font-black text-ink-light tracking-widest uppercase mb-8 opacity-40 italic">Menunggu Tantangan...</h2>
            <div className="bg-gray-100/50 p-8 rounded-3xl mb-12 border border-gray-100">
               <span className="text-[10px] font-black text-ink-light block mb-2 opacity-50 tracking-[0.3em]">KODE RAHASIA</span>
               <div className="text-6xl font-black text-secondary tracking-tighter shadow-sm">{roomId}</div>
            </div>
            <div className="grid grid-cols-2 gap-12 mb-12">
               <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center border-4 border-secondary animate-pulse"><Users className="text-secondary" /></div>
                  <span className="font-black text-ink">{roomData.players.p1?.name || "Tunggu..."}</span>
                  <span className="text-[10px] font-black text-secondary">PEMBUAT</span>
               </div>
               <div className="flex flex-col items-center gap-4">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${roomData.players.p2 ? 'border-primary bg-primary/10' : 'border-dashed border-gray-300'}`}>
                     {roomData.players.p2 ? <Users className="text-primary" /> : <div className="text-gray-300 animate-spin"><RefreshCw /></div>}
                  </div>
                  <span className="font-black text-ink">{roomData.players.p2?.name || "???"}</span>
                  <span className="text-[10px] font-black text-ink-light opacity-40">PENANTANG</span>
               </div>
            </div>
            <button 
              onClick={async () => {
                if (!playerRole || !roomId) return;
                const isReady = !roomData.players[playerRole].isReady;
                await updateDoc(doc(db, "rooms", roomId), { [`players.${playerRole}.isReady`]: isReady });
                
                // Refresh roomData check (in case snapshot is slow)
                const freshSnap = await getDoc(doc(db, "rooms", roomId));
                const freshData = freshSnap.data();
                if (isReady && freshData?.players.p1?.isReady && freshData?.players.p2?.isReady) {
                  await updateDoc(doc(db, "rooms", roomId), { "metadata.status": "playing" });
                }
              }}
              disabled={!roomData.players.p2}
              className={`w-full py-6 rounded-3xl font-black text-xl transition-all shadow-glow-blue ${roomData.players[playerRole!]?.isReady ? 'bg-success text-white' : 'bg-secondary text-white hover:-translate-y-1'}`}
            >
              {roomData.players[playerRole!]?.isReady ? "SAYA SIAP!" : "MULAI TANDING"}
            </button>
            <button onClick={() => setGameMode("select")} className="mt-6 text-ink-light font-bold text-xs hover:text-primary transition-all">BATALKAN</button>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] relative overflow-hidden flex flex-col">
      {/* Game Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-50"
        style={{ 
          backgroundImage: 'url("https://i.ibb.co.com/SDKj00s1/Gemini-Generated-Image-hhrgwbhhrgwbhhrg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="relative z-50 p-6 flex items-center justify-between">
        <button onClick={() => setGameMode("select")} className="p-2 hover:bg-white/50 rounded-full transition-all text-ink"><ArrowLeft size={24} /></button>
        <div className="flex items-center gap-4">
           <Volume2 className="text-ink-light opacity-30" />
           <div className="bg-ink text-white px-5 py-2 rounded-2xl flex items-center gap-3">
              <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">{profile.name}</span>
              <div className="w-px h-3 bg-white/20" />
              <div className="flex items-center gap-2">
                 <Star className="text-yellow-400 fill-yellow-400" size={16} />
                 <span className="font-black">{profile.points}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">

         <AnimatePresence mode="wait">
            {gameState !== "gameOver" ? (
              <motion.div key={currentLevel} className="w-full max-w-5xl px-6 mb-12">
                 <div className="bg-white/50 backdrop-blur-md p-8 rounded-[3rem] shadow-premium border-2 border-white relative text-center">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-black px-6 py-1 rounded-full shadow-lg uppercase">Kuis Tentang Jakarta</div>
                    <h2 className="text-xl md:text-2xl font-black text-ink mb-8 leading-tight">{gameQuestions[currentLevel].soal}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {gameQuestions[currentLevel].pilihan.map((p, idx) => (
                         <button 
                           key={idx} 
                           ref={el => { answerRefs.current[idx] = el; }}
                           onClick={() => handleAnswer(idx)} 
                           disabled={feedback !== null}
                           className={`py-4 px-4 rounded-3xl font-bold text-xs md:text-sm transition-all border-b-8 ${
                             feedback?.index === idx 
                             ? (feedback.type === 'correct' ? 'bg-success border-success-dark text-white' : 'bg-primary border-primary-dark text-white animate-shake')
                             : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-secondary hover:text-secondary'
                           }`}
                         >{p}</button>
                       ))}
                    </div>
                 </div>
              </motion.div>
            ) : (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-6">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  className="bg-white p-12 rounded-[4rem] shadow-premium text-center border-4 border-white max-w-md w-full relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-transparent opacity-50"></div>
                   <div className="relative z-10">
                      {(() => {
                        const isMulti = gameMode !== "single";
                        const won = isMulti 
                          ? (roomData?.metadata.winner === playerRole)
                          : (ropePosition <= 40);

                        if (won) {
                          return (
                            <>
                              <Trophy className="mx-auto text-yellow-500 w-20 h-20 mb-6 drop-shadow-lg animate-bounce" />
                              <h2 className="text-4xl font-black text-ink mb-2 tracking-tighter">MENANG MUTLAK!</h2>
                              <p className="font-bold text-ink-light mb-10 italic">Hebat! Kamu berhasil menarik lawan hingga terjatuh!</p>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                                <RefreshCw className="text-gray-400 w-10 h-10" />
                              </div>
                              <h2 className="text-4xl font-black text-ink mb-2 tracking-tighter uppercase">Ayo Coba Lagi!</h2>
                              <p className="font-bold text-ink-light mb-10 italic">Hampir saja! Jangan menyerah, asah lagi kemampuanmu!</p>
                            </>
                          );
                        }
                      })()}
                      
                      <button onClick={() => window.location.reload()} className="w-full bg-secondary text-white font-black py-5 rounded-3xl shadow-glow-blue flex items-center justify-center gap-3 hover:scale-[1.02] transition-all">
                         <RefreshCw /> MAIN LAGI
                      </button>
                   </div>
                </motion.div>
              </div>
            )}
         </AnimatePresence>

         <div className="relative w-full max-w-6xl h-96 flex items-center justify-center">
            
            {/* Strategic Finish Lines (Thin & Clear) */}
            <div className="absolute inset-0 flex justify-between items-center px-[40%] pointer-events-none">
               {/* Finish P1 Line */}
               <div className="h-full w-1 bg-red-500/40 relative">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-2 py-0.5 rounded text-[8px] font-black shadow-sm">FINISH</div>
               </div>
               
               {/* Finish P2 Line */}
               <div className="h-full w-1 bg-red-500/40 relative">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-2 py-0.5 rounded text-[8px] font-black shadow-sm">FINISH</div>
               </div>
            </div>

            {/* Center Reference Line (dotted) */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 border-l-2 border-dashed border-blue-200 opacity-50 z-0"></div>

            {/* Unified Rope System - Removed overflow-hidden to prevent clipping */}
            <div className="absolute inset-0 flex items-center justify-center">
               <motion.div 
                 animate={{ x: (ropePosition - 50) + "%" }}
                 transition={{ type: "spring", stiffness: 40, damping: 15 }}
                 className="relative w-full h-40 flex items-center justify-center"
               >

                  {/* Player 1 (Ujung Kiri) */}
                  <motion.div 
                    animate={{ 
                      y: (gameState === 'gameOver' && ropePosition >= 60) ? 200 : 0,
                      opacity: (gameState === 'gameOver' && ropePosition >= 60) ? 0 : 1
                    }}
                    transition={{ type: "spring", stiffness: 50 }}
                    className="absolute left-[5%] flex flex-col items-center"
                  >
                     <div className="relative">
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black/10 rounded-[100%] blur-xl"></div>
                        <img src="https://i.ibb.co.com/mFJ6b3Sx/narik.png" className="w-48 h-48 object-contain drop-shadow-2xl" alt="P1" />
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                           {gameMode === "single" ? profile.name : roomData?.players.p1?.name || "PEMAIN 1"}
                        </div>
                     </div>
                  </motion.div>

                  {/* Player 2 (Ujung Kanan) */}
                  <motion.div 
                    animate={{ 
                      y: (gameState === 'gameOver' && ropePosition <= 40) ? 200 : 0,
                      opacity: (gameState === 'gameOver' && ropePosition <= 40) ? 0 : 1
                    }}
                    transition={{ type: "spring", stiffness: 50 }}
                    className="absolute right-[5%] flex flex-col items-center -scale-x-100"
                  >
                     <div className="relative">
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black/10 rounded-[100%] blur-xl"></div>
                        <img src="https://i.ibb.co.com/mFJ6b3Sx/narik.png" className="w-48 h-48 object-contain drop-shadow-2xl" alt="P2" />
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-black px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap -scale-x-100">
                           {gameMode === "single" ? "JAKA" : roomData?.players.p2?.name || "LAWAN"}
                        </div>
                     </div>
                  </motion.div>

                  {/* The Rope (Now Above Characters) */}
                  <div className="absolute w-full h-6 bg-[#A0522D] shadow-xl rounded-full flex items-center z-10">
                     <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '15px 15px' }}></div>
                  </div>

                  {/* Red Center Marker (Highest Layer) */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-gray-50">
                     <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white"></div>
                  </div>
               </motion.div>
            </div>
         </div>
      </div>
      <StarFly burst={pendingStars} onStarHit={() => addPoints(1)} />
    </div>
  );
}
