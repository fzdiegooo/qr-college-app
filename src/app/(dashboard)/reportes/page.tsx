"use client";
import { useEffect, useState } from "react";
import { Temporal } from "temporal-polyfill";
import { getAllAsistencias } from "@/services/asistenciaService";
import { Asistencia } from "@/types/database.types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ReportesPage() {
  // Zona horaria Lima
  const timeZone = "America/Lima";
  const today = Temporal.Now.plainDateISO(timeZone);
  const [fechaInicio, setFechaInicio] = useState(today.toString());
  const [fechaFin, setFechaFin] = useState(today.toString());
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar asistencias por rango
  useEffect(() => {
    setLoading(true);
    getAllAsistencias({
      page: 1,
      limit: 1000, // traer muchas para el rango
      filters: {},
    })
      .then(({ data }) => {
        // Filtrar por rango de fechas en frontend
        const desde = Temporal.PlainDate.from(fechaInicio);
        const hasta = Temporal.PlainDate.from(fechaFin);
        setAsistencias(
          data.filter((a) => {
            const f = Temporal.PlainDate.from(a.fecha);
            return (
              Temporal.PlainDate.compare(f, desde) >= 0 &&
              Temporal.PlainDate.compare(f, hasta) <= 0
            );
          })
        );
      })
      .finally(() => setLoading(false));
  }, [fechaInicio, fechaFin]);

  // Resúmenes
  const total = asistencias.length;
  const asistenciasCount = asistencias.filter((a) => a.estado === "ASISTENCIA").length;
  const tardanzasCount = asistencias.filter((a) => a.estado === "TARDANZA").length;
  const faltasCount = asistencias.filter((a) => a.estado === "FALTA").length;

  // Por grado y sección (ej: Primero A, Primero B, ...)
  const porGradoSeccion = {} as Record<string, { tardanza: number; falta: number }>;
  asistencias.forEach((a) => {
    const grado = a.usuarios?.grado?.nombre || "Sin grado";
    const seccion = a.usuarios?.seccion?.nombre || "Sin sección";
    const key = `${grado} ${seccion}`;
    if (!porGradoSeccion[key]) porGradoSeccion[key] = { tardanza: 0, falta: 0 };
    if (a.estado === "TARDANZA") porGradoSeccion[key].tardanza++;
    if (a.estado === "FALTA") porGradoSeccion[key].falta++;
  });
  const dataGradoSeccion = Object.entries(porGradoSeccion).map(([grupo, v]) => ({ grupo, ...v }));

  // Filtros para tabla de alumnos con más faltas
  const [filtroGrado, setFiltroGrado] = useState<string>("");
  const [filtroSeccion, setFiltroSeccion] = useState<string>("");
  const gradosUnicos = Array.from(new Set(asistencias.map(a => a.usuarios?.grado?.nombre).filter(Boolean)));
  const seccionesUnicas = Array.from(new Set(asistencias.map(a => a.usuarios?.seccion?.nombre).filter(Boolean)));

  // Top alumnos con más faltas (filtrable)
  const alumnosFaltas: Record<string, { nombre: string; documento: string; grado: string; seccion: string; faltas: number }> = {};
  asistencias.forEach((a) => {
    if (a.estado !== "FALTA") return;
    const id = a.usuarios?.id || "";
    if (!id) return;
    if (!alumnosFaltas[id]) {
      alumnosFaltas[id] = {
        nombre: a.usuarios?.nombre || "",
        documento: a.usuarios?.documento || "",
        grado: a.usuarios?.grado?.nombre || "",
        seccion: a.usuarios?.seccion?.nombre || "",
        faltas: 0,
      };
    }
    alumnosFaltas[id].faltas++;
  });
  let dataAlumnosFaltas = Object.values(alumnosFaltas);
  if (filtroGrado) dataAlumnosFaltas = dataAlumnosFaltas.filter(a => a.grado === filtroGrado);
  if (filtroSeccion) dataAlumnosFaltas = dataAlumnosFaltas.filter(a => a.seccion === filtroSeccion);
  dataAlumnosFaltas.sort((a, b) => b.faltas - a.faltas);

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-xl md:text-2xl font-bold">Reportes de Asistencias</h1>
        {/* Selector de fechas */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
          <div className="flex-1 sm:flex-none">
            <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent text-sm"
              max={fechaFin}
            />
          </div>
          <div className="flex-1 sm:flex-none">
            <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent text-sm"
              min={fechaInicio}
              max={today.toString()}
            />
          </div>
        </div>
      </div>
      {/* Cards de resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg md:rounded-xl shadow p-3 md:p-4">
          <div className="text-xs text-gray-500 mb-1">Asistencias</div>
          <div className="text-xl md:text-3xl font-bold text-green-700">{asistenciasCount}</div>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl shadow p-3 md:p-4">
          <div className="text-xs text-gray-500 mb-1">Tardanzas</div>
          <div className="text-xl md:text-3xl font-bold text-yellow-700">{tardanzasCount}</div>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl shadow p-3 md:p-4">
          <div className="text-xs text-gray-500 mb-1">Faltas</div>
          <div className="text-xl md:text-3xl font-bold text-red-700">{faltasCount}</div>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl shadow p-3 md:p-4">
          <div className="text-xs text-gray-500 mb-1">Total</div>
          <div className="text-xl md:text-3xl font-bold text-gray-700">{total}</div>
        </div>
      </div>

      {/* Gráfica por grado y sección */}
      <div className="bg-white rounded-lg md:rounded-xl shadow p-3 md:p-6">
        <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Tardanzas y Faltas por Grado y Sección</h2>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <ResponsiveContainer width="100%" height={280} className="md:!h-[340px]">
              <BarChart data={dataGradoSeccion} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="grupo" 
                  fontSize={10} 
                  className="md:text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} fontSize={10} className="md:text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    fontSize: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="tardanza" fill="#FACC15" name="Tardanzas" />
                <Bar dataKey="falta" fill="#EF4444" name="Faltas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla de alumnos con más faltas */}
      <div className="bg-white rounded-lg md:rounded-xl shadow p-3 md:p-6">
        <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Alumnos con más faltas</h2>
        
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          <div className="flex-1 sm:flex-none sm:w-40">
            <label className="block text-xs font-medium text-gray-600 mb-1">Grado</label>
            <select
              value={filtroGrado}
              onChange={e => setFiltroGrado(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
            >
              <option value="">Todos</option>
              {gradosUnicos.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 sm:flex-none sm:w-40">
            <label className="block text-xs font-medium text-gray-600 mb-1">Sección</label>
            <select
              value={filtroSeccion}
              onChange={e => setFiltroSeccion(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
            >
              <option value="">Todas</option>
              {seccionesUnicas.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {dataAlumnosFaltas.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No hay datos para mostrar
          </div>
        ) : (
          <>
            {/* Vista móvil - Cards */}
            <div className="md:hidden space-y-3">
              {dataAlumnosFaltas.map((a, i) => (
                <div key={a.documento + i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{a.nombre}</h3>
                      <p className="text-sm text-gray-500">Doc: {a.documento}</p>
                    </div>
                    <div className="ml-3 px-2 py-1 bg-red-100 rounded-full">
                      <span className="text-sm font-bold text-red-700">{a.faltas} faltas</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Grado:</span>
                      <span className="ml-1 text-gray-900">{a.grado}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sección:</span>
                      <span className="ml-1 text-gray-900">{a.seccion}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold">Documento</th>
                    <th className="px-4 py-3 text-left font-semibold">Grado</th>
                    <th className="px-4 py-3 text-left font-semibold">Sección</th>
                    <th className="px-4 py-3 text-center font-semibold">Faltas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dataAlumnosFaltas.map((a, i) => (
                    <tr key={a.documento + i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{a.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{a.documento}</td>
                      <td className="px-4 py-3 text-gray-600">{a.grado}</td>
                      <td className="px-4 py-3 text-gray-600">{a.seccion}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs">
                          {a.faltas}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
