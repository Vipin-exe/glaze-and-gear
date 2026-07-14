"use client";
import { SessionProvider } from "next-auth/react";
import { WishlistProvider } from "@/context/WishlistContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <WishlistProvider>
        {children}
      </WishlistProvider>
    </SessionProvider>
  );
}
