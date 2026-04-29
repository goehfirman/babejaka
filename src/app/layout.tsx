import type { Metadata } from "next";
import "./globals.css";

import { ProfileProvider } from "@/lib/profile-context";
import NameGuard from "@/components/NameGuard";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "BABE JAKA - Jakarta Kota Global",
  description: "Aplikasi Diagnosis Literasi Masa Depan dengan Harmoni Budaya Betawi dan Teknologi Global.",
  icons: {
    icon: "/favicon.ico" // Placeholder for now
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Changa+One&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F8FAFC] font-body text-[#1A1A1A] antialiased overflow-x-hidden min-h-screen bg-batik-subtle">
        <ProfileProvider>
          <NameGuard>
            <Navbar />
            {children}
          </NameGuard>
          {/* Version Marker */}
          <div className="fixed bottom-2 right-2 text-[10px] font-black text-primary opacity-20 pointer-events-none z-[9999]">
            BABE JAKA v2.0
          </div>
        </ProfileProvider>
      </body>
    </html>
  );
}
