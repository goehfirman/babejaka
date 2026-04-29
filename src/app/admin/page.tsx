"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const STATS = [
  { label: 'Total Pengguna', value: '32', icon: 'groups', color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' },
  { label: 'Rata-rata Akurasi', value: '88%', icon: 'verified', color: 'text-[#FFB347]', bg: 'bg-[#FFF3E0]', border: 'border-[#FFE0B2]' },
  { label: 'Buku Selesai', value: '124', icon: 'auto_stories', color: 'text-[#9b59b6]', bg: 'bg-[#f4ebf7]', border: 'border-[#e0cbe7]' },
  { label: 'Misi Jaga Bumi', value: '12/17', icon: 'public', color: 'text-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-200' },
];

const RECENT_ACTIVITY = [
  { user: 'Teguh Pratama', action: 'Selesai membaca "Air Kehidupan"', time: '2 menit yang lalu', status: 'Lancar' },
  { user: 'Budi Santoso', action: 'Memulai kuis "Si Kancil"', time: '5 menit yang lalu', status: 'Progres' },
  { user: 'Siti Aminah', action: 'Mendapat lencana "Climate Hero"', time: '12 menit yang lalu', status: 'Baru' },
];

export default function AdminDashboard() {
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
             { icon: 'dashboard', label: 'Beranda', active: true, href: '/admin' },
             { icon: 'group', label: 'Manajemen Pengguna', active: false, href: '/admin/users' },
             { icon: 'menu_book', label: 'Pengaturan Buku', active: false, href: '/admin/books' },
             { icon: 'library_books', label: 'Kurikulum SDG', active: false },
             { icon: 'analytics', label: 'Laporan Kelas', active: false },
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

      {/* Main Content Area */}
      <main className="flex-1 ml-72 min-h-screen relative overflow-hidden bg-[#F0F8FF] pb-20">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full opacity-60 blur-3xl -translate-y-1/2 translate-x-1/3"></div>

        {/* Top Header */}
        <header className="px-10 py-8 flex justify-between items-center relative z-10">
           <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-[#333333]">Ruang <span className="text-[#FFB347]">Admin</span></h1>
           </div>
           
           <div className="flex items-center gap-6 bg-white p-3 rounded-full border-4 border-[#E2E8F0] shadow-sm">
              <div className="flex px-2 border-r-2 border-[#E2E8F0]">
                 <button className="w-10 h-10 hover:bg-[#F8FAFC] rounded-full text-[#A0AEC0] hover:text-[#FFB347] transition-all flex items-center justify-center relative">
                    <span className="material-symbols-rounded text-xl">notifications</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF4757] rounded-full"></span>
                 </button>
              </div>
              <div className="flex items-center gap-3 pr-2">
                 <div className="text-right">
                    <p className="text-xs font-black uppercase leading-none mb-1 text-[#333333]">Administrator</p>
                    <p className="text-[10px] items-center justify-end flex gap-1 font-bold text-[#87CEEB] uppercase tracking-widest leading-none">
                       <span className="material-symbols-rounded text-[10px]">verified</span> Admin Utama
                    </p>
                 </div>
                 <Image src="https://api.dicebear.com/9.x/fun-emoji/svg?seed=Admin" alt="Admin" width={40} height={40} className="rounded-full bg-[#E0F2FE] border-2 border-[#87CEEB]" unoptimized />
              </div>
           </div>
        </header>

        {/* Dashboard Grid */}
        <div className="px-10 relative z-10">
           
           {/* Welcome Banner */}
           <div className="mb-8 bg-white rounded-[32px] p-10 border-4 border-[#E2E8F0] shadow-sm flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-[#FFF3E0] to-transparent opacity-50"></div>
              
              <div className="relative z-10 w-full lg:w-2/3">
                 <p className="text-[10px] font-black bg-white border-2 border-[#E2E8F0] px-4 py-2 rounded-full text-[#FFB347] uppercase tracking-[0.2em] mb-4 shadow-sm inline-block">INFO HARI INI</p>
                 <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-tight mb-4 text-[#333333]">Selamat Datang Kembali, <br/><span className="text-[#FFB347]">Admin!</span></h2>
                 <p className="text-[#666666] text-base font-bold leading-relaxed mb-6">
                    Semua sistem berjalan dengan baik. Pantau statistik dan aktivitas pengguna dari dashboard ini.
                 </p>
                 <div className="flex gap-4">
                    <button className="btn-bubbly rounded-full py-4 px-6 text-sm flex items-center gap-2">
                       <span className="material-symbols-rounded">download</span> UNDUH LAPORAN
                    </button>
                 </div>
              </div>
           </div>

           {/* Stats Overview */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {STATS.map((stat, i) => (
                <div key={stat.label} className="bg-white rounded-3xl p-6 border-4 border-[#E2E8F0] shadow-sm flex flex-col justify-between" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                   <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 ${stat.border} ${stat.bg} ${stat.color}`}>
                         <span className="material-symbols-rounded text-3xl">{stat.icon}</span>
                      </div>
                      <span className="material-symbols-rounded text-[#34D399] bg-[#D1FAE5] rounded-full p-1 text-sm border-2 border-[#34D399]">trending_up</span>
                   </div>
                   <div>
                      <div className="text-4xl font-black text-[#333333] mb-1">{stat.value}</div>
                      <h4 className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">{stat.label}</h4>
                   </div>
                </div>
              ))}
           </div>

           {/* Detailed analytics & and Lists */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border-4 border-[#E2E8F0] shadow-sm">
                 <div className="flex justify-between items-center mb-8 border-b-4 border-[#F8FAFC] pb-4">
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#333333]">Aktivitas Pengguna</h3>
                    <button className="px-6 py-2.5 bg-[#5AAFD1] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_4px_0_#4691B0] transition-all hover:-translate-y-1 active:translate-y-0">Lihat Semua</button>
                 </div>
                 <div className="space-y-4">
                    {RECENT_ACTIVITY.map((act) => (
                       <div key={act.user} className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-2xl border-2 border-transparent hover:border-[#E2E8F0] transition-all">
                          <Image src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${act.user}`} alt="Avatar" width={48} height={48} className="rounded-full bg-white border-2 border-[#E2E8F0]" unoptimized />
                          <div className="flex-1">
                             <div className="flex justify-between items-center mb-1">
                                <p className="text-base font-black text-[#333333] leading-none">{act.user}</p>
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border-2 ${act.status === 'Lancar' ? 'bg-[#D1FAE5] text-[#059669] border-[#34D399]' : 'bg-[#E0F2FE] text-[#5AAFD1] border-[#BEE3F8]'}`}>{act.status}</span>
                             </div>
                             <p className="text-sm font-bold text-[#666666] mb-1">{act.action}</p>
                             <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">{act.time}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="lg:col-span-1 flex flex-col gap-6">
                 <div className="bg-white rounded-[32px] p-8 border-4 border-[#E2E8F0] shadow-sm flex-1">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-8 text-[#333333]">Pencapaian Platform</h3>
                    <div className="space-y-6">
                       {[
                          { l: 'SDG 15 - Darat', p: 85, c: 'bg-emerald-400', b: 'bg-[#D1FAE5]' },
                          { l: 'SDG 6 - Air', p: 40, c: 'bg-blue-400', b: 'bg-[#E0F2FE]' },
                          { l: 'SDG 13 - Iklim', p: 65, c: 'bg-[#5AAFD1]', b: 'bg-[#E0F2FE]' },
                       ].map(t => (
                        <div key={t.l}>
                           <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2 text-[#666666]">
                              <span>{t.l}</span>
                              <span className="text-[#333333]">{t.p}%</span>
                           </div>
                           <div className="h-4 w-full bg-[#F0F8FF] rounded-full overflow-hidden border-2 border-[#E2E8F0]">
                              <div className={`h-full ${t.c} rounded-full`} style={{ width: `${t.p}%` }}></div>
                           </div>
                        </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-[#E0F2FE] rounded-[32px] p-8 border-4 border-[#BEE3F8] shadow-sm relative overflow-hidden">
                    <span className="material-symbols-rounded absolute -right-6 -bottom-6 text-9xl text-[#BEE3F8] opacity-50 z-0 select-none">tips_and_updates</span>
                    <div className="relative z-10">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-[#F0F8FF] rounded-xl flex items-center justify-center text-[#5AAFD1] border-2 border-[#E2E8F0]">
                             <span className="material-symbols-rounded text-xl text-[#5AAFD1]">tips_and_updates</span>
                          </div>
                          <h3 className="text-xl font-black uppercase tracking-tight leading-none text-[#5AAFD1]">Asisten Pintar</h3>
                       </div>
                       <p className="text-sm font-bold text-[#5AAFD1] leading-relaxed">
                          "Selamat bekerja! Selalu pantau data terbaru untuk memberikan pengalaman terbaik bagi seluruh pengguna BABE JAKA."
                       </p>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </main>
    </div>
  );
}
