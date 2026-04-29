"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBooks } from "@/hooks/useBooks";

export default function AdminBooks() {
  const { allBooks, deleteBook, isLoaded, error } = useBooks();
  const [bookToDelete, setBookToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (error) return (
    <div className="min-h-screen bg-[#F0F8FF] flex flex-col items-center justify-center p-10 text-center">
      <div className="w-20 h-20 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center mb-6 border-4 border-red-200">
        <span className="material-symbols-rounded text-5xl">warning</span>
      </div>
      <h2 className="text-2xl font-black text-[#333333] mb-4 uppercase">Masalah Koneksi Cloud</h2>
      <p className="text-[#A0AEC0] font-bold max-w-md mb-8">
        {error}
      </p>
      <Link href="/admin" className="btn-bubbly rounded-full py-4 px-8">
        KEMBALI KE BERANDA
      </Link>
    </div>
  );

  if (!isLoaded) return <div className="min-h-screen bg-[#F0F8FF] flex items-center justify-center font-black text-[#A0AEC0] uppercase tracking-widest">Memuat...</div>;

  const handleDelete = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBook(bookToDelete.id);
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus buku dari server.");
    } finally {
      setIsDeleting(false);
      setBookToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F8FF] font-body text-[#333333] flex">
      
      {/* Sidebar */}
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
             { icon: 'menu_book', label: 'Pengaturan Buku', active: true },
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

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen relative overflow-hidden pb-20">
        
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full opacity-60 blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        {/* Header */}
        <header className="px-10 py-8 flex justify-between items-center relative z-10 border-b-4 border-white">
           <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-[#333333]">Pengaturan <span className="text-[#5AAFD1]">Buku</span></h1>
              <p className="text-sm font-bold text-[#A0AEC0] mt-2">Kelola koleksi buku digital untuk seluruh pengguna</p>
           </div>
           
           <Link href="/admin/books/new" className="btn-bubbly rounded-full py-4 px-6 text-sm flex items-center gap-2 !bg-[#5AAFD1] !border-[#4691B0] !shadow-[0_4px_0_#4691B0]">
              <span className="material-symbols-rounded text-lg">add</span>
              TAMBAH BUKU BARU
           </Link>
        </header>

        {/* Content */}
        <div className="p-10 relative z-10">
           
           {/* Stats */}
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-3xl p-6 border-4 border-[#E2E8F0] shadow-sm flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-blue-100 bg-blue-50 text-[#5AAFD1]">
                    <span className="material-symbols-rounded text-3xl">auto_stories</span>
                 </div>
                 <div>
                    <div className="text-3xl font-black text-[#333333]">{allBooks.length}</div>
                    <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">Total Buku</p>
                 </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border-4 border-[#E2E8F0] shadow-sm flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-emerald-200 bg-emerald-100 text-emerald-500">
                    <span className="material-symbols-rounded text-3xl">check_circle</span>
                 </div>
                 <div>
                    <div className="text-3xl font-black text-[#333333]">{allBooks.length}</div>
                    <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">Terpublikasi</p>
                 </div>
              </div>
              <div className="bg-white rounded-3xl p-6 border-4 border-[#E2E8F0] shadow-sm flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-blue-200 bg-blue-100 text-blue-500">
                    <span className="material-symbols-rounded text-3xl">draft</span>
                 </div>
                 <div>
                    <div className="text-3xl font-black text-[#333333]">0</div>
                    <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">Draft</p>
                 </div>
              </div>
           </div>

           {/* Book Table */}
           <div className="bg-white border-4 border-[#E2E8F0] shadow-sm rounded-[32px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b-4 border-[#E2E8F0] bg-[#F8FAFC]">
                       <th className="px-8 py-5 text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em]">Buku</th>
                       <th className="px-6 py-5 text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em]">Level</th>
                       <th className="px-6 py-5 text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em]">Kategori SDGs</th>
                       <th className="px-6 py-5 text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em]">Halaman</th>
                       <th className="px-6 py-5 text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em]">Status</th>
                       <th className="px-8 py-5 text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] text-right">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y-2 divide-[#E2E8F0]">
                    {allBooks.map((book) => (
                       <tr key={book.id} className="hover:bg-[#F0F8FF] transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-[#E2E8F0] shadow-sm relative shrink-0 bg-[#F8FAFC]">
                                   <Image 
                                       src={book.cover} 
                                       alt={book.title} 
                                       fill 
                                       className="object-cover" 
                                       unoptimized={typeof book.cover === 'string' && book.cover.startsWith('data:')}
                                    />
                                </div>
                                <div>
                                   <p className="text-base font-black text-[#333333] leading-tight group-hover:text-[#5AAFD1] transition-colors mb-1">{book.title}</p>
                                   <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest leading-none">{book.isLocal ? 'Unggahan Admin' : 'BABE JAKA Team'}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-6">
                             <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-wider border-2 ${
                                book.level === 'Pembaca Dini' ? 'bg-[#5AAFD1] border-[#4691B0]' : 
                                book.level === 'Pembaca Awal' ? 'bg-[#FF4757] border-[#D63031]' : 
                                book.level === 'Pembaca Semenjana' ? 'bg-[#34D399] border-[#059669]' : 
                                book.level === 'Pembaca Madya' ? 'bg-[#5AAFD1] border-[#3894B7]' : 
                                'bg-[#8E44AD] border-[#6C3483]'
                             }`}>
                                {book.level}
                             </span>
                          </td>
                          <td className="px-6 py-6">
                             <span className="text-sm font-bold text-[#666666] bg-[#F8FAFC] px-3 py-2 rounded-xl border-2 border-[#E2E8F0]">{book.theme}</span>
                          </td>
                          <td className="px-6 py-6">
                             <span className="text-sm font-black text-[#333333]">{book.pages.length} hal</span>
                          </td>
                          <td className="px-6 py-6">
                             <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${book.isLocal ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-[#D1FAE5] text-[#059669] border-[#34D399]'}`}>
                                {book.isLocal ? 'Lokal' : 'Publik'}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex justify-end gap-2">
                                <Link href={`/explore/read/${book.id}`} className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[#E2E8F0] hover:bg-[#F0F8FF] hover:border-[#87CEEB] hover:text-[#87CEEB] rounded-2xl text-[#A0AEC0] transition-all shadow-sm" title="Pratinjau">
                                   <span className="material-symbols-rounded text-xl">visibility</span>
                                </Link>
                                <Link 
                                   href={`/admin/books/edit/${book.id}`}
                                   className={`w-10 h-10 flex items-center justify-center bg-white border-2 border-[#E2E8F0] rounded-2xl transition-all shadow-sm ${book.isLocal ? 'hover:bg-[#FFF3E0] hover:border-[#FFB347] hover:text-[#FFB347] text-[#A0AEC0]' : 'opacity-30 cursor-not-allowed pointer-events-none text-[#A0AEC0]'}`}
                                   title="Ubah Buku"
                                >
                                   <span className="material-symbols-rounded text-xl">edit</span>
                                </Link>
                                <button 
                                   onClick={() => setBookToDelete(book)}
                                   disabled={!book.isLocal}
                                   className={`w-10 h-10 flex items-center justify-center bg-white border-2 border-[#E2E8F0] rounded-2xl transition-all shadow-sm ${book.isLocal ? 'hover:bg-[#FFE2E5] hover:border-[#FF4757] hover:text-[#FF4757] text-[#A0AEC0]' : 'opacity-30 cursor-not-allowed text-[#A0AEC0]'}`}
                                   title="Hapus Buku"
                                >
                                   <span className="material-symbols-rounded text-xl">delete</span>
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A202C]/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-md p-8 border-4 border-[#FF4757]/20 shadow-2xl animate-in zoom-in-95 duration-300">
               <div className="w-20 h-20 bg-[#FFE2E5] text-[#FF4757] rounded-3xl flex items-center justify-center mb-6 mx-auto border-4 border-[#FF4757]/10">
                  <span className="material-symbols-rounded text-5xl">delete_forever</span>
               </div>
               <h3 className="text-2xl font-black text-center text-[#333333] mb-2 uppercase tracking-tighter">Hapus Buku?</h3>
               <p className="text-[#A0AEC0] text-center font-bold mb-8">
                  Apakah Anda yakin ingin menghapus <span className="text-[#FF4757]">"{bookToDelete.title}"</span>? Tindakan ini tidak dapat dibatalkan.
               </p>
               <div className="grid grid-cols-2 gap-4">
                  <button 
                     onClick={() => setBookToDelete(null)}
                     className="py-4 rounded-2xl font-black text-[#A0AEC0] bg-[#F8FAFC] border-4 border-[#E2E8F0] hover:bg-[#EDF2F7] transition-all uppercase tracking-widest text-xs"
                  >
                     Batal
                  </button>
                  <button 
                     onClick={handleDelete}
                     disabled={isDeleting}
                     className="py-4 rounded-2xl font-black text-white bg-[#FF4757] border-4 border-[#D63031] shadow-[0_6px_0_#D63031] hover:translate-y-1 hover:shadow-[0_2px_0_#D63031] transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                  >
                     {isDeleting ? (
                        <>
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           MENGHAPUS...
                        </>
                     ) : 'HAPUS SEKARANG'}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
