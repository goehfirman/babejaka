"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/profile-context";
import { StarFly } from "@/components/StarFly";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function LeaderboardPage() {
  const { profile } = useProfile();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      orderBy("points", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        isUser: doc.id === `${profile.name}_${profile.schoolName}` || doc.data().name === profile.name
      }));
      setLeaderboard(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaderboard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile.name, profile.schoolName]);

  const sortedLeaderboard = leaderboard;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body text-[#333333] pb-20 relative overflow-hidden">
      {/* Heritage Watermark Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04] bg-batik-subtle animate-drift"></div>
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.05]"
        style={{ 
          backgroundImage: 'url("https://i.ibb.co.com/hzkP529/Gemini-Generated-Image-1ce1or1ce1or1ce1.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

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

      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto -mt-10 px-6 relative z-20">
        {loading ? (
          <div className="bg-white rounded-[40px] p-20 text-center shadow-xl">
            <div className="animate-spin inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p className="font-black text-ink-light">Memuat Jawara...</p>
          </div>
        ) : sortedLeaderboard.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center shadow-xl">
            <p className="font-black text-ink-light">Belum ada jawara terdaftar.</p>
          </div>
        ) : (
          <>

        {/* List of Rank 4+ */}
        <div className="bg-white rounded-[40px] shadow-2xl border-4 border-white overflow-hidden p-6 md:p-10">
          <div className="space-y-4">
            {sortedLeaderboard.map((user, idx) => {
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
                      src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${user.avatarSeed || user.avatar}`} 
                      alt={user.name} 
                      className="rounded-full border-2 border-white shadow-sm"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`font-black truncate ${isUser ? 'text-secondary' : 'text-[#334155]'}`}>
                      {user.name} {isUser && <span className="bg-secondary text-white text-[10px] px-2 py-0.5 rounded-full ml-1 uppercase">Kamu</span>}
                    </h4>
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">{user.schoolName || 'Sekolah'}</p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                      <span className="text-xs">⭐</span>
                      <span className={`font-black text-sm ${isUser ? 'text-secondary' : 'text-slate-600'}`}>{user.points || 0}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 pt-10 border-t-2 border-slate-50 text-center">
            <Link 
              href="/explore/dashboard" 
              className="group relative inline-flex items-center gap-3 bg-secondary text-white h-16 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-full px-10 overflow-hidden shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-rounded font-bold text-2xl shrink-0 group-hover:rotate-[360deg] transition-transform duration-700">home</span>
              <span className="font-semibold text-base whitespace-nowrap">Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
