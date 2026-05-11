"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

interface UserData {
  id: string;
  name: string;
  schoolName: string;
  className: string;
  points: number;
  lastUpdated?: string;
  accuracy?: number;
  status?: string;
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("lastUpdated", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: UserData[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserData[];
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.schoolName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0F8FF] font-body text-[#333333] flex">
      
      {/* Sidebar - Clean Light Theme */}
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
             { icon: 'group', label: 'Manajemen Pengguna', active: true, href: '/admin/users' },
             { icon: 'menu_book', label: 'Pengaturan Buku', active: false, href: '/admin/books' },
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

      {/* Main Admin Content Area */}
      <main className="flex-1 ml-72 min-h-screen relative overflow-hidden pb-20">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full opacity-60 blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        {/* Top Header */}
        <header className="px-10 py-8 flex justify-between items-center relative z-10 border-b-4 border-white">
           <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-[#333333]">Manajemen <span className="text-[#FFB347]">Pengguna</span></h1>
           </div>
           
           <div className="flex items-center gap-4">
              <button className="btn-bubbly rounded-full py-4 px-6 text-sm flex items-center gap-2">
                 <span className="material-symbols-rounded text-lg">add</span>
                 TAMBAH PENGGUNA
              </button>
           </div>
        </header>

        {/* Content Section */}
        <div className="p-10 relative z-10">
           
           {/* Filters Bar */}
           <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative group">
                 <span className="material-symbols-rounded absolute left-5 top-1/2 -translate-y-1/2 text-[#A0AEC0] text-2xl group-focus-within:text-[#FFB347] transition-colors">search</span>
                 <input 
                   type="text" 
                   placeholder="Cari pengguna dengan nama atau sekolah..." 
                   className="w-full pl-14 pr-6 py-4 bg-white border-4 border-[#E2E8F0] shadow-sm rounded-2xl text-base font-bold text-[#333333] placeholder:text-[#A0AEC0] focus:outline-none focus:border-[#FFB347] transition-all"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex gap-4">
                 <button className="px-6 py-4 bg-white border-4 border-[#E2E8F0] shadow-sm rounded-2xl flex items-center justify-center hover:bg-[#F8FAFC] hover:border-[#cbd5e1] transition-all text-[#A0AEC0] font-black uppercase tracking-widest text-xs gap-2">
                    <span className="material-symbols-rounded">filter_alt</span> FILTER
                 </button>
              </div>
           </div>

           {/* Table Section */}
           <div className="bg-white border-4 border-[#E2E8F0] shadow-sm rounded-[32px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b-4 border-[#E2E8F0] bg-[#F8FAFC]">
                       <th className="px-8 py-5 text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em]">Profil Pengguna</th>
                       <th className="px-6 py-5 text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em]">Sekolah / Kelas</th>
                       <th className="px-6 py-5 text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em]">Poin</th>
                       <th className="px-6 py-5 text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em]">Status</th>
                       <th className="px-6 py-5 text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em]">Log Terakhir</th>
                       <th className="px-8 py-5 text-[10px] font-black text-[#A0AEC0] uppercase tracking-[0.2em] text-right">Tindakan</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y-2 divide-[#E2E8F0]">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <span className="material-symbols-rounded animate-spin text-4xl text-[#FFB347]">progress_activity</span>
                            <p className="text-[#A0AEC0] font-black uppercase tracking-widest text-xs">Memuat Data Pengguna...</p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center text-[#A0AEC0] font-bold">
                          {searchTerm ? "Tidak ada pengguna yang cocok dengan pencarian." : "Belum ada pengguna yang terdaftar."}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((student) => (
                        <tr key={student.id} className="hover:bg-[#F0F8FF] transition-colors group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-full bg-white border-2 border-[#E2E8F0] shadow-sm p-1 group-hover:border-[#FFB347] transition-all overflow-hidden flex items-center justify-center">
                                    <Image src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${student.name}`} alt="Avatar" width={38} height={38} unoptimized />
                                 </div>
                                 <div>
                                    <p className="text-base font-black text-[#333333] leading-none uppercase group-hover:text-[#FFB347] transition-colors mb-1">{student.name}</p>
                                    <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest leading-none">{student.id}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <div>
                                <p className="text-sm font-black text-[#666666] mb-1">{student.schoolName || "Tidak Diketahui"}</p>
                                <span className="text-[10px] font-black text-[#A0AEC0] bg-[#F8FAFC] px-2 py-1 rounded-lg border-2 border-[#E2E8F0] uppercase tracking-wider">{student.className}</span>
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <div className="flex items-center gap-2">
                                 <span className="material-symbols-rounded text-[#FFB347]">stars</span>
                                 <span className="text-base font-black text-[#FFB347]">{student.points || 0}</span>
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${
                                 (student.points || 0) > 100 ? 'bg-[#D1FAE5] text-[#059669] border-[#34D399]' : 
                                 'bg-[#E0F2FE] text-[#0284C7] border-[#38BDF8]'
                              }`}>
                                 { (student.points || 0) > 100 ? 'Aktif' : 'Baru' }
                              </span>
                           </td>
                           <td className="px-6 py-6 text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider">
                              {student.lastUpdated ? new Date(student.lastUpdated).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : "-"}
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex justify-end gap-2">
                                 <button className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[#E2E8F0] hover:bg-[#F0F8FF] hover:border-[#87CEEB] hover:text-[#87CEEB] rounded-2xl text-[#A0AEC0] transition-all shadow-sm">
                                    <span className="material-symbols-rounded text-xl">visibility</span>
                                 </button>
                                 <button className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[#E2E8F0] hover:bg-[#FFE2E5] hover:border-[#FF4757] hover:text-[#FF4757] rounded-2xl text-[#A0AEC0] transition-all shadow-sm">
                                    <span className="material-symbols-rounded text-xl">edit</span>
                                 </button>
                              </div>
                           </td>
                        </tr>
                      ))
                    )}
                 </tbody>
              </table>
           </div>

           {/* Bulk Actions Placeholder */}
           <div className="mt-8 flex justify-between items-center px-4">
              <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">
                Menampilkan {filteredUsers.length} dari {users.length} Pengguna
              </p>
           </div>

        </div>
      </main>

    </div>
  );
}
