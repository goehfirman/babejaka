"use client";
import React, { useEffect, useState, useRef } from "react";

interface ActiveStar {
  id: string;
  delay: number;
}

interface StarFlyProps {
  burst: { count: number; timestamp: number }; // Passing an object with timestamp forces update even if count is same
  onStarHit: () => void;
}

export function StarFly({ burst, onStarHit }: StarFlyProps) {
  const [activeStars, setActiveStars] = useState<ActiveStar[]>([]);
  
  // Track bursts to avoid duplicate triggers if same count is sent twice
  const lastBurstTimestamp = useRef(0);

  useEffect(() => {
    if (burst.count > 0 && burst.timestamp > lastBurstTimestamp.current) {
      lastBurstTimestamp.current = burst.timestamp;
      
      const newStars = Array.from({ length: Math.min(burst.count, 5) }).map((_, i) => ({
        id: `${burst.timestamp}-${i}`,
        delay: i * 100,
      }));
      
      setActiveStars(prev => [...prev, ...newStars]);
    }
  }, [burst]);

  const handleStarEnd = (id: string) => {
    onStarHit();
    setActiveStars(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[1000]">
      {activeStars.map((star) => (
        <div
          key={star.id}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl md:text-3xl animate-fly-to-nav"
          style={{
            animationDelay: `${star.delay}ms`,
            animationFillMode: "forwards",
          }}
          onAnimationEnd={() => handleStarEnd(star.id)}
        >
          ⭐
        </div>
      ))}
      <style jsx global>{`
        @keyframes fly-to-nav {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 0;
          }
          20% {
            transform: translate(-50%, -50%) scale(1.5) rotate(20deg);
            opacity: 1;
          }
          100% {
            /* Target: roughly where the navbar points are (top right) */
            transform: translate(calc(45vw - 60px), -45vh) scale(0.2) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fly-to-nav {
          animation: fly-to-nav 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
}
