
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaUserGraduate, FaClipboardCheck, FaChartLine, FaCalendarAlt, FaUserCog } from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const stats = [
    {
      title: "Total Alumnos",
      value: "1,234",
      icon: FaUserGraduate,
      color: "from-blue-500 to-blue-600",
      change: "+12%",
    },
    {
      title: "Asistencias Hoy",
      value: "95%",
      icon: FaClipboardCheck,
      color: "from-green-500 to-green-600",
      change: "+5%",
    },
    {
      title: "Reportes Pendientes",
      value: "23",
      icon: FaChartLine,
      color: "from-yellow-500 to-yellow-600",
      change: "-8%",
    },
    {
      title: "Eventos del Mes",
      value: "8",
      icon: FaCalendarAlt,
      color: "from-purple-500 to-purple-600",
      change: "+2",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#8B1A1A] to-[#3B82F6] rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">¡Bienvenido al Dashboard!</h1>
        <p className="text-white/90">Sistema de Gestión Escolar - I.E. 3082 &quot;Paraíso Florido&quot;</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/alumnos" className="flex flex-col justify-center items-center space-x-2 w-full min-h-[200px] cursor-pointer rounded-md border border-gray-300 bg-white shadow p-6 hover:shadow-lg transition-shadow">
          <FaUserGroup className="text-3xl" />
          <span className="text-2xl">Gestión Alumnos</span>
        </Link>
        <Link href="/asistencias" className="flex flex-col justify-center items-center space-x-2 w-full min-h-[200px] cursor-pointer rounded-md border border-gray-300 bg-white shadow p-6 hover:shadow-lg transition-shadow">
          <FaClipboardCheck className="text-3xl" />
          <span className="text-2xl">Gestión Asistencias</span>
        </Link>
        <Link href="/reportes" className="flex flex-col justify-center items-center space-x-2 w-full min-h-[200px] cursor-pointer rounded-md border border-gray-300 bg-white shadow p-6 hover:shadow-lg transition-shadow">
          <FaChartLine className="text-3xl" />
          <span className="text-2xl">Reportes</span>
        </Link>
        <Link href="/configuracion" className="flex flex-col justify-center items-center space-x-2 w-full min-h-[200px] cursor-pointer rounded-md border border-gray-300 bg-white shadow p-6 hover:shadow-lg transition-shadow">
          <FaUserCog className="text-3xl" />
          <span className="text-2xl">Configuración</span>
        </Link>
      </div>
    </div>
  );
}
