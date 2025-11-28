'use client'
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "./AuthContext";

export default function MainProvider({children}: {children: React.ReactNode}) {
  return (
    <HeroUIProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </HeroUIProvider>
  );
}