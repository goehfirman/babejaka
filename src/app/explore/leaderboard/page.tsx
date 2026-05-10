"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/profile-context";
import { StarFly } from "@/components/StarFly";

const MOCK_LEADERBOARD = [
  { name: "Siti Nurhaliza", points: 2450, avatar: "1", class: "Kelas 4A", isUser: false },
  { name: "Budi Santoso", points: 2120, avatar: "2", class: "Kelas 4C", isUser: false },
  { name: "Aisyah Putri", points: 1980, avatar: "3", class: "Kelas 4B", isUser: false },
  { name: "Reza Rahadian", points: 1850, avatar: "4", class: "Kelas 4A", isUser: false },
  { name: "Dewi Lestari", points: 1620, avatar: "5", class: "Kelas 4C", isUser: false },
  { name: "Iwan Fals", points: 1400, avatar: "6", class: "Kelas 4B", isUser: false },
  { name: "Najwa Shihab", points: 1250, avatar: "7", class: "Kelas 4A", isUser: false },
];

export default function LeaderboardPage() {
  const { profile } = useProfile();

  const sortedLeaderboard = useMemo(() => {
    // Inject current user into the list
    const list = [...MOCK_LEADERBOARD, { 
      name: profile.name, 
      points: profile.points, 
      avatar: profile.avatarSeed, 
      class: profile.className,
      isUser: true 
    }];
    return list.sort((a, b) => b.points - a.points);
  }, [profile]);

  return (
    <div className="min-h-screen bg-[#F0F8FF] font-body text-[#333333] pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary to-secondary pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-black uppercase tracking-widest mb-6 border border-white/30">
            <span className="material-symbols-rounded text-base">emoji_events</span>
            Papan Peringkat Teratas
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-lg">
            JAWARA LITERASI <br/> 
            <span className="text-yellow-300">BABE JAKA</span>
          </h1>
          <p className="text-white/80 font-bold text-lg max-w-xl mx-auto">
            Teruslah membaca dan kumpulkan bintang sebanyak-banyaknya untuk menjadi Jawara di sekolahmu!
          </p>
        </div>

        {/* Decorative Gigi Balang */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white flex overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-16 h-16 bg-white rotate-45 translate-y-8 border-t-8 border-primary/10"></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto -mt-10 px-6 relative z-20">
        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-12 items-end">
          {/* Rank 2 */}
          <div className="order-1 flex flex-col items-center">
            <div className="relative group mb-4">
              <div className="absolute inset-0 bg-[#E2E8F0] rounded-full scale-110 blur-sm"></div>
              <img 
                src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${sortedLeaderboard[1]?.avatar}`} 
                alt="Rank 2" 
                className="w-16 h-16 md:w-24 md:h-24 relative rounded-full border-4 border-white shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-[#CBD5E1] rounded-full border-4 border-white flex items-center justify-center font-black text-white text-sm">2</div>
            </div>
            <div className="text-center">
              <p className="font-black text-[#475569] text-xs md:text-sm truncate max-w-[80px] md:max-w-[120px]">{sortedLeaderboard[1]?.name}</p>
              <p className="text-[#94A3B8] font-black text-[10px] md:text-xs">⭐ {sortedLeaderboard[1]?.points}</p>
            </div>
          </div>

          {/* Rank 1 */}
          <div className="order-2 flex flex-col items-center">
            <div className="relative group mb-6">
              <div className="absolute inset-0 bg-yellow-400 rounded-full scale-125 blur-md animate-pulse"></div>
              <img 
                src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${sortedLeaderboard[0]?.avatar}`} 
                alt="Rank 1" 
                className="w-24 h-24 md:w-32 md:h-32 relative rounded-full border-4 border-white shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 md:w-12 md:h-12 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center font-black text-white text-lg">1</div>
              <span className="material-symbols-rounded absolute -top-8 left-1/2 -translate-x-1/2 text-5xl text-yellow-400 animate-bounce">star</span>
            </div>
            <div className="text-center">
              <p className="font-black text-[#1E293B] text-sm md:text-lg truncate max-w-[100px] md:max-w-[150px]">{sortedLeaderboard[0]?.name}</p>
              <p className="text-yellow-600 font-black text-xs md:text-sm">⭐ {sortedLeaderboard[0]?.points}</p>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="order-3 flex flex-col items-center">
            <div className="relative group mb-4">
              <div className="absolute inset-0 bg-[#FCD34D] opacity-30 rounded-full scale-110 blur-sm"></div>
              <img 
                src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${sortedLeaderboard[2]?.avatar}`} 
                alt="Rank 3" 
                className="w-16 h-16 md:w-24 md:h-24 relative rounded-full border-4 border-white shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 bg-[#B45309] rounded-full border-4 border-white flex items-center justify-center font-black text-white text-sm">3</div>
            </div>
            <div className="text-center">
              <p className="font-black text-[#92400E] text-xs md:text-sm truncate max-w-[80px] md:max-w-[120px]">{sortedLeaderboard[2]?.name}</p>
              <p className="text-[#D97706] font-black text-[10px] md:text-xs">⭐ {sortedLeaderboard[2]?.points}</p>
            </div>
          </div>
        </div>

        {/* List of Rank 4+ */}
        <div className="bg-white rounded-[40px] shadow-2xl border-4 border-white overflow-hidden p-6 md:p-10">
          <div className="space-y-4">
            {sortedLeaderboard.map((user, idx) => {
              if (idx < 3 && !user.isUser) return null;
              
              const rank = idx + 1;
              const isUser = user.isUser;

              return (
                <div 
                  key={user.name + idx}
                  className={`flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 ${isUser ? 'bg-secondary/10 border-2 border-secondary shadow-md scale-[1.02]' : 'bg-[#F8FAFC] border-2 border-transparent hover:bg-white hover:border-[#E2E8F0] hover:shadow-sm'}`}
                >
                  <div className={`w-10 h-10 flex items-center justify-center font-black text-lg ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-400' : rank === 3 ? 'text-amber-700' : 'text-slate-300'}`}>
                    {rank}
                  </div>
                  
                  <div className="w-12 h-12 relative flex-shrink-0">
                    <img 
                      src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${user.avatar}`} 
                      alt={user.name} 
                      className="rounded-full border-2 border-white shadow-sm"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`font-black truncate ${isUser ? 'text-secondary' : 'text-[#334155]'}`}>
                      {user.name} {isUser && <span className="bg-secondary text-white text-[10px] px-2 py-0.5 rounded-full ml-1 uppercase">Kamu</span>}
                    </h4>
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">{user.class}</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                      <span className="text-xs">⭐</span>
                      <span className={`font-black text-sm ${isUser ? 'text-secondary' : 'text-slate-600'}`}>{user.points}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 pt-8 border-t-2 border-slate-50 text-center">
            <Link 
              href="/explore/dashboard" 
              className="btn-bubbly rounded-full px-10 py-4 inline-flex items-center gap-2 text-sm"
            >
              KEMBALI KE BERANDA <span className="material-symbols-rounded">home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
