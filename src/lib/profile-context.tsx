"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  name: string;
  className: string; 
  schoolName: string;
  avatarSeed: string;
  points: number;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Petualang Baca",
  className: "Pendatang Baru",
  schoolName: "",
  avatarSeed: "42",
  points: 0,
};

const ACTIVE_USER_KEY = "babe_jaka_active_user";
const USERS_LIST_KEY = "babe_jaka_all_users";

interface ProfileContextValue {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  login: (name: string, schoolName: string) => void;
  addPoints: (amount: number) => void;
  logout: () => void;
  getAvatarUrl: () => string;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedActive = localStorage.getItem(ACTIVE_USER_KEY);
    if (savedActive) {
      try {
        setProfile(JSON.parse(savedActive));
      } catch (e) {
        console.error("Failed to load active profile", e);
      }
    }
    setLoaded(true);
  }, []);

  const saveToStorage = (p: UserProfile) => {
    // Save as active user
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(p));
    
    // Also save/update in the master list
    const allUsersRaw = localStorage.getItem(USERS_LIST_KEY);
    let allUsers: UserProfile[] = allUsersRaw ? JSON.parse(allUsersRaw) : [];
    
    const existingIdx = allUsers.findIndex(u => 
      u.name.toLowerCase() === p.name.toLowerCase() && 
      u.schoolName.toLowerCase() === p.schoolName.toLowerCase()
    );

    if (existingIdx >= 0) {
      allUsers[existingIdx] = p;
    } else {
      allUsers.push(p);
    }
    
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(allUsers));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      saveToStorage(next);
      return next;
    });
  };

  const login = (name: string, schoolName: string) => {
    const allUsersRaw = localStorage.getItem(USERS_LIST_KEY);
    const allUsers: UserProfile[] = allUsersRaw ? JSON.parse(allUsersRaw) : [];
    
    const existing = allUsers.find(u => 
      u.name.toLowerCase() === name.toLowerCase() && 
      u.schoolName.toLowerCase() === schoolName.toLowerCase()
    );

    if (existing) {
      // Restore previous data
      setProfile(existing);
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(existing));
    } else {
      // Create new profile but keep defaults
      const newProfile = { ...DEFAULT_PROFILE, name, schoolName, avatarSeed: Math.floor(Math.random() * 1000).toString() };
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

  const logout = () => {
    localStorage.removeItem(ACTIVE_USER_KEY);
    setProfile(DEFAULT_PROFILE);
  };

  const getAvatarUrl = () => {
    return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${profile.avatarSeed}`;
  };

  if (!loaded) return null;

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, login, addPoints, logout, getAvatarUrl }}>
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
      logout: () => {},
      getAvatarUrl: () => `https://api.dicebear.com/9.x/fun-emoji/svg?seed=42`,
    };
  }
  return ctx;
}
