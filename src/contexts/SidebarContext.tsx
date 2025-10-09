"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Detectar el tamaño de pantalla y ajustar el sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // En desktop, mantener abierto por defecto
        setIsSidebarOpen(true);
      } else {
        // En móvil, mantener cerrado por defecto
        setIsSidebarOpen(false);
      }
    };

    // Ejecutar al cargar
    handleResize();
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
