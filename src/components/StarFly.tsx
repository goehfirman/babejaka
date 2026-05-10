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
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const lastBurstTimestamp = useRef(0);

  useEffect(() => {
    if (burst.count > 0 && burst.timestamp > lastBurstTimestamp.current) {
      lastBurstTimestamp.current = burst.timestamp;
      
      // Update target position based on navbar-points ID
      const targetEl = document.getElementById("navbar-points");
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        setTargetPos({ 
          x: rect.left + rect.width / 2, 
          y: rect.top + rect.height / 2 
        });
      } else {
        // Fallback to top right
        setTargetPos({ x: window.innerWidth - 100, y: 40 });
      }

      const newStars = burst.positions.map((pos, i) => ({
        id: `${burst.timestamp}-${i}`,
        delay: i * 80,
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
    <div className="fixed inset-0 pointer-events-none z-[1000]" style={{ 
      '--target-x': `${targetPos.x}px`, 
      '--target-y': `${targetPos.y}px` 
    } as React.CSSProperties}>
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
          15% {
            transform: translate(0, -30px) scale(1.6) rotate(30deg);
            opacity: 1;
          }
          100% {
            left: var(--target-x);
            top: var(--target-y);
            transform: scale(0.1) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fly-to-nav {
          animation: fly-to-nav 1.4s cubic-bezier(0.45, 0.05, 0.55, 0.95);
        }
      `}</style>
    </div>
  );
}
