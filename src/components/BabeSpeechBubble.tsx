"use client";
import React, { useState, useEffect } from "react";

const MESSAGES = [
  "Halo anak-anak Babe, nyok kite baca!",
  "Jakarta Global City butuh Jagoan Kata kayak lu!",
  "Nyok, pilih buku nyang lu demen!",
  "Babe Jaka siap nemenin lu belajar terus!",
];

export default function BabeSpeechBubble() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fullText = MESSAGES[currentMessageIndex];

    if (isTyping) {
      if (displayedText.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(fullText.slice(0, displayedText.length + 1));
        }, 50);
      } else {
        setIsTyping(false);
        timeout = setTimeout(() => {
          setIsTyping(true);
          setDisplayedText("");
          setCurrentMessageIndex((prev) => (prev + 1) % MESSAGES.length);
        }, 3000);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isTyping, currentMessageIndex]);

  return (
    <div className="absolute top-[-20%] -left-32 md:top-[-10%] md:-left-56 z-30 animate-fade-in-up">
      {/* Cloud-shaped Bubble */}
      <div className="relative group">
        {/* Main Body */}
        <div className="relative bg-white/70 backdrop-blur-md border border-white/40 p-5 md:p-7 rounded-[3rem] shadow-premium min-w-[220px] md:min-w-[300px] max-w-[350px] transition-all duration-500 hover:bg-white/80">
          
          {/* Cloud "Blobs" */}
          <div className="absolute -top-4 -left-2 w-12 h-12 bg-white/70 backdrop-blur-md rounded-full border-t border-l border-white/40"></div>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white/70 backdrop-blur-md rounded-full border-t border-white/40"></div>
          <div className="absolute -top-3 -right-2 w-10 h-10 bg-white/70 backdrop-blur-md rounded-full border-t border-r border-white/40"></div>
          <div className="absolute -bottom-2 -right-4 w-12 h-12 bg-white/70 backdrop-blur-md rounded-full border-b border-r border-white/40"></div>

          {/* Text Content */}
          <p className="relative z-10 text-ink font-black text-sm md:text-xl leading-relaxed text-center italic tracking-tight">
            "{displayedText}"
            {isTyping && <span className="inline-block w-1.5 h-4 bg-primary/40 ml-1 animate-pulse"></span>}
          </p>

          {/* Cloud "Tail" - repositioned to the right to point back to Babe */}
          <div className="absolute bottom-[-10px] right-12 w-6 h-6 bg-white/60 backdrop-blur-md rounded-full border-b border-r border-white/20"></div>
          <div className="absolute bottom-[-18px] right-8 w-4 h-4 bg-white/40 backdrop-blur-md rounded-full"></div>
        </div>

        {/* Subtle Glow beneath the cloud */}
        <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full -z-10 animate-pulse"></div>
      </div>
    </div>
  );
}
