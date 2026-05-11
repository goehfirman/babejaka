"use client";
import { usePathname } from "next/navigation";

export default function GlobalBackground() {
  const pathname = usePathname();
  
  // Exclude Tug of War game page as requested
  if (pathname?.includes("/explore/games/tug-of-war")) return null;
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.05]"
      style={{ 
        backgroundImage: 'url("https://i.ibb.co.com/hzkP529/Gemini-Generated-Image-1ce1or1ce1or1ce1.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    />
  );
}
