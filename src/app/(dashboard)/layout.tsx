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
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className={`px-8 py-4 transition-all duration-300 ${
            isSidebarOpen ? "ml-0" : "ml-16"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sistema de Gestión Escolar</h1>
                <p className="text-sm text-gray-500 mt-1">I.E. 3082 &quot;Paraíso Florida&quot;</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">Administrador</p>
                  <p className="text-xs text-gray-500">UGEL 02</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-[#8B1A1A] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-auto p-8 transition-all duration-300 ${
          isSidebarOpen ? "ml-0" : "ml-16"
        }`}>
          <div className="max-w-7xl mx-auto">
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
