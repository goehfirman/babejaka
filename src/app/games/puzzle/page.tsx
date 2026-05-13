"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Hash, RefreshCcw, Trophy, ChevronLeft, Eye, EyeOff, LayoutGrid, Play, Image as ImageIcon, Settings2, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";

type Difficulty = 3 | 4 | 5;
type SideType = 0 | 1 | -1;

interface Piece {
  id: number;
  row: number;
  col: number;
  sides: {
    top: SideType;
    right: SideType;
    bottom: SideType;
    left: SideType;
  };
  targetX: number;
  targetY: number;
  currentX: number; // For animation
  currentY: number; // For animation
  isLocked: boolean;
}

const PUZZLE_IMAGES = [
  { id: 0, url: "https://i.ibb.co.com/Df7HFSF8/Gemini-Generated-Image-pcx6hopcx6hopcx6.png", label: "Teka-Teki Jakarta" },
  { id: 1, url: "/games/puzzle-1.png", label: "Ondel-ondel & Monas" },
  { id: 2, url: "/games/puzzle-2.png", label: "Kota Tua Jakarta" },
  { id: 3, url: "/games/puzzle-3.png", label: "Bajaj Modern" },
  { id: 4, url: "/games/puzzle-4.png", label: "Bundaran HI Malam" },
  { id: 5, url: "/games/puzzle-5.png", label: "Tari Yapong Betawi" },
  { id: 6, url: "/games/puzzle-6.png", label: "Roti Buaya Tradisional" },
  { id: 7, url: "/games/puzzle-7.png", label: "Stadion Internasional (JIS)" },
  { id: 8, url: "/games/puzzle-8.png", label: "Soto Betawi Lezat" },
  { id: 9, url: "/games/puzzle-9.png", label: "Pantai Ancol & Dufan" },
  { id: 10, url: "/games/puzzle-10.png", label: "Pasar Tanah Abang" },
  { id: 11, url: "https://i.ibb.co.com/p6x2SRQb/4.jpg", label: "JakLingko & Literasi" },
  { id: 12, url: "/games/puzzle-12.png", label: "Permainan Galasin" },
  { id: 13, url: "/games/puzzle-13.png", label: "Kerak Telor Betawi" },
  { id: 14, url: "/games/puzzle-14.png", label: "MRT Jakarta Modern" },
  { id: 15, url: "/games/puzzle-15.png", label: "Kota Tua 2D Style" },
  { id: 16, url: "/games/puzzle-16.png", label: "Taman Mini (TMII)" }
];

export default function PuzzlePage() {
  // Game Flow State
  const [gameState, setGameState] = useState<"selection" | "playing">("selection");
  const [isShuffling, setIsShuffling] = useState(false);
  
  // Selection State
  const [selectedImage, setSelectedImage] = useState(PUZZLE_IMAGES[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>(3);

  // Playing State
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const BOARD_SIZE = 500; 

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !isWon && !isShuffling) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isWon, isShuffling]);

  const initGame = useCallback(() => {
    const dim = difficulty;
    const pieceSize = BOARD_SIZE / dim;
    const tempPieces: Piece[] = [];

    // Side generation logic
    const sideGrid: { top: SideType; right: SideType; bottom: SideType; left: SideType }[][] = [];
    for (let r = 0; r < dim; r++) {
      sideGrid[r] = [];
      for (let c = 0; c < dim; c++) {
        const top = r === 0 ? 0 : -sideGrid[r - 1][c].bottom as SideType;
        const left = c === 0 ? 0 : -sideGrid[r][c - 1].right as SideType;
        const right = c === dim - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1) as SideType;
        const bottom = r === dim - 1 ? 0 : (Math.random() > 0.5 ? 1 : -1) as SideType;
        sideGrid[r][c] = { top, right, bottom, left };
      }
    }

    for (let r = 0; r < dim; r++) {
      for (let c = 0; c < dim; c++) {
        const id = r * dim + c;
        const targetX = c * pieceSize;
        const targetY = r * pieceSize;
        
        // Initially pieces start at their correct target position
        tempPieces.push({
          id, row: r, col: c, sides: sideGrid[r][c], targetX, targetY, currentX: targetX, currentY: targetY, isLocked: true
        });
      }
    }

    setPieces(tempPieces);
    setMoves(0);
    setStartTime(null);
    setElapsedTime(0);
    setIsWon(false);
    setIsShuffling(true);
    setGameState("playing");

    // Start chaotic shuffle animation
    let shuffleCount = 0;
    const maxShuffles = 8; // ~3 seconds total (400ms * 8 = 3.2s)
    
    const shuffleInterval = setInterval(() => {
      setPieces(currentPieces => 
        currentPieces.map(p => {
          if (p.id === 0) return p; // Anchor stays
          
          const scatterRange = 120; // Reduced from 250
          const randX = (Math.random() * (BOARD_SIZE - pieceSize)) + (Math.random() > 0.5 ? scatterRange : -scatterRange);
          const randY = (Math.random() * (BOARD_SIZE - pieceSize)) + (Math.random() > 0.5 ? scatterRange : -scatterRange);
          
          return { ...p, currentX: randX, currentY: randY, isLocked: false };
        })
      );
      
      shuffleCount++;
      
      if (shuffleCount >= maxShuffles) {
        clearInterval(shuffleInterval);
        setTimeout(() => {
          setIsShuffling(false);
          setStartTime(Date.now());
        }, 500);
      }
    }, 400);

    // Auto-scroll to board on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [difficulty, selectedImage]);

  const handleDragEnd = (id: number, info: any) => {
    if (isShuffling) return;
    
    const piece = pieces.find(p => p.id === id);
    if (!piece || piece.isLocked) return;

    const currentX = piece.currentX + info.offset.x;
    const currentY = piece.currentY + info.offset.y;
    const distance = Math.sqrt(Math.pow(currentX - piece.targetX, 2) + Math.pow(currentY - piece.targetY, 2));

    const SNAP_THRESHOLD = 40; 

    if (distance < SNAP_THRESHOLD) {
      const newPieces = pieces.map(p => 
        p.id === id ? { ...p, isLocked: true, currentX: p.targetX, currentY: p.currentY } : p
      );
      setPieces(newPieces.map(p => p.id === id ? { ...p, currentX: p.targetX, currentY: p.targetY } : p));
      setMoves(prev => prev + 1);

      if (newPieces.every(p => p.isLocked)) {
        setIsWon(true);
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
      }
    } else {
      setPieces(pieces.map(p => p.id === id ? { ...p, currentX: currentX, currentY: currentY } : p));
      setMoves(prev => prev + 1);
    }
  };

  const getPiecePath = (sides: Piece['sides']) => {
    const size = 100;
    const tabSize = 16;
    const neckSize = 12;
    let path = "M 0 0 ";
    if (sides.top === 0) path += `L ${size} 0 `;
    else {
      const dir = sides.top;
      path += `L ${size/2 - neckSize} 0 C ${size/2 - neckSize} ${-tabSize * dir}, ${size/2 + neckSize} ${-tabSize * dir}, ${size/2 + neckSize} 0 L ${size} 0 `;
    }
    if (sides.right === 0) path += `L ${size} ${size} `;
    else {
      const dir = sides.right;
      path += `L ${size} ${size/2 - neckSize} C ${size + tabSize * dir} ${size/2 - neckSize}, ${size + tabSize * dir} ${size/2 + neckSize}, ${size} ${size/2 + neckSize} L ${size} ${size} `;
    }
    if (sides.bottom === 0) path += `L 0 ${size} `;
    else {
      const dir = sides.bottom;
      path += `L ${size/2 + neckSize} ${size} C ${size/2 + neckSize} ${size + tabSize * dir}, ${size/2 - neckSize} ${size + tabSize * dir}, ${size/2 - neckSize} ${size} L 0 ${size} `;
    }
    if (sides.left === 0) path += `L 0 0 `;
    else {
      const dir = sides.left;
      path += `L 0 ${size/2 + neckSize} C ${-tabSize * dir} ${size/2 + neckSize}, ${-tabSize * dir} ${size/2 - neckSize}, 0 ${size/2 - neckSize} L 0 0 `;
    }
    return path + " Z";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isClient) return null;

  return (
    <div className="fixed inset-0 h-screen overflow-y-auto pt-24 pb-12 px-4 flex flex-col items-center max-w-[1440px] mx-auto font-body bg-batik-subtle">
      
      <AnimatePresence mode="wait">
        {gameState === "selection" ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-6xl flex flex-col items-center"
          >
            {/* Selection Header */}
            <div className="w-full text-center mb-12">
               <div className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/60 shadow-sm mb-4">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                  <span className="font-black text-primary uppercase tracking-widest text-sm">Pengaturan Game</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-ink italic font-changa">Jigsaw <span className="text-primary">Literasi</span></h1>
               <p className="text-ink-light font-bold mt-2">Pilih gambar dan tentukan tingkat kesulitanmu!</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 w-full">
               {/* Left: Image Selection */}
               <div className="bg-white/40 backdrop-blur-md p-8 rounded-[40px] border border-white/60 shadow-xl">
                  <div className="flex items-center gap-3 mb-8">
                     <ImageIcon className="w-6 h-6 text-primary" />
                     <h3 className="text-2xl font-black text-ink font-changa">Pilih Gambar</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:max-h-[600px] lg:overflow-y-auto p-2 scrollbar-hide">
                     {PUZZLE_IMAGES.map((img) => (
                       <motion.div 
                         key={img.id}
                         whileHover={{ scale: 1.05 }}
                         whileTap={{ scale: 0.95 }}
                         onClick={() => setSelectedImage(img)}
                         className={`relative aspect-square rounded-3xl overflow-hidden cursor-pointer border-4 transition-all ${
                           selectedImage.id === img.id ? "border-primary shadow-lg shadow-primary/20" : "border-transparent opacity-70 hover:opacity-100"
                         }`}
                       >
                          <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                          <div className={`absolute inset-0 bg-primary/20 flex items-center justify-center transition-opacity ${selectedImage.id === img.id ? "opacity-100" : "opacity-0"}`}>
                             <div className="bg-white rounded-full p-2 text-primary">
                                <Play className="w-6 h-6 fill-primary" />
                             </div>
                          </div>
                       </motion.div>
                     ))}
                  </div>
               </div>

               {/* Right: Difficulty & Preview */}
               <div className="flex flex-col gap-6">
                  {/* Difficulty Card */}
                  <div className="bg-white/60 backdrop-blur-md p-8 rounded-[40px] border border-white/60 shadow-xl">
                     <div className="flex items-center gap-3 mb-6">
                        <Settings2 className="w-6 h-6 text-secondary" />
                        <h3 className="text-xl font-black text-ink font-changa">Tingkat Kesulitan</h3>
                     </div>
                     <div className="grid grid-cols-3 gap-3">
                        {[3, 4, 5].map((d) => (
                          <button
                            key={d}
                            onClick={() => setDifficulty(d as Difficulty)}
                            className={`py-4 rounded-2xl font-black text-xl transition-all ${
                              difficulty === d ? "bg-primary text-white shadow-xl scale-105" : "bg-white/50 text-gray-400 hover:bg-white"
                            }`}
                          >
                             {d}x{d}
                          </button>
                        ))}
                     </div>
                     <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                        {difficulty === 3 ? "Mudah (9 Kepingan)" : difficulty === 4 ? "Sedang (16 Kepingan)" : "Susah (25 Kepingan)"}
                     </p>
                  </div>

                  {/* Selected Preview */}
                  <div className="bg-gray-800 p-6 rounded-[40px] shadow-2xl flex flex-col items-center">
                     <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 border-2 border-white/10">
                        <img src={selectedImage.url} className="w-full h-full object-cover" />
                     </div>
                     <h4 className="text-white font-black text-lg mb-1">{selectedImage.label}</h4>
                     <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-8 text-center">BABE JAKA - Jakarta Kota Global</p>
                     
                     <button 
                       onClick={initGame}
                       className="w-full bg-primary text-white py-5 rounded-3xl font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                     >
                        <Play className="w-8 h-8 fill-white" />
                        MULAI BERMAIN
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-[1400px] flex flex-col items-center"
          >
            {/* Playing Header */}
            <div className="w-full max-w-6xl flex justify-between items-center mb-8 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-xl">
              <button 
                onClick={() => setGameState("selection")}
                disabled={isShuffling}
                className="flex items-center gap-2 text-primary font-bold hover:opacity-70 transition-all disabled:opacity-30"
              >
                <ChevronLeft className="w-6 h-6" />
                <span>Pilih Gambar</span>
              </button>
              <div className="text-center">
                <h1 className="text-2xl font-black text-primary leading-tight font-changa">{selectedImage.label}</h1>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  {isShuffling ? "⚡ Mengacak Kepingan..." : `${difficulty}x${difficulty} Jigsaw`}
                </p>
              </div>
              <button 
                onClick={() => setGameState("selection")}
                disabled={isShuffling}
                className="p-3 bg-white/60 rounded-full hover:bg-white text-primary shadow-md transition-all disabled:opacity-30"
              >
                <Settings2 className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-10 w-full items-start justify-center">
              {/* Game Area (Board) */}
              <div className="relative">
                <div 
                  className="absolute z-0 bg-black/5 rounded-2xl border-4 border-dashed border-black/10 transition-all duration-500"
                  style={{ width: BOARD_SIZE, height: BOARD_SIZE, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: (isWon || isShuffling) ? 0 : 1 }}
                />

                <div 
                  ref={containerRef}
                  className={`relative bg-white/10 rounded-[40px] backdrop-blur-sm border border-white/30 shadow-2xl overflow-visible select-none transition-all duration-500 ${isShuffling ? 'brightness-90 scale-95' : 'cursor-grab active:cursor-grabbing'}`}
                  style={{ width: BOARD_SIZE + 300, height: BOARD_SIZE + 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="0" height="0" className="absolute">
                    <defs>
                      <filter id="pieceBevel">
                        <feSpecularLighting surfaceScale="5" specularConstant="0.8" specularExponent="20" lightingColor="#ffffff" in="SourceGraphic" result="specOut">
                          <fePointLight x="-50" y="-50" z="100" />
                        </feSpecularLighting>
                        <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
                        <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
                      </filter>
                    </defs>
                  </svg>

                  <div className="relative" style={{ width: BOARD_SIZE, height: BOARD_SIZE }}>
                    <AnimatePresence>
                      {pieces.map((piece) => {
                        const clipId = `clip-${piece.id}`;
                        const path = getPiecePath(piece.sides);
                        const pSize = BOARD_SIZE / difficulty;

                        return (
                          <motion.div
                            key={piece.id}
                            drag={!piece.isLocked && !isShuffling}
                            dragMomentum={false}
                            dragConstraints={containerRef}
                            onDragEnd={(_, info) => handleDragEnd(piece.id, info)}
                            animate={{ 
                              x: piece.currentX, 
                              y: piece.currentY, 
                              zIndex: piece.isLocked ? 1 : 100, 
                              scale: piece.isLocked ? 1 : 1.05,
                              opacity: isShuffling ? 0.7 : 1
                            }}
                            transition={{ 
                              type: "spring", 
                              stiffness: isShuffling ? 50 : 300, 
                              damping: isShuffling ? 20 : 25,
                              mass: 1
                            }}
                            className="absolute"
                            style={{ width: pSize, height: pSize, left: 0, top: 0, touchAction: 'none' }}
                          >
                            <svg viewBox="-20 -20 140 140" className="w-[140%] h-[140%] absolute top-[-20%] left-[-20%]" style={{ filter: "url(#pieceBevel)" }}>
                              <defs><clipPath id={clipId}><path d={path} /></clipPath></defs>
                              <g clipPath={`url(#${clipId})`}>
                                <image href={selectedImage.url} x={-piece.col * 100} y={-piece.row * 100} width={difficulty * 100} height={difficulty * 100} preserveAspectRatio="xMidYMid slice" />
                              </g>
                              <path d={path} fill="none" stroke={piece.id === 0 ? "#22C55E" : (piece.isLocked ? "rgba(34, 197, 94, 0.5)" : "rgba(0,0,0,0.15)")} strokeWidth={piece.isLocked ? "2" : "0.5"} />
                              {piece.id === 0 && (
                                <g transform={`translate(${100 - 24}, ${100 - 24}) scale(0.6)`}>
                                  <circle cx="20" cy="20" r="18" fill="rgba(34, 197, 94, 0.9)" />
                                  <path d="M21 10V2L19 2V10M19 10C16.2386 10 14 12.2386 14 15V17H26V15C26 12.2386 23.7614 10 21 10Z" fill="white" />
                                </g>
                              )}
                            </svg>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {isWon && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-[200] bg-primary/90 backdrop-blur-2xl rounded-[40px] flex flex-col items-center justify-center text-white text-center p-8">
                      <Trophy className="w-24 h-24 mb-6 text-yellow-300 animate-bounce" />
                      <h2 className="text-5xl font-black mb-4 font-changa">Sempurna!</h2>
                      <p className="text-xl opacity-90 mb-8 max-w-sm">Semua kepingan telah terpasang dengan tepat.</p>
                      <button onClick={() => setGameState("selection")} className="bg-white text-primary px-10 py-4 rounded-full font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">Main Lagi</button>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="w-full lg:w-80 flex flex-col gap-6">
                <div className="bg-white/60 backdrop-blur-md p-6 rounded-[32px] border border-white/60 shadow-xl">
                   <h3 className="text-lg font-black text-gray-800 mb-4 font-changa">Informasi</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/40 rounded-xl">
                         <Timer className="w-5 h-5 text-primary" />
                         <span className="font-black text-primary text-xl">{formatTime(elapsedTime)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/40 rounded-xl">
                         <LayoutGrid className="w-5 h-5 text-primary" />
                         <span className="font-black text-primary text-lg">{pieces.filter(p => p.isLocked).length} / {pieces.length}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white/60 backdrop-blur-md p-6 rounded-[32px] border border-white/60 shadow-xl">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-black text-gray-800 font-changa">Preview</h3>
                      <button onClick={() => setShowPreview(!showPreview)} className="text-primary">{showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                   </div>
                   <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white">
                      <img src={selectedImage.url} className={`w-full h-full object-cover transition-all ${showPreview ? 'opacity-100' : 'opacity-10 blur-sm grayscale'}`} />
                   </div>
                </div>

                <button 
                  onClick={() => setGameState("selection")}
                  disabled={isShuffling}
                  className="w-full flex items-center justify-center gap-3 bg-gray-800 text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-700 transition-all shadow-lg active:scale-95 disabled:opacity-30"
                >
                  <Settings2 className="w-5 h-5" />
                  Ganti Pengaturan
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .bg-batik-subtle {
          background-image: url('https://www.transparenttextures.com/patterns/batik-thin.png');
          background-attachment: fixed;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
