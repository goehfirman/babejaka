"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useBooks } from "@/hooks/useBooks";

const READER_LEVELS = ["Pembaca Dini", "Pembaca Awal", "Pembaca Semenjana", "Pembaca Madya", "Pembaca Mahir"];
const READER_GRADES = ["A", "B-1", "B-2", "B-3", "B-4", "C", "D", "E"];
const SDG_CATEGORIES = [
  "SDG 1 - Tanpa Kemiskinan",
  "SDG 2 - Tanpa Kelaparan",
  "SDG 3 - Kesehatan yang Baik",
  "SDG 4 - Pendidikan Berkualitas",
  "SDG 5 - Kesetaraan Gender",
  "SDG 6 - Air Bersih & Sanitasi",
  "SDG 7 - Energi Bersih & Terjangkau",
  "SDG 8 - Pekerjaan Layak",
  "SDG 9 - Industri & Inovasi",
  "SDG 10 - Mengurangi Kesenjangan",
  "SDG 11 - Kota Berkelanjutan",
  "SDG 12 - Konsumsi Bertanggung Jawab",
  "SDG 13 - Aksi Iklim",
  "SDG 14 - Ekosistem Laut",
  "SDG 15 - Ekosistem Darat",
  "SDG 16 - Perdamaian & Keadilan",
  "SDG 17 - Kemitraan Global",
];

interface BookPage {
  text: string;
  imagePreview: string | null;
}

export default function EditBook() {
  const params = useParams();
  const bookId = params?.id as string;
  const { getBookById, updateBook, isLoaded } = useBooks();
  
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("BABE JAKA Team"); // Default for now
  const [level, setLevel] = useState("");
  const [grade, setGrade] = useState("");
  const [sdg, setSdg] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfFileSize, setPdfFileSize] = useState<string | null>(null);
  const [pages, setPages] = useState<BookPage[]>([
    { text: "", imagePreview: null },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saveType, setSaveType] = useState<"draft" | "publish">("draft");

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Load existing data
  useEffect(() => {
    if (isLoaded && bookId) {
      const existingBook = getBookById(bookId);
      if (existingBook) {
        setTitle(existingBook.title);
        setSdg(existingBook.theme);
        setSynopsis(existingBook.desc);
        setCoverPreview(existingBook.cover);
        setLevel(existingBook.level);
        setGrade(existingBook.grade);
        
        // Map pages
        if (existingBook.pages && existingBook.pages.length > 0) {
          setPages(existingBook.pages.map(p => ({
            text: p.text,
            imagePreview: p.image
          })));
        }

        // Handle additional metadata if any (author, grade)
        if ((existingBook as any).isLocal) {
          setAuthor("Unggahan Saya");
        }
      }
    }
  }, [isLoaded, bookId, getBookById]);

  if (!isLoaded) return <div className="min-h-screen bg-[#F0F8FF] flex items-center justify-center font-black text-[#A0AEC0] uppercase tracking-widest">Memuat Data Buku...</div>;

  const handleSubmit = async (type: "draft" | "publish") => {
    if (!title.trim() || !level || !grade || !sdg) {
      alert("Mohon lengkapi data wajib (Judul, Level, Jenjang, dan SDG) sebelum menyimpan.");
      return;
    }

    setSaveType(type);
    setIsSubmitting(true);

    const updatedBook = {
      title,
      theme: sdg,
      desc: synopsis,
      cover: coverPreview || "/images/books/ocean_cover.png",
      illustration: pages[0]?.imagePreview || "/images/books/ocean_illustration.png",
      level,
      grade,
      pages: pages.map(p => ({
        text: p.text,
        image: p.imagePreview || "/images/books/ocean_illustration.png"
      }))
    };

    try {
      await updateBook(bookId, updatedBook, (progress, message) => {
        setUploadProgress(progress);
        setUploadStatus(message);
      });
      setIsSubmitting(false);
      setShowSuccessModal(true);

      setTimeout(() => {
        window.location.href = "/admin/books";
      }, 2000);
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui buku. Silakan cek konfigurasi Firebase Anda.");
      setIsSubmitting(false);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCover = () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setCoverPreview("https://api.dicebear.com/9.x/shapes/svg?seed=" + encodeURIComponent(aiPrompt));
      setIsGenerating(false);
    }, 2000);
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setPdfFileSize(`${sizeMB} MB`);
    }
  };

  const addPage = () => {
    setPages([...pages, { text: "", imagePreview: null }]);
  };

  const removePage = (index: number) => {
    if (pages.length <= 1) return;
    setPages(pages.filter((_, i) => i !== index));
  };

  const updatePageText = (index: number, text: string) => {
    const newPages = [...pages];
    newPages[index].text = text;
    setPages(newPages);
  };

  const handlePageImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPages = [...pages];
        newPages[index].imagePreview = reader.result as string;
        setPages(newPages);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePageImage = (index: number) => {
    const newPages = [...pages];
    newPages[index].imagePreview = null;
    setPages(newPages);
  };

  const inputClass = "w-full px-5 py-4 bg-white border-4 border-[#E2E8F0] rounded-2xl text-base font-bold text-[#333333] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#FFB347] transition-all shadow-sm";
  const selectClass = "w-full px-5 py-4 bg-white border-4 border-[#E2E8F0] rounded-2xl text-base font-bold text-[#333333] focus:outline-none focus:border-[#FFB347] transition-all shadow-sm appearance-none cursor-pointer";
  const labelClass = "text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] mb-2 block";

  return (
    <div className="min-h-screen bg-[#F0F8FF] font-body text-[#333333] flex">
      
      <aside className="w-72 bg-white border-r-4 border-[#E2E8F0] shadow-sm flex flex-col fixed h-full z-50">
        <div className="p-8 border-b-4 border-[#E2E8F0] flex flex-col items-center">
          <Link href="/" className="hover:scale-105 transition-transform flex items-center justify-center gap-2 mb-2">
             <Image src="https://i.ibb.co.com/cXwhYkn7/Desain-tanpa-judul-21.png" alt="BABE JAKA Logo" width={140} height={45} className="object-contain drop-shadow-md" />
          </Link>
          <p className="text-[10px] font-black text-[#5AAFD1] uppercase tracking-[0.4em]">Panel Admin</p>
        </div>

        <nav className="flex-1 p-6 space-y-3">
            {[
              { icon: 'dashboard', label: 'Beranda', active: false, href: '/admin' },
              { icon: 'group', label: 'Manajemen Pengguna', active: false, href: '/admin/users' },
              { icon: 'menu_book', label: 'Pengaturan Buku', active: true, href: '/admin/books' },
              { icon: 'library_books', label: 'Kurikulum SDG', active: false },
              { icon: 'analytics', label: 'Statistik Platform', active: false },
              { icon: 'settings', label: 'Pengaturan', active: false },
            ].map((item) => (
             <Link key={item.label} href={item.href || '#'} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold border-2 ${item.active ? 'bg-[#FFB347] text-white border-[#E69A2E] shadow-[0_4px_0_#E69A2E]' : 'bg-transparent text-[#A0AEC0] border-transparent hover:border-[#E2E8F0] hover:bg-[#F8FAFC]'}`}>
                <span className="material-symbols-rounded text-2xl">{item.icon}</span>
                <span className="text-sm uppercase tracking-wide">{item.label}</span>
             </Link>
           ))}
        </nav>

         <div className="p-6 border-t-4 border-[#E2E8F0]">
            <Link href="/" className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-[#A0AEC0] hover:bg-[#FF4757]/10 hover:text-[#FF4757] transition-colors text-xs font-black uppercase tracking-widest border-2 border-transparent hover:border-[#FF4757]/20">
               <span className="material-symbols-rounded">logout</span>
               KELUAR
            </Link>
         </div>
      </aside>

      <main className="flex-1 ml-72 min-h-screen relative overflow-hidden pb-20">
        
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full opacity-60 blur-3xl -translate-y-1/2 translate-x-1/3"></div>

         <header className="px-10 py-8 flex justify-between items-center relative z-10 border-b-4 border-white">
            <div className="flex items-center gap-4">
               <Link href="/admin/books" className="w-10 h-10 flex items-center justify-center rounded-full text-[#A0AEC0] hover:text-[#FFB347] hover:bg-[#F8FAFC] transition-all border-2 border-[#E2E8F0]">
                  <span className="material-symbols-rounded text-2xl">arrow_back</span>
               </Link>
              <div>
                 <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-[#333333]">Ubah <span className="text-[#FFB347]">Buku</span></h1>
                 <p className="text-sm font-bold text-[#A0AEC0] mt-1">Perbarui detail dan isi buku Anda</p>
              </div>
           </div>
        </header>

        <div className="p-10 relative z-10 max-w-5xl">
           
           {/* BASIC INFO */}
           <div className="bg-white rounded-[32px] p-8 md:p-10 border-4 border-[#E2E8F0] shadow-sm mb-8">
              <div className="flex items-center gap-3 mb-8 border-b-4 border-[#F8FAFC] pb-4">
                 <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FFF3E0] border-2 border-[#FFE0B2] text-[#FFB347]">
                    <span className="material-symbols-rounded text-xl">edit_note</span>
                 </div>
                 <h2 className="text-xl font-black uppercase tracking-tight text-[#333333]">Informasi Dasar</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                    <label className={labelClass}>Judul Buku *</label>
                    <input type="text" placeholder="Masukkan judul buku..." value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
                 </div>

                 <div className="md:col-span-2">
                    <label className={labelClass}>Pengarang *</label>
                    <input type="text" placeholder="Nama penulis buku..." value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} readOnly />
                 </div>

                 <div>
                    <label className={labelClass}>Level Pembaca *</label>
                    <div className="relative">
                       <select value={level} onChange={(e) => setLevel(e.target.value)} className={selectClass}>
                          <option value="" disabled>Pilih level...</option>
                          {READER_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                       </select>
                       <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AEC0] pointer-events-none">expand_more</span>
                    </div>
                 </div>

                 <div>
                    <label className={labelClass}>Jenjang Pembaca *</label>
                    <div className="relative">
                       <select value={grade} onChange={(e) => setGrade(e.target.value)} className={selectClass}>
                          <option value="" disabled>Pilih jenjang...</option>
                          {READER_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                       </select>
                       <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AEC0] pointer-events-none">expand_more</span>
                    </div>
                 </div>

                 <div className="md:col-span-2">
                    <label className={labelClass}>Kategori SDGs *</label>
                    <div className="relative">
                       <select value={sdg} onChange={(e) => setSdg(e.target.value)} className={selectClass}>
                          <option value="" disabled>Pilih kategori SDGs...</option>
                          {SDG_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                       </select>
                       <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AEC0] pointer-events-none">expand_more</span>
                    </div>
                 </div>

                 <div className="md:col-span-2">
                    <label className={labelClass}>Sinopsis / Deskripsi Singkat *</label>
                    <textarea 
                       placeholder="Jelaskan singkat mengenai isi buku..." 
                       value={synopsis} 
                       onChange={(e) => setSynopsis(e.target.value)} 
                       className={`${inputClass} min-h-[140px] resize-y`}
                       rows={4}
                    />
                 </div>
              </div>
           </div>

           {/* COVER */}
           <div className="bg-white rounded-[32px] p-8 md:p-10 border-4 border-[#E2E8F0] shadow-sm mb-8">
              <div className="flex items-center gap-3 mb-8 border-b-4 border-[#F8FAFC] pb-4">
                 <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#E0F2FE] border-2 border-[#BAE6FD] text-[#5AAFD1]">
                    <span className="material-symbols-rounded text-xl">image</span>
                 </div>
                 <h2 className="text-xl font-black uppercase tracking-tight text-[#333333]">Sampul Buku</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <label className={labelClass}>Unggah Gambar Sampul</label>
                    <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverUpload} className="hidden" />
                    <button 
                       onClick={() => coverInputRef.current?.click()} 
                       className="w-full h-48 border-4 border-dashed border-[#E2E8F0] rounded-2xl flex flex-col items-center justify-center gap-3 text-[#A0AEC0] hover:border-[#FFB347] hover:text-[#FFB347] hover:bg-[#FFF3E0]/30 transition-all cursor-pointer group"
                    >
                       <span className="material-symbols-rounded text-4xl group-hover:scale-110 transition-transform">cloud_upload</span>
                       <span className="text-xs font-black uppercase tracking-widest">Ganti Sampul</span>
                    </button>
                    
                    <div className="mt-6">
                       <label className={labelClass}>Atau Ganti dengan AI ✨</label>
                       <div className="flex gap-3">
                          <input 
                             type="text" 
                             placeholder="Prompt AI baru..." 
                             value={aiPrompt} 
                             onChange={(e) => setAiPrompt(e.target.value)} 
                             className={`${inputClass} flex-1 !py-3`}
                          />
                          <button 
                             onClick={handleGenerateCover}
                             disabled={isGenerating || !aiPrompt.trim()}
                             className={`px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider border-4 transition-all flex items-center gap-2 shrink-0 ${isGenerating ? 'bg-[#F8FAFC] text-[#A0AEC0] border-[#E2E8F0] cursor-wait' : 'bg-[#FFB347] text-white border-[#E69A2E] shadow-[0_4px_0_#E69A2E] hover:shadow-[0_2px_0_#E69A2E]'}`}
                          >
                             {isGenerating ? 'Generating...' : 'Generate'}
                          </button>
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className={labelClass}>Preview Sampul</label>
                    <div className="w-full aspect-[3/4] rounded-2xl border-4 border-[#E2E8F0] overflow-hidden bg-[#F8FAFC] flex items-center justify-center relative">
                       {coverPreview ? (
                          <Image src={coverPreview} alt="Cover Preview" fill className="object-cover" unoptimized />
                       ) : (
                          <div className="flex flex-col items-center gap-2 text-[#A0AEC0]">
                             <span className="material-symbols-rounded text-5xl">photo_library</span>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           {/* PAGES */}
           <div className="bg-white rounded-[32px] p-8 md:p-10 border-4 border-[#E2E8F0] shadow-sm mb-8">
              <div className="flex items-center justify-between mb-8 border-b-4 border-[#F8FAFC] pb-4">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#D1FAE5] border-2 border-[#A7F3D0] text-emerald-500">
                       <span className="material-symbols-rounded text-xl">auto_stories</span>
                    </div>
                    <div>
                       <h2 className="text-xl font-black uppercase tracking-tight text-[#333333]">Halaman Buku</h2>
                    </div>
                 </div>
                 <button 
                    onClick={addPage}
                    className="px-5 py-3 rounded-2xl text-sm font-black uppercase tracking-wider bg-[#FFB347] text-white border-4 border-[#E69A2E] shadow-[0_4px_0_#E69A2E] transition-all flex items-center gap-2"
                 >
                    <span className="material-symbols-rounded text-lg">add</span>
                    Tambah Halaman
                 </button>
              </div>

              <div className="space-y-6">
                 {pages.map((page, index) => (
                    <div key={index} className="bg-[#F8FAFC] rounded-2xl p-6 border-2 border-[#E2E8F0] relative group">
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-xl bg-[#FFB347] text-white flex items-center justify-center text-sm font-black border-2 border-[#E69A2E]">
                                {index + 1}
                             </div>
                             <span className="text-xs font-black text-[#666666] uppercase tracking-widest">Halaman {index + 1}</span>
                          </div>
                          {pages.length > 1 && (
                             <button onClick={() => removePage(index)} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#A0AEC0] hover:text-[#FF4757] transition-all">
                                <span className="material-symbols-rounded text-lg">delete</span>
                             </button>
                          )}
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                             <textarea 
                                value={page.text} 
                                onChange={(e) => updatePageText(index, e.target.value)} 
                                className={`${inputClass} min-h-[180px]`}
                                rows={6}
                             />
                          </div>
                          <div>
                             {page.imagePreview ? (
                                <div className="w-full aspect-[4/3] rounded-2xl border-4 border-[#E2E8F0] overflow-hidden relative bg-white">
                                   <Image src={page.imagePreview} alt={`Halaman ${index + 1}`} fill className="object-cover" unoptimized />
                                   <button onClick={() => removePageImage(index)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-[#FF4757] flex items-center justify-center">
                                      <span className="material-symbols-rounded text-lg">close</span>
                                   </button>
                                </div>
                             ) : (
                                <label className="w-full aspect-[4/3] border-4 border-dashed border-[#E2E8F0] rounded-2xl flex flex-col items-center justify-center gap-3 text-[#A0AEC0] cursor-pointer">
                                   <input type="file" accept="image/*" onChange={(e) => handlePageImageUpload(index, e)} className="hidden" />
                                   <span className="material-symbols-rounded text-4xl">add_photo_alternate</span>
                                   <span className="text-xs font-black">Ganti Gambar</span>
                                </label>
                             )}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 justify-end sticky bottom-0 bg-[#F0F8FF]/90 backdrop-blur-xl py-6 -mx-10 px-10 border-t-4 border-[#E2E8F0] rounded-t-3xl z-40">
              <Link href="/admin/books" className="px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider bg-white text-[#A0AEC0] border-4 border-[#E2E8F0] hover:text-[#666666] transition-all">
                 Batal
              </Link>
              <button 
                 disabled={isSubmitting}
                 onClick={() => handleSubmit("publish")}
                 className={`px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider bg-[#FFB347] text-white border-4 border-[#E69A2E] shadow-[0_4px_0_#E69A2E] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50' : ''}`}
              >
                 {isSubmitting ? 'Memproses...' : 'Simpan Perubahan'}
              </button>
           </div>

            {/* Submission Overlay with Progress */}
            {isSubmitting && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                 <div className="absolute inset-0 bg-[#333333]/40 backdrop-blur-sm animate-fade-in"></div>
                 <div className="bg-white rounded-[40px] p-10 border-4 border-[#E2E8F0] shadow-2xl relative z-10 max-w-sm w-full text-center animate-bounce-in">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#F8FAFC] border-4 border-[#E2E8F0] relative overflow-hidden">
                       <div 
                         className="absolute bottom-0 left-0 right-0 bg-[#FFB347] transition-all duration-500 ease-out" 
                         style={{ height: `${uploadProgress}%` }}
                       />
                       <span className="material-symbols-rounded text-3xl relative z-10 text-[#FFB347] animate-pulse">
                          sync
                       </span>
                    </div>
                    <h3 className="text-xl font-black text-[#333333] uppercase tracking-tighter mb-2">
                       Memperbarui Buku...
                    </h3>
                    <p className="text-[#A0AEC0] font-bold text-xs leading-relaxed mb-6 h-8 flex items-center justify-center uppercase tracking-wide px-4">
                       {uploadStatus || "Memulai pembaruan..."}
                    </p>
                    
                    {/* Progress Bar Container */}
                    <div className="relative h-4 w-full bg-[#F8FAFC] rounded-full overflow-hidden border-2 border-[#E2E8F0] mb-2">
                       <div 
                         className="h-full bg-gradient-to-r from-[#FFB347] to-[#FF9040] transition-all duration-500 ease-out flex items-center justify-end px-2"
                         style={{ width: `${uploadProgress}%` }}
                       >
                          {uploadProgress > 15 && (
                            <span className="text-[8px] font-black text-white">{uploadProgress}%</span>
                          )}
                       </div>
                    </div>
                    <p className="text-[10px] font-black text-[#5AAFD1] uppercase tracking-[0.2em] animate-pulse">
                       Mohon jangan tutup halaman ini
                    </p>
                 </div>
              </div>
            )}

           {showSuccessModal && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-[#333333]/40 backdrop-blur-sm"></div>
                <div className="bg-white rounded-[40px] p-10 border-4 border-[#E2E8F0] shadow-2xl relative z-10 max-w-sm w-full text-center">
                   <div className="w-24 h-24 rounded-full bg-emerald-100 border-8 border-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                      <span className="material-symbols-rounded text-5xl">verified</span>
                   </div>
                   <h3 className="text-2xl font-black text-[#333333] uppercase tracking-tighter mb-2">Berhasil Diperbarui!</h3>
                   <p className="text-[#666666] font-bold text-sm leading-relaxed mb-8">Data buku Anda telah berhasil diperbarui di sistem.</p>
                   <div className="h-2 w-full bg-[#F0F8FF] rounded-full overflow-hidden border-2 border-[#E2E8F0]">
                      <div className="h-full bg-[#FF4757] animate-progress-shrink"></div>
                   </div>
                </div>
             </div>
           )}

        </div>
      </main>
    </div>
  );
}
