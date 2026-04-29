"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useProfile } from "@/lib/profile-context";
import MobileNav from "./MobileNav";
import NamePromptModal from "./NamePromptModal";

import BrandLogo from "./BrandLogo";

export default function Navbar() {
  const { profile, logout, getAvatarUrl } = useProfile();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);

  const isDefaultUser = profile.name === "Petualang Baca";

  // Hide navbar on specialized reading pages and potentially landing if we want, 
  // but user said CONSISTENT in every page. 
  // Specialized Reading Room has its own logic, so we hide it there.
  if (pathname?.startsWith("/explore/read/")) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-5 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:scale-105 transition-transform flex items-center shrink-0 group outline-none focus:ring-0">
            <BrandLogo size="sm" showIcon={true} />
          </Link>

          <div className="flex items-center gap-2 md:gap-4 lg:gap-6">

            {/* Hamburger Button (Mobile Only) */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="flex md:hidden w-10 h-10 items-center justify-center rounded-xl bg-gray-50 text-primary border border-gray-200 hover:bg-white transition-all active:scale-95"
            >
              <span className="material-symbols-rounded text-2xl font-bold">menu</span>
            </button>

            {/* Profile & Logout / Login Button */}
            {isDefaultUser ? (
              <button 
                onClick={() => setShowNameModal(true)}
                className="px-6 py-2 bg-secondary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-glow-blue hover:-translate-y-0.5 active:translate-y-0 transition-all ml-1"
              >
                MASUK
              </button>
            ) : (
              <div className="flex items-center gap-2 md:gap-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 ml-1">
                <div className="hidden sm:block">
                  <p className="text-[9px] font-black text-ink-light tracking-widest leading-none mb-0.5 opacity-60 uppercase">HALO</p>
                  <h4 className="text-[11px] font-black text-secondary truncate tracking-tight max-w-[80px] md:max-w-[100px]">{profile.name}</h4>
                </div>
                <button 
                  onClick={handleLogout}
                  className="hidden md:flex ml-2 items-center justify-center w-8 h-8 rounded-lg hover:bg-white text-ink-light/40 hover:text-primary transition-all group"
                  title="Keluar"
                >
                  <span className="material-symbols-rounded text-base group-hover:rotate-12 transition-transform">logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Traditional Gigi Balang Ornament - Seamless Repeat */}
        <div 
          className="absolute left-0 right-0 top-full pointer-events-none h-[90px] md:h-[110px] overflow-hidden"
          style={{ 
            backgroundImage: 'url("https://i.ibb.co.com/XrnHrbqS/BABE-JAKA-3.png")',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'top center',
            backgroundSize: 'auto 100%',
            opacity: 0.95
          }}
        />
      </nav>

      {showNameModal && (
        <NamePromptModal onClose={() => setShowNameModal(false)} />
      )}

      <MobileNav 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        profileName={profile.name}
        avatarUrl={getAvatarUrl()}
        onLogout={handleLogout}
        onLogin={() => setShowNameModal(true)}
        isDefaultUser={isDefaultUser}
      />
    </>
  );
}
