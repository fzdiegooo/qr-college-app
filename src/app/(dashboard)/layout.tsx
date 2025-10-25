"use client";
import { useUser } from "@/hooks";
import Sidebar from "../../components/Sidebar";
import { SidebarProvider, useSidebar } from "../../contexts/SidebarContext";
import { useEffect, useState } from "react";
import { usuarioService } from "@/services/alumnosService";
import { Usuario } from "@/types/database.types";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useSidebar();
  const { userId, userEmail, isAuthenticated } = useUser();
  const [userData, setUserData] = useState<Usuario | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // obtener datos de usuario desde la tabla usuarios
    const fetchUserData = async () => {
      if (!userId || !isAuthenticated) return;
      
      setLoadingUserData(true);
      try {
        const data = await usuarioService.getById(userId);
        setUserData(data);
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserData();
  }, [userId, isAuthenticated]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      setShowUserMenu(false);
      
      // Llamar a la API de logout
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // La API ya redirige automáticamente, pero por si acaso:
        window.location.href = '/login';
      } else {
        console.error('Error al cerrar sesión');
        // Fallback: redirigir manualmente
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error en logout:', error);
      // Fallback: redirigir manualmente
      window.location.href = '/login';
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-md relative z-20">
          <div className="px-4 md:px-8 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {/* En móvil agregar margen para el botón toggle, en desktop no */}
                <div className="ml-12 md:ml-0">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
                    <span className="hidden sm:inline">Sistema de Gestión Escolar</span>
                    <span className="sm:hidden">SGE</span>
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">
                    I.E. 3082 &quot;Paraíso Florido&quot;
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4 ml-4">
                <div className="text-right hidden sm:block">
                  {loadingUserData ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs md:text-sm font-medium text-gray-700">
                        Bienvenido, {userData?.nombre || userEmail}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userData?.rol?.nombre || 'Usuario'} - UGEL 02
                      </p>
                    </>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#8B1A1A] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base hover:shadow-lg transition-shadow"
                  >
                    {userData?.nombre ? userData.nombre.charAt(0).toUpperCase() : userEmail?.charAt(0).toUpperCase() || 'U'}
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border z-30"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4 border-b">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#8B1A1A] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold">
                            {userData?.nombre ? userData.nombre.charAt(0).toUpperCase() : userEmail?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {userData?.nombre || 'Usuario'}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {userEmail}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {loadingUserData && (
                        <div className="p-4">
                          <div className="animate-pulse space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      )}
                      
                      <div className="border-t p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-3 md:p-8 relative z-10">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
