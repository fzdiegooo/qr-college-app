import { FaUserGraduate, FaClipboardCheck, FaChartLine, FaCalendarAlt } from "react-icons/fa";

export default function DashboardPage() {
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
        <p className="text-white/90">Sistema de Gestión Escolar - I.E. 3082 &quot;Paraíso Florida&quot;</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
                <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Actividad Reciente</h2>
          <div className="space-y-3">
            {[
              { action: "Registro de asistencia", time: "Hace 5 minutos" },
              { action: "Nuevo alumno registrado", time: "Hace 1 hora" },
              { action: "Reporte generado", time: "Hace 2 horas" },
              { action: "Actualización de datos", time: "Hace 3 horas" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <p className="text-gray-700">{activity.action}</p>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Próximos Eventos</h2>
          <div className="space-y-3">
            {[
              { event: "Reunión de padres", date: "15 Oct 2025" },
              { event: "Ceremonia cívica", date: "20 Oct 2025" },
              { event: "Evaluación trimestral", date: "25 Oct 2025" },
              { event: "Día del logro", date: "30 Oct 2025" },
            ].map((event, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <p className="text-gray-700">{event.event}</p>
                <span className="text-sm text-gray-500">{event.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
