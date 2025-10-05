"use client";
import { FaBars, FaTimes, FaHome, FaUserGraduate, FaClipboardCheck, FaChartBar } from "react-icons/fa";
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
  ];

  return (
    <>
      <div
        className={`bg-gradient-to-b from-[#8B1A1A] to-[#6B1414] text-white transition-all duration-300 shadow-2xl h-full fixed left-0 top-0 z-40 ${
          isSidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Header del Sidebar */}
          <div className="p-6 flex justify-center border-b border-white/10">
            <img src="/logo_paraiso_florido.png" alt="Logo" className="w-28 h-28" />
          </div>

          {/* Navegación */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white/20 text-white font-semibold shadow-md"
                          : "hover:bg-white/10 text-white/90 hover:text-white"
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer del Sidebar */}
          <div className="p-4 border-t border-white/10">
            <p className="text-xs text-center text-white/60">Dashboard v1.0</p>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-[#8B1A1A] text-white p-3 rounded-lg shadow-lg hover:bg-[#6B1414] transition-all duration-200 hover:scale-110"
      >
        {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>
    </>
  );
}