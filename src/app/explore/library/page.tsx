"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProfile } from "@/lib/profile-context";
import { useBooks } from "@/hooks/useBooks";

export default function ExploreLibrary() {
  const { logout, getAvatarUrl } = useProfile();
  const { allBooks } = useBooks();
  
  const jenjangOptions = Array.from(new Set(allBooks.map(b => b.level).filter(Boolean))).sort();

  const [activeFilter, setActiveFilter] = useState({ type: 'sort', value: 'Terbaru' });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);

  const displayedBooks = [...allBooks].sort((a, b) => {
    if (activeFilter.type === 'sort' && activeFilter.value === 'Terpopuler') {
      const popA = a.title.charCodeAt(0) + a.title.length;
      const popB = b.title.charCodeAt(0) + b.title.length;
      return popB - popA;
    }
    const indexA = allBooks.indexOf(a);
    const indexB = allBooks.indexOf(b);
    return indexB - indexA; // Default sort is newest
  }).filter(b => {
    if (activeFilter.type === 'jenjang') return b.level === activeFilter.value;
    return true;
  });

  return (
    <div className="min-h-screen bg-batik-subtle pt-[120px] md:pt-[150px] pb-20 px-6 md:px-10">
      
      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto relative z-10 transition-all duration-300">
        
        {/* Header Section */}
        <div className="mb-12 relative z-10">
            <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight text-black drop-shadow-sm max-w-4xl">
              Jelajahi Buku Digital yang Sesuai dengan Level Membacamu!
            </h1>
        </div>
        
        {/* Sorting & Filter Navbar */}
        <div className="mb-16 flex flex-wrap gap-4 relative z-[100] w-full">
           <div className="flex flex-wrap gap-2 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-gray-200/50 shadow-sm shrink-0 z-[100] max-w-full">
              <button
                onClick={() => { setActiveFilter({ type: 'sort', value: 'Terbaru' }); setOpenDropdown(null); }}
                className={`whitespace-nowrap px-6 py-3 rounded-xl text-[10px] md:text-xs font-black tracking-widest transition-all ${activeFilter.type === 'sort' && activeFilter.value === 'Terbaru' ? 'bg-primary text-white shadow-glow-red' : 'text-ink-light hover:text-primary hover:bg-white'}`}
              >
                TERBARU
              </button>
              
              <button
                onClick={() => { setActiveFilter({ type: 'sort', value: 'Terpopuler' }); setOpenDropdown(null); }}
                className={`whitespace-nowrap px-6 py-3 rounded-xl text-[10px] md:text-xs font-black tracking-widest transition-all ${activeFilter.type === 'sort' && activeFilter.value === 'Terpopuler' ? 'bg-primary text-white shadow-glow-red' : 'text-ink-light hover:text-primary hover:bg-white'}`}
              >
                TERPOPULER
              </button>

              <div className="relative">
                 <button
                   onClick={() => setOpenDropdown(openDropdown === 'jenjang' ? null : 'jenjang')}
                   className={`flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-xl text-[10px] md:text-xs font-black tracking-widest transition-all ${activeFilter.type === 'jenjang' || openDropdown === 'jenjang' ? 'bg-secondary text-white shadow-glow-blue' : 'text-ink-light hover:text-secondary hover:bg-white'}`}
                 >
                   {activeFilter.type === 'jenjang' ? activeFilter.value.toUpperCase() : 'JENJANG PEMBACA'}
                   <span className="material-symbols-rounded text-sm">{openDropdown === 'jenjang' ? 'expand_less' : 'expand_more'}</span>
                 </button>
                 {openDropdown === 'jenjang' && (
                    <div className="absolute top-full left-0 mt-2 min-w-[220px] bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden p-2 space-y-1">
                       {jenjangOptions.map(jenjang => (
                          <button 
                             key={jenjang} 
                             onClick={() => { setActiveFilter({ type: 'jenjang', value: jenjang }); setOpenDropdown(null); }}
                             className={`w-full text-left px-4 py-2.5 text-[10px] font-black rounded-lg transition-colors truncate tracking-wide ${activeFilter.type === 'jenjang' && activeFilter.value === jenjang ? 'bg-primary text-white' : 'text-ink-light hover:bg-gray-50'}`}
                          >
                             {jenjang.toUpperCase()}
                          </button>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Book Grid - Heritage-Tech Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 relative z-10">
          {displayedBooks.map((book, i) => (
            <div 
              key={book.id} 
              onClick={() => setActiveBookId(activeBookId === String(book.id) ? null : String(book.id))}
              className="group flex flex-col relative overflow-hidden h-[340px] rounded-2xl border border-gray-100 bg-white shadow-premium transform transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl cursor-pointer hologram-border" 
              style={{ animationDelay: `${0.1 + i * 0.05}s` }}
            >
               {/* Level Badge - Premium Red, Blue, Green, Yellow */}
               <div className="absolute top-4 left-4 z-20">
                  <div 
                    className={`w-10 h-10 flex items-center justify-center text-[10px] font-black shadow-lg transform group-hover:scale-110 transition-transform ${
                      book.level.includes('Dini') ? 'bg-primary text-white' : // Red
                      book.level.includes('Awal') ? 'bg-secondary text-white' : // Blue
                      book.level.includes('Semenjana') ? 'bg-success text-white' : // Green
                      book.level.includes('Madya') ? 'bg-warning text-ink' : // Yellow
                      'bg-indigo-600 text-white'
                    } rounded-lg`}
                  >
                     <span>
                       {book.level.includes('Dini') ? 'A' : 
                        book.level.includes('Awal') ? 'B' : 
                        book.level.includes('Semenjana') ? 'C' : 
                        book.level.includes('Madya') ? 'D' : 
                        'E'}
                     </span>
                  </div>
               </div>

               {/* Full Cover Image with Overlay */}
               <div className="absolute inset-0 bg-gray-100 overflow-hidden">
                  <Image 
                     src={book.cover} 
                     alt={book.title} 
                     fill 
                     className={`object-cover transition-transform duration-1000 group-hover:scale-110 ${activeBookId === String(book.id) ? 'scale-110' : ''}`} 
                     unoptimized={typeof book.cover === 'string' && book.cover.startsWith('data:')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80"></div>
               </div>

               {/* Book Content - Modern Typography */}
               <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-lg font-black text-white leading-tight mb-2 line-clamp-2 drop-shadow-md">{book.title}</h3>
                  <div className="flex items-center gap-2 mb-4">
                     <span className="text-[10px] font-black text-white/80 tracking-widest uppercase flex items-center gap-1">
                       <span className="material-symbols-rounded text-sm">history_edu</span>
                       {book.level}
                     </span>
                  </div>
                  
                  {/* Action Button appeared on hover/click */}
                  <div className={`transition-all duration-500 overflow-hidden ${activeBookId === String(book.id) ? 'max-h-[200px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                     <p className="text-white/70 text-[11px] font-bold leading-relaxed mb-4 line-clamp-3">{book.desc}</p>
                     <Link href={`/explore/read/${book.id}`} className="bg-white text-primary font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 w-full transition-all hover:bg-primary hover:text-white shadow-xl">
                        <span>BACA SEKARANG</span>
                        <span className="material-symbols-rounded text-lg">menu_book</span>
                     </Link>
                  </div>
               </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
