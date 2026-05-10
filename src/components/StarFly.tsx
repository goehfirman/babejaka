"use client";
import React, { useEffect, useState, useRef } from "react";

interface ActiveStar {
  id: string;
  delay: number;
  startX: number;
  startY: number;
}

interface StarFlyProps {
  burst: { count: number; timestamp: number; positions: { x: number; y: number }[] };
  onStarHit: () => void;
}

export function StarFly({ burst, onStarHit }: StarFlyProps) {
  const [activeStars, setActiveStars] = useState<ActiveStar[]>([]);
  const lastBurstTimestamp = useRef(0);

  useEffect(() => {
    if (burst.count > 0 && burst.timestamp > lastBurstTimestamp.current) {
      lastBurstTimestamp.current = burst.timestamp;
      
      const newStars = burst.positions.map((pos, i) => ({
        id: `${burst.timestamp}-${i}`,
        delay: i * 80, // Slightly faster staggered start
        startX: pos.x,
        startY: pos.y
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
          className="absolute text-2xl md:text-3xl animate-fly-to-nav"
          style={{
            left: star.startX,
            top: star.startY,
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
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 0;
          }
          20% {
            transform: translate(0, -20px) scale(1.5) rotate(20deg);
            opacity: 1;
          }
          100% {
            /* Target: roughly where the navbar points are (top right) */
            /* Using vw/vh to reach the navbar area from any start position */
            left: calc(100vw - 120px);
            top: 40px;
            transform: scale(0.2) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fly-to-nav {
          /* Increased duration for smoother, less "monotonous" movement */
          animation: fly-to-nav 1.5s cubic-bezier(0.45, 0.05, 0.55, 0.95);
        }
      `}</style>
    </div>
  );
}
