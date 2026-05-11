"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useBooks } from "@/hooks/useBooks";
import dynamic from "next/dynamic";
import BrandLogo from "@/components/BrandLogo";
import { useProfile } from "@/lib/profile-context";
import { PointToast } from "@/components/PointToast";
import { StarFly } from "@/components/StarFly";
import QuickPinchZoom from "react-quick-pinch-zoom";

// Dynamically import react-pageflip to avoid SSR 'window is not defined' errors
const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });
const FlipBook = HTMLFlipBook as any;

const PageCover = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  return (
    <div className="w-full h-full bg-[#FFB347] border-4 border-[#E2E8F0] shadow-[0_0_10px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col justify-center items-center relative text-center" ref={ref} data-density="hard">
       {/* Background Image - Reduced by 10% */}
       {props.image && (
         <div className="absolute inset-0 z-0 flex items-center justify-center">
           <img src={props.image} alt="Cover" className="w-full h-full object-contain scale-90" />
         </div>
       )}
       
       <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_15%)] pointer-events-none z-20"></div>
    </div>
  );
});
PageCover.displayName = 'PageCover';

const Page = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  return (
    <div className="w-full h-full bg-[#FFFAF0] border-[1px] border-[#E2E8F0] bg-white flex flex-col items-center justify-center relative overflow-hidden" ref={ref}>
      {/* Background Gradient for fold shadow based on page position (left/right) */}
      <div className={`absolute inset-0 pointer-events-none z-0 ${props.number % 2 === 0 ? 'bg-[linear-gradient(to_left,rgba(0,0,0,0)_80%,rgba(0,0,0,0.05)_100%)]' : 'bg-[linear-gradient(to_right,rgba(0,0,0,0)_80%,rgba(0,0,0,0.05)_100%)]'}`}></div>
      
      {/* Small Logo at Top Right */}
      {!props.fullBleed && (
         <div className="absolute top-4 right-4 z-20 opacity-30 pointer-events-none">
            <BrandLogo size="sm" className="scale-75 origin-top-right" />
         </div>
      )}

      <div className={`w-full h-full ${props.fullBleed ? 'p-0' : 'p-6 md:p-12'} relative z-10 flex flex-col justify-center items-center`}>
         {props.children}
      </div>


    </div>
  );
});
Page.displayName = 'Page';

export default function ReadingRoom() {
  const { allBooks, isLoaded } = useBooks();
  const params = useParams();
  const bookId = params?.id as string;
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [currentFontConfig, setCurrentFontConfig] = useState({
     family: "font-sans",
     size: "text-xl md:text-2xl"
  });

  const [isNavVisible, setIsNavVisible] = useState(true);
  const navTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addPoints, profile, completeBook } = useProfile();
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
  const [pendingStars, setPendingStars] = useState<{ count: number; timestamp: number; positions: { x: number; y: number }[] }>({ count: 0, timestamp: 0, positions: [] });
  const [awardedPages, setAwardedPages] = useState<Set<number>>(new Set());
  const [pageStartTime, setPageStartTime] = useState(Date.now());
  const hasEarnedFinishRef = useRef(false);
  const flipBookRef = useRef<any>(null);
  const pinchZoomRef = useRef<any>(null);

  const onUpdate = React.useCallback(({ x, y, scale }: any) => {
    const el = document.getElementById("zoom-target");
    if (el) {
      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }
  }, []);

  // Hook for page timer
  useEffect(() => {
     setPageStartTime(Date.now());
  }, [currentPage]);

  // Hook for navigation auto-hide
  useEffect(() => {
     const resetNavVisibility = (e: MouseEvent) => {
        setIsNavVisible(true);
        if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
        
        if (e.clientY > 80) {
           navTimeoutRef.current = setTimeout(() => {
              setIsNavVisible(false);
           }, 2500);
        }
     };

     window.addEventListener('mousemove', resetNavVisibility);
     navTimeoutRef.current = setTimeout(() => setIsNavVisible(false), 3000);

     return () => {
        window.removeEventListener('mousemove', resetNavVisibility);
        if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
     };
  }, []);

  // Hook for fullscreen
  useEffect(() => {
     const handleFullscreenChange = () => {
        const isFull = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement);
        setIsFullscreen(isFull);
     };
     document.addEventListener('fullscreenchange', handleFullscreenChange);
     document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
     document.addEventListener('mozfullscreenchange', handleFullscreenChange);
     document.addEventListener('MSFullscreenChange', handleFullscreenChange);
     
     return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
     };
  }, []);

  const book = useMemo(() => allBooks.find(b => String(b.id) === String(bookId)), [allBooks, bookId]);

  // Convert linear sequence to Left/Right spread pairs
  const bookElements = useMemo(() => {
    if (!book) return [];
    const elements = [];
    const STORY_PAGES = book.pages;
    
    const levelCode = book.level.includes('Dini') ? 'A' : 
                     book.level.includes('B-1') ? 'B1' : 
                     book.level.includes('B-2') ? 'B2' : 
                     book.level.includes('B-3') ? 'B3' : 
                     book.level.includes('Awal') ? 'B' : 
                     book.level.includes('Semenjana') ? 'C' : 
                     book.level.includes('Madya') ? 'D' : 
                     'E';
                     
    elements.push(<PageCover key="cover" title={book.title} image={book.illustration} level={levelCode}></PageCover>);
    elements.push(<Page key="blank-1" number={0}><div className="opacity-30 flex flex-col items-center"><span className="material-symbols-rounded text-6xl">menu_book</span></div></Page>);

    let pageCounter = 1;
    elements.push(<Page key="title" number={pageCounter++}>
      <div className="flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl font-black text-[#FFB347] mb-4 drop-shadow-sm">{book.title}</h2>
        <p className="text-lg font-medium text-[#666666] leading-relaxed">{book.desc}</p>
      </div>
    </Page>);

    STORY_PAGES.forEach((pageData, index) => {
       const hasText = pageData.text && pageData.text.trim().length > 0;
       if (hasText) {
           elements.push(<Page key={`page-img-${index}`} number={pageCounter++}><div className="w-full h-[60vh] md:h-[65vh] max-h-[600px] relative rounded-2xl overflow-hidden border-4 border-[#E2E8F0] shadow-sm bg-white shrink-0"><Image src={pageData.image} alt={`Ilustrasi ${index + 1}`} fill className="object-contain" unoptimized={typeof pageData.image === 'string' && pageData.image.startsWith('data:')} /></div></Page>);
           elements.push(<Page key={`page-text-${index}`} number={pageCounter++}><span className="material-symbols-rounded absolute top-12 left-10 text-6xl text-[#E2E8F0] opacity-50 z-[1] hidden md:block">format_quote</span><div className="flex flex-col justify-center items-start h-full w-full px-2 md:px-8 relative z-10"><p className={`${currentFontConfig.size} ${currentFontConfig.family} font-medium leading-[1.8] text-[#333333] tracking-wide select-none transition-all duration-300 text-left`}>{pageData.text}</p></div></Page>);
       } else {
           elements.push(<Page key={`page-img-full-${index}`} number={pageCounter++} fullBleed={true}><div className="w-full h-full relative bg-white flex items-center justify-center overflow-hidden"><Image src={pageData.image} alt={`Ilustrasi ${index + 1}`} fill className="object-contain scale-90" unoptimized={typeof pageData.image === 'string' && pageData.image.startsWith('data:')} /></div></Page>);
       }
    });

    elements.push(<Page key="blank-end" number={pageCounter++}><div className="text-center"><h2 className="text-2xl font-black text-[#A0AEC0] mb-4">Tamat</h2></div></Page>);
    if (elements.length % 2 === 0) elements.push(<Page key="pad-blank" number={pageCounter++}><div /></Page>);
    elements.push(<PageCover key="back-cover" title={`${book.title}`} image={book.cover} />);
    
    return elements;
  }, [book, currentFontConfig]);

  const bookElementsCount = bookElements.length;
  const tamatPageIndex = useMemo(() => bookElements.findIndex(el => el.key === "blank-end"), [bookElements]);

  // Real-time point awarding effect
  useEffect(() => {
     const timer = setInterval(() => {
        const duration = Date.now() - pageStartTime;
        // 10 seconds threshold, not already awarded, and must be a content page (excluding covers and "Tamat" page)
        if (duration >= 10000 && !awardedPages.has(currentPage) && currentPage >= 2 && currentPage < tamatPageIndex) {
           setAwardedPages(prev => new Set(prev).add(currentPage));
           const now = Date.now();
           const positions = Array.from({ length: 5 }).map(() => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));
           setPendingStars({ count: 5, timestamp: now, positions });
        }
     }, 1000);
     return () => clearInterval(timer);
  }, [currentPage, pageStartTime, awardedPages, bookElementsCount]);

  // --- Early Returns (AFTER Hooks) ---
  if (!isLoaded) return <div className="min-h-screen bg-[#F0F8FF] flex items-center justify-center font-black text-[#A0AEC0] uppercase tracking-widest">Mempersiapkan Buku...</div>;
  if (!book) return (
    <div className="min-h-screen bg-[#F0F8FF] flex flex-col items-center justify-center p-10 text-center">
      <div className="w-20 h-20 bg-[#FFE2E5] text-[#FF4757] rounded-3xl flex items-center justify-center mb-6 border-4 border-[#FF4757]/10 shadow-sm"><span className="material-symbols-rounded text-5xl">sentiment_dissatisfied</span></div>
      <h2 className="text-2xl font-black text-[#333333] mb-4 uppercase">Buku Tidak Ditemukan</h2>
      <p className="text-[#A0AEC0] font-bold max-w-md mb-8">Maaf, koleksi buku ini mungkin sudah dihapus atau tidak tersedia.</p>
      <Link href="/explore/library" className="btn-bubbly rounded-full py-4 px-8">KEMBALI KE PERPUSTAKAAN</Link>
    </div>
  );

  // --- Handlers ---
  const toggleFullscreen = (e: React.MouseEvent) => {
     e.preventDefault();
     const doc = window.document;
     const docEl = doc.documentElement;
     const requestFullScreen = docEl.requestFullscreen || (docEl as any).mozRequestFullScreen || (docEl as any).webkitRequestFullScreen || (docEl as any).msRequestFullscreen;
     const cancelFullScreen = doc.exitFullscreen || (doc as any).mozCancelFullScreen || (doc as any).webkitExitFullscreen || (doc as any).msExitFullscreen;
     const currentFullScreen = doc.fullscreenElement || (doc as any).mozFullScreenElement || (doc as any).webkitFullscreenElement || (doc as any).msFullscreenElement;

     if (!currentFullScreen && !isCssFullscreen) {
        if (requestFullScreen) { requestFullScreen.call(docEl).catch(() => { setIsCssFullscreen(true); setIsFullscreen(true); }); }
        else { setIsCssFullscreen(true); setIsFullscreen(true); }
     } else {
        if (cancelFullScreen && currentFullScreen) cancelFullScreen.call(doc);
        setIsCssFullscreen(false); setIsFullscreen(false);
     }
  };

  const handleZoom = () => {
     if (pinchZoomRef.current) {
        pinchZoomRef.current.alignCenter({ scale: 1, x: 0, y: 0, animated: true });
     }
  };
  const nextButtonClick = () => flipBookRef.current?.pageFlip().flipNext();
  const prevButtonClick = () => flipBookRef.current?.pageFlip().flipPrev();
  
  const onPage = (e: any) => {
     const newPage = e.data;
     setCurrentPage(newPage);
     // Automatic points on last page removed per request
  };

  return (
    <div className="flex flex-col h-screen bg-[#E5E7EB] font-body text-[#333333] relative overflow-hidden">
      <header className={`bg-white px-4 md:px-8 py-3 flex w-full items-center justify-between z-[60] shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-b border-[#E2E8F0] absolute top-0 left-0 right-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isNavVisible ? 'translate-y-0' : '-translate-y-full'}`} onMouseEnter={() => setIsNavVisible(true)}>
         <div className="w-12 md:w-48 flex justify-start items-center gap-2">
            <Link href="/explore/library" className="w-10 h-10 flex items-center justify-center rounded-full text-[#A0AEC0] hover:text-[#FFB347] hover:bg-[#F8FAFC] transition-all">
               <span className="material-symbols-rounded text-2xl">arrow_back</span>
            </Link>
         </div>
         <div className="text-center animate-bounce-in flex-1">
            <h1 className="text-sm md:text-base font-bold text-[#4B5563] flex items-center justify-center gap-2">
               <span className="material-symbols-rounded text-[#8B5CF6] text-lg">menu_book</span>
               {book.title}
            </h1>
         </div>
         <div className="flex items-center gap-3 relative w-auto md:w-48 justify-end">
             {/* Total Points in Top Right */}
             <div id="navbar-points" className="flex items-center gap-1.5 bg-[#FFFBEB] px-3 py-1 rounded-full border-2 border-[#FEF3C7] shadow-sm">
                <span className="text-sm">⭐</span>
                <span className="text-xs font-black text-[#D97706]">{profile.points}</span>
             </div>

             <button onClick={() => setShowFontMenu(!showFontMenu)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${showFontMenu ? 'bg-[#FFB347] text-white' : 'text-[#A0AEC0] hover:bg-[#F8FAFC] hover:text-[#FFB347]'}`}><span className="material-symbols-rounded text-2xl">text_format</span></button>
             {showFontMenu && (
               <div className="absolute top-12 right-0 w-64 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl p-4 z-50 animate-bounce-in">
                  <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest mb-3">Ukuran Huruf</p>
                  <div className="flex gap-2 mb-4">
                     <button onClick={() => setCurrentFontConfig({...currentFontConfig, size: "text-lg md:text-xl"})} className={`flex-1 py-1.5 rounded-xl text-sm font-bold border-2 transition-all ${currentFontConfig.size === "text-lg md:text-xl" ? 'bg-[#FFB347] text-white border-[#E69A2E]' : 'bg-[#F8FAFC] text-[#666666] border-transparent hover:border-[#E2E8F0]'}`}>A-</button>
                     <button onClick={() => setCurrentFontConfig({...currentFontConfig, size: "text-xl md:text-2xl"})} className={`flex-1 py-1.5 rounded-xl text-base font-bold border-2 transition-all ${currentFontConfig.size === "text-xl md:text-2xl" ? 'bg-[#FFB347] text-white border-[#E69A2E]' : 'bg-[#F8FAFC] text-[#666666] border-transparent hover:border-[#E2E8F0]'}`}>A</button>
                     <button onClick={() => setCurrentFontConfig({...currentFontConfig, size: "text-2xl md:text-3xl"})} className={`flex-1 py-1.5 rounded-xl text-lg font-bold border-2 transition-all ${currentFontConfig.size === "text-2xl md:text-3xl" ? 'bg-[#FFB347] text-white border-[#E69A2E]' : 'bg-[#F8FAFC] text-[#666666] border-transparent hover:border-[#E2E8F0]'}`}>A+</button>
                  </div>
                  <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest mb-3">Jenis Huruf</p>
                  <div className="space-y-2">
                     {[{id: "font-sans", label: "Modern"}, {id: "font-serif", label: "Klasik"}, {id: "font-mono", label: "Mesin Tik"}].map(font => (
                        <button key={font.id} onClick={() => setCurrentFontConfig({...currentFontConfig, family: font.id})} className={`w-full text-left px-4 py-2 ${font.id} rounded-xl text-sm font-bold border-2 transition-all ${currentFontConfig.family === font.id ? 'bg-[#87CEEB] text-white border-[#5AAFD1]' : 'bg-[#F8FAFC] text-[#666666] border-transparent hover:border-[#E2E8F0]'}`}>{font.label}</button>
                     ))}
                  </div>
               </div>
             )}
          </div>
      </header>

      <main className={`flex-1 flex w-full relative overflow-hidden transition-all duration-300 ${isCssFullscreen ? 'fixed inset-0 z-[100] bg-[#E5E7EB]' : 'z-10 pt-16'}`}>
        <div className="absolute inset-0 z-20 overflow-hidden">
          <QuickPinchZoom 
            ref={pinchZoomRef} 
            onUpdate={onUpdate} 
            wheelScaleFactor={500} 
            draggableUnZoomed={true}
            enabled={true}
            minZoom={0.5}
            maxZoom={5}
            enforceBoundsDuringZoom={false}
            centerContained={false}
            containerProps={{
              style: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }
            }}
          >
            <div id="zoom-target" className="flex items-center justify-center p-4 md:p-8 transition-none will-change-transform">
               <div className={`w-[90vw] md:w-[75vw] max-w-[1000px] h-[60vh] md:h-[65vh] max-h-[600px] flex items-center justify-center`}>
                  <FlipBook width={550} height={750} size="stretch" minWidth={300} maxWidth={1200} minHeight={400} maxHeight={750} maxShadowOpacity={0.5} showCover={true} mobileScrollSupport={true} usePortrait={false} onFlip={onPage} className="flip-book-custom" ref={flipBookRef} useMouseEvents={true}>
                      {bookElements}
                  </FlipBook>
               </div>
            </div>
          </QuickPinchZoom>
        </div>

        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-between px-2 md:px-8">
            <button onClick={prevButtonClick} className={`w-12 h-12 md:w-16 md:h-16 bg-[#4B5563] text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:bg-[#374151] hover:scale-105 active:scale-95 pointer-events-auto opacity-70 hover:opacity-100 ${currentPage === 0 ? 'invisible' : ''}`}><span className="material-symbols-rounded text-2xl md:text-3xl pr-1">arrow_back_ios</span></button>
            <button onClick={nextButtonClick} className={`w-12 h-12 md:w-16 md:h-16 bg-[#4B5563] text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:bg-[#374151] hover:scale-105 active:scale-95 pointer-events-auto opacity-70 hover:opacity-100 ${(currentPage >= bookElementsCount - 2) ? 'invisible' : ''}`}><span className="material-symbols-rounded text-2xl md:text-3xl pl-1">arrow_forward_ios</span></button>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-50 flex">
           <div className="bg-[#1F2937] text-white px-6 py-3 rounded-full shadow-2xl flex items-center justify-center gap-6 pointer-events-auto">
              <span className="text-sm font-medium tracking-wide">{currentPage} / {bookElementsCount - 1}</span>
              <div className="h-4 w-px bg-white/20"></div>
              <Link href="/explore/library" className="hover:text-[#FFB347] transition-colors"><span className="material-symbols-rounded text-xl">home</span></Link>
              <button onClick={handleZoom} className="hover:text-[#FFB347] transition-colors"><span className="material-symbols-rounded text-xl">zoom_in</span></button>
              <button onClick={toggleFullscreen} className="hover:text-[#FFB347] transition-colors"><span className="material-symbols-rounded text-xl">{isFullscreen || isCssFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span></button>
           </div>
        </div>


       <StarFly burst={pendingStars} onStarHit={() => addPoints(1)} />
      </main>
    </div>
  );
}
