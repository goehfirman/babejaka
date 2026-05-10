"use client";
import React, { useEffect, useState } from "react";

interface Star {
  id: number;
  delay: number;
}

interface StarFlyProps {
  count: number;
  onComplete: () => void;
}

export function StarFly({ count, onComplete }: StarFlyProps) {
  const [stars, setStars] = useState<Star[]>([]);
  const [finishedCount, setFinishedCount] = useState(0);

  useEffect(() => {
    const newStars = Array.from({ length: Math.min(count, 10) }).map((_, i) => ({
      id: i,
      delay: i * 150,
    }));
    setStars(newStars);
  }, [count]);

  const handleStarEnd = () => {
    setFinishedCount((prev) => {
      const next = prev + 1;
      if (next >= stars.length) {
        setTimeout(onComplete, 500);
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[1000]">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl animate-fly-to-nav"
          style={{
            animationDelay: `${star.delay}ms`,
            animationFillMode: "forwards",
          }}
          onAnimationEnd={handleStarEnd}
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
            transform: translate(calc(45vw - 100px), -45vh) scale(0.2) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fly-to-nav {
          animation: fly-to-nav 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
}
