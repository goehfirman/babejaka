"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  profileName?: string;
  avatarUrl?: string;
  onLogout?: () => void;
  onLogin?: () => void;
  isDefaultUser?: boolean;
}

export default function MobileNav({ isOpen, onClose, profileName, avatarUrl, onLogout, onLogin, isDefaultUser }: MobileNavProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Beranda", href: "/", icon: "home" },
    { label: "Perpustakaan", href: "/explore/library", icon: "auto_stories" },
    { label: "Diagnosis Membaca", href: "/explore/diagnostic", icon: "stairs" },
    { label: "Dashboard", href: "/explore/dashboard", icon: "dashboard" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 right-0 h-full w-[280px] bg-white z-[300] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b-4 border-[#F0F8FF] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F0F8FF] border-2 border-[#5AAFD1] overflow-hidden flex items-center justify-center shadow-inner">
                <img src={avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=Petualang"} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest leading-none mb-1">Hallo,</p>
                <p className="text-xs font-black text-[#5AAFD1] truncate max-w-[120px]">{profileName || "Petualang"}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F8FAFC] flex items-center justify-center text-[#666666] hover:bg-[#F0F8FF] transition-colors">
              <span className="material-symbols-rounded text-xl">close</span>
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={isDefaultUser && (item.href === "/explore/library" || item.href === "/explore/diagnostic") ? "#" : item.href}
                  onClick={(e) => {
                    if (isDefaultUser && (item.href === "/explore/library" || item.href === "/explore/diagnostic")) {
                      e.preventDefault();
                      onLogin?.();
                    }
                    onClose();
                  }}
                  className={`flex items-center gap-4 p-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                    isActive 
                    ? 'bg-[#5AAFD1] text-white shadow-[0_4px_0_#4691B0]' 
                    : 'text-[#666666] hover:bg-[#F8FAFC] hover:text-[#5AAFD1]'
                  }`}
                >
                  <span className="material-symbols-rounded">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          {isDefaultUser ? (
            <div className="p-6 border-t-4 border-[#F0F8FF]">
              <button 
                onClick={() => { onLogin?.(); onClose(); }}
                className="w-full py-4 rounded-2xl bg-[#5AAFD1] text-white font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-[0_6px_0_#4691B0] hover:-translate-y-1 active:translate-y-0 transition-all border-2 border-white"
              >
                <span className="material-symbols-rounded text-lg">login</span>
                Masuk
              </button>
            </div>
          ) : (
            onLogout && (
              <div className="p-6 border-t-4 border-[#F0F8FF]">
                <button 
                  onClick={() => { onLogout(); onClose(); }}
                  className="w-full py-3 rounded-2xl bg-[#FFF5F5] text-[#FF4757] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 border-2 border-[#FFE5E5] hover:bg-[#FFE5E5] transition-all"
                >
                  <span className="material-symbols-rounded text-lg">logout</span>
                  Keluar
                </button>
              </div>
            )
          )}
        </div>
      </aside>
    </>
  );
}
