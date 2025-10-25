"use client";
import { FaBars, FaTimes, FaHome, FaUserGraduate, FaClipboardCheck, FaChartBar, FaCog } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../contexts/SidebarContext";

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "Inicio", icon: FaHome },
    { href: "/alumnos", label: "Alumnos", icon: FaUserGraduate },
    { href: "/asistencias", label: "Asistencia", icon: FaClipboardCheck },
    { href: "/reportes", label: "Reportes", icon: FaChartBar },
    { href: "/configuracion", label: "Configuración", icon: FaCog },
  ];

  // Función para cerrar sidebar en móvil al navegar
  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`bg-gradient-to-b from-[#8B1A1A] to-[#6B1414] text-white transition-all duration-300 shadow-2xl h-full z-40 ${
          // En móvil: fixed overlay, en desktop: static sidebar
          isSidebarOpen 
            ? "w-64 fixed md:static left-0 top-0 md:left-auto md:top-auto" 
            : "w-0 fixed md:static left-0 top-0 md:left-auto md:top-auto"
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Header del Sidebar */}
          <div className="p-4 md:p-6 flex justify-between items-center border-b border-white/10">
            <div className="flex justify-center flex-1">
              <img 
                src="/logo_paraiso_florido.png" 
                alt="Logo" 
                className="w-20 h-20 md:w-28 md:h-28" 
              />
            </div>
            {/* Botón de cerrar en móvil */}
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 p-3 md:p-4">
            <ul className="space-y-1 md:space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-3 px-3 py-2.5 md:px-4 md:py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white/20 text-white font-semibold shadow-md"
                          : "hover:bg-white/10 text-white/90 hover:text-white"
                      }`}
                    >
                      <Icon size={18} className="md:w-5 md:h-5" />
                      <span className="text-sm md:text-base">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-3 left-3 md:top-4 md:left-4 z-50 bg-[#8B1A1A] text-white p-2.5 md:p-3 rounded-lg shadow-lg hover:bg-[#6B1414] transition-all duration-200 hover:scale-110 md:hidden"
      >
        {isSidebarOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
      </button>

      {/* Toggle Button para desktop - dentro del sidebar */}
      {isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="hidden md:block fixed top-4 left-4 z-50 bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
        >
          <FaTimes size={18} />
        </button>
      )}
      
      {/* Toggle Button para desktop - cuando sidebar cerrado */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="hidden md:block fixed top-4 left-4 z-50 bg-[#8B1A1A] text-white p-3 rounded-lg shadow-lg hover:bg-[#6B1414] transition-all duration-200 hover:scale-110"
        >
          <FaBars size={20} />
        </button>
      )}
    </>
  );
}