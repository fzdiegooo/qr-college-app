'use client'
import { HeroUIProvider } from "@heroui/react";

export default function MainProvider({children}: {children: React.ReactNode}) {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}