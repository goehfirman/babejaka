"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { db } from "./firebase";
import { doc, setDoc, onSnapshot, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export interface UserProfile {
  name: string;
  className: string; 
  schoolName: string;
  avatarSeed: string;
  points: number;
  completedBooks?: string[]; // Array of book IDs
  badges?: string[];        // Array of badge IDs
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Petualang Baca",
  className: "Pendatang Baru",
  schoolName: "",
  avatarSeed: "42",
  points: 0,
  completedBooks: [],
  badges: [],
};

const ACTIVE_USER_KEY = "babe_jaka_active_user";
const USERS_LIST_KEY = "babe_jaka_all_users";

interface ProfileContextValue {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  login: (name: string, schoolName: string) => void;
  addPoints: (amount: number) => void;
  completeBook: (bookId: string) => void;
  awardBadge: (badgeId: string) => void;
  logout: () => void;
  getAvatarUrl: () => string;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  // Firestore Document ID helper
  const getDocId = (name: string, school: string) => {
    return `${name.toLowerCase().trim()}_${school.toLowerCase().trim()}`.replace(/\s+/g, '_');
  };

  useEffect(() => {
    const savedActive = localStorage.getItem(ACTIVE_USER_KEY);
    if (savedActive) {
      try {
        const localProfile = JSON.parse(savedActive);
        setProfile(localProfile);
        
        // Start Realtime Sync with Firestore
        const docId = getDocId(localProfile.name, localProfile.schoolName);
        const unsub = onSnapshot(doc(db, "users", docId), (docSnap) => {
          if (docSnap.exists()) {
            const cloudData = docSnap.data() as UserProfile;
            // Ensure arrays exist even if cloud data is old
            const sanitized: UserProfile = {
              ...cloudData,
              completedBooks: cloudData.completedBooks || [],
              badges: cloudData.badges || [],
            };
            setProfile(sanitized);
            localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(sanitized));
          }
        });
        
        return () => unsub();
      } catch (e) {
        console.error("Failed to load active profile", e);
      }
    }
    setLoaded(true);
  }, []);

  const saveToStorage = async (p: UserProfile) => {
    // 1. LocalStorage Active
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(p));
    
    // 2. LocalStorage Master List (Legacy support)
    const allUsersRaw = localStorage.getItem(USERS_LIST_KEY);
    let allUsers: UserProfile[] = allUsersRaw ? JSON.parse(allUsersRaw) : [];
    const existingIdx = allUsers.findIndex(u => 
      u.name.toLowerCase() === p.name.toLowerCase() && 
      u.schoolName.toLowerCase() === p.schoolName.toLowerCase()
    );
    if (existingIdx >= 0) allUsers[existingIdx] = p;
    else allUsers.push(p);
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(allUsers));

    // 3. Firestore Realtime Sync
    try {
      const docId = getDocId(p.name, p.schoolName);
      await setDoc(doc(db, "users", docId), {
        ...p,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn("Cloud sync failed (offline?), using local storage.", err);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      saveToStorage(next);
      return next;
    });
  };

  const login = async (name: string, schoolName: string) => {
    const docId = getDocId(name, schoolName);
    
    try {
      // Try to fetch from Cloud first
      const docSnap = await getDoc(doc(db, "users", docId));
      if (docSnap.exists()) {
        const cloudProfile = docSnap.data() as UserProfile;
        const sanitized: UserProfile = {
           ...cloudProfile,
           completedBooks: cloudProfile.completedBooks || [],
           badges: cloudProfile.badges || [],
        };
        setProfile(sanitized);
        saveToStorage(sanitized);
        return;
      }
    } catch (err) {
      console.error("Firebase login check failed", err);
    }

    // Fallback to local or create new
    const allUsersRaw = localStorage.getItem(USERS_LIST_KEY);
    const allUsers: UserProfile[] = allUsersRaw ? JSON.parse(allUsersRaw) : [];
    const existing = allUsers.find(u => 
      u.name.toLowerCase() === name.toLowerCase() && 
      u.schoolName.toLowerCase() === schoolName.toLowerCase()
    );

    if (existing) {
      const sanitized: UserProfile = {
         ...existing,
         completedBooks: existing.completedBooks || [],
         badges: existing.badges || [],
      };
      setProfile(sanitized);
      saveToStorage(sanitized);
    } else {
      const newProfile = { 
        ...DEFAULT_PROFILE, 
        name, 
        schoolName, 
        avatarSeed: Math.floor(Math.random() * 1000).toString(),
        completedBooks: [],
        badges: []
      };
      setProfile(newProfile);
      saveToStorage(newProfile);
    }
  };

  const addPoints = (amount: number) => {
    setProfile(prev => {
      const next = { ...prev, points: (prev.points || 0) + amount };
      saveToStorage(next);
      return next;
    });
  };

  const completeBook = (bookId: string) => {
    setProfile(prev => {
      const current = prev.completedBooks || [];
      if (current.includes(bookId)) return prev;
      const next = { ...prev, completedBooks: [...current, bookId] };
      saveToStorage(next);
      return next;
    });
  };

  const awardBadge = (badgeId: string) => {
    setProfile(prev => {
      const current = prev.badges || [];
      if (current.includes(badgeId)) return prev;
      const next = { ...prev, badges: [...current, badgeId] };
      saveToStorage(next);
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem(ACTIVE_USER_KEY);
    setProfile(DEFAULT_PROFILE);
  };

  const getAvatarUrl = () => {
    return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${profile.avatarSeed}`;
  };

  if (!loaded) return null;

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, login, addPoints, completeBook, awardBadge, logout, getAvatarUrl }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    return {
      profile: DEFAULT_PROFILE,
      updateProfile: () => {},
      login: () => {},
      addPoints: () => {},
      completeBook: () => {},
      awardBadge: () => {},
      logout: () => {},
      getAvatarUrl: () => `https://api.dicebear.com/9.x/fun-emoji/svg?seed=42`,
    };
  }
  return ctx;
}
