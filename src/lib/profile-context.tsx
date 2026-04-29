"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  name: string;
  className: string; // Keeping field name but conceptually "Status/Bio"
  avatarSeed: string;
  points: number;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Petualang Baca",
  className: "Pendatang Baru",
  avatarSeed: "42",
  points: 0,
};

const STORAGE_KEY = "babe_jaka_user_profile";

interface ProfileContextValue {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
  getAvatarUrl: () => string;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    }
    setLoaded(true);
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfile(DEFAULT_PROFILE);
  };

  const getAvatarUrl = () => {
    return `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${profile.avatarSeed}`;
  };

  if (!loaded) return null;

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, logout, getAvatarUrl }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    // Fallback for pages that don't wrap with ProfileProvider
    return {
      profile: DEFAULT_PROFILE,
      updateProfile: () => {},
      logout: () => {},
      getAvatarUrl: () => `https://api.dicebear.com/9.x/fun-emoji/svg?seed=42`,
    };
  }
  return ctx;
}
