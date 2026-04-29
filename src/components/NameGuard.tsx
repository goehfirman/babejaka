"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { useProfile } from "@/lib/profile-context";
import NamePromptModal from "./NamePromptModal";

export default function NameGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = useProfile();

  // Define routes that require a name
  // We'll protect everything under /explore
  const isProtectedRoute = pathname?.startsWith("/explore");
  
  // The name is "Petualang Baca" by default.
  // We want to force a change if they are accessing protected features.
  const isDefaultName = profile.name === "Petualang Baca";

  // If they are on a protected route and still have the default name,
  // show the compulsory modal.
  if (isProtectedRoute && isDefaultName) {
    return (
      <>
        {/* We still render children but obscured or just show the modal alone */}
        <div className="fixed inset-0 bg-[#F0F8FF] z-[999] flex items-center justify-center">
            <NamePromptModal isCompulsory={true} />
        </div>
      </>
    );
  }

  return <>{children}</>;
}
