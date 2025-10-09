"use client";
import Sidebar from "../../components/Sidebar";
import { SidebarProvider, useSidebar } from "../../contexts/SidebarContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useSidebar();

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
                    I.E. 3082 &quot;Paraíso Florida&quot;
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4 ml-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs md:text-sm font-medium text-gray-700">Administrador</p>
                  <p className="text-xs text-gray-500">UGEL 02</p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#8B1A1A] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
                  A
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
