"use client";
import {
  getAlumnosWithTotal,
  type UsuarioFiltro,
} from "@/services/alumnosService";
import { getGrados } from "@/services/gradoService";
import { getSecciones } from "@/services/seccionService";
import { Usuario, Grado, Seccion } from "@/types/database.types";
import { useEffect, useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

export default function AlumnosPage() {
  const [alumnos, setAlumnos] = useState<Usuario[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState<UsuarioFiltro>({});
  const [showFilters, setShowFilters] = useState(false);
  // Modo compacto fijo (se elimina el toggle)
  const dense = true;

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;
  const [totalAlumnos, setTotalAlumnos] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAlumnos();
  }, [currentPage, filtros]);

  const loadData = async () => {
    try {
      const [gradosData, seccionesData] = await Promise.all([
        getGrados(),
        getSecciones(),
      ]);
      setGrados(gradosData);
      setSecciones(seccionesData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  const loadAlumnos = async () => {
    try {
      setLoading(true);
      const { data, total } = await getAlumnosWithTotal(filtros, {
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setAlumnos(data);
      setTotalAlumnos(total);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setFiltros({ ...filtros, nombre: searchTerm });
    } else {
      const { nombre, ...restoFiltros } = filtros;
      setFiltros(restoFiltros);
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof UsuarioFiltro, value: any) => {
    if (value === "" || value === undefined) {
      const { [key]: _, ...restoFiltros } = filtros;
      setFiltros(restoFiltros);
    } else {
      setFiltros({ ...filtros, [key]: value });
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFiltros({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalAlumnos / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Toolbar principal */}
      <div className="bg-white rounded-xl shadow-md px-4 py-3 flex justify-between flex-wrap gap-3 items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Gestión de Alumnos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra la información de los estudiantes
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative w-72 max-w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar nombre o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="h-9 px-4 rounded-md bg-[#8B1A1A] text-white text-sm flex items-center gap-2 hover:bg-[#6B1414] transition-colors"
          >
            <FaSearch className="text-xs" /> Buscar
          </button>
          <button
            onClick={() => setShowFilters(true)}
            className="h-9 px-4 rounded-md border border-gray-300 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <FaFilter className="text-xs" /> Filtros
          </button>
          <button className="h-9 px-5 rounded-md bg-blue-600 text-white text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <FaPlus className="text-xs" /> Nuevo Alumno
          </button>
        </div>
      </div>

      {/* Drawer lateral de filtros */}
      {showFilters && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="bg-black/30 flex-1"
            onClick={() => setShowFilters(false)}
          />
          <div className="w-full sm:w-80 bg-white h-full shadow-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Grado
                </label>
                <select
                  value={filtros.gradoId || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "gradoId",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent text-sm"
                >
                  <option value="">Todos</option>
                  {grados.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Sección
                </label>
                <select
                  value={filtros.seccionId || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "seccionId",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent text-sm"
                >
                  <option value="">Todas</option>
                  {secciones.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Sexo
                </label>
                <select
                  value={filtros.sexo || ""}
                  onChange={(e) =>
                    handleFilterChange("sexo", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent text-sm"
                >
                  <option value="">Todos</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    clearFilters();
                  }}
                  className="w-full h-9 rounded-md bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => {
                    setShowFilters(false);
                    setCurrentPage(1);
                    loadAlumnos();
                  }}
                  className="w-full h-9 rounded-md bg-[#8B1A1A] text-white text-sm hover:bg-[#6B1414]"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh]">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#8B1A1A] to-[#6B1414] text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left text-xs md:text-sm font-semibold">
                  Nombre
                </th>
                <th className="px-4 py-2 text-left text-xs md:text-sm font-semibold">
                  Documento
                </th>
                <th className="px-4 py-2 text-left text-xs md:text-sm font-semibold">
                  Sexo
                </th>
                <th className="px-4 py-2 text-left text-xs md:text-sm font-semibold">
                  Edad
                </th>
                <th className="px-4 py-2 text-left text-xs md:text-sm font-semibold">
                  Grado
                </th>
                <th className="px-4 py-2 text-left text-xs md:text-sm font-semibold">
                  Sección
                </th>
                <th className="px-4 py-2 text-center text-xs md:text-sm font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
                    </div>
                  </td>
                </tr>
              ) : alumnos.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No se encontraron alumnos
                  </td>
                </tr>
              ) : (
                alumnos.map((alumno) => (
                  <tr
                    key={alumno.id}
                    className="hover:bg-gray-50 transition-colors text-[13px]"
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 text-xs bg-gradient-to-br from-[#8B1A1A] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-semibold">
                          {alumno.nombre.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800 max-w-[140px]">
                          {alumno.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {alumno.documento}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium text-[10px] ${
                          alumno.sexo === "M"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-pink-100 text-pink-700"
                        }`}
                      >
                        {alumno.sexo === "M" ? "M" : "F"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{alumno.edad}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {(alumno.grado as any)?.nombre || "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {(alumno.seccion as any)?.nombre || "—"}
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex justify-center gap-1.5">
                        <button
                          className="rounded-md transition-colors p-1.5 text-blue-600 hover:bg-blue-50"
                          title="Ver"
                        >
                          <FaEye className="text-xs" />
                        </button>
                        <button
                          className="rounded-md transition-colors p-1.5 text-yellow-600 hover:bg-yellow-50"
                          title="Editar"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          className="rounded-md transition-colors p-1.5 text-red-600 hover:bg-red-50"
                          title="Eliminar"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="border-t px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span className="text-sm text-gray-600">
            {totalAlumnos === 0 ? (
              "Sin registros"
            ) : (
              <>
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, totalAlumnos)} de{" "}
                {totalAlumnos}
              </>
            )}
          </span>
          {totalPages > 1 && (
            <nav className="flex items-center gap-1" aria-label="Paginación">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-9 w-9 flex items-center justify-center rounded-md border text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                «
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - currentPage) <= 1) return true;
                  if (currentPage <= 3 && p <= 5) return true;
                  if (currentPage >= totalPages - 2 && p >= totalPages - 4)
                    return true;
                  return false;
                })
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`h-9 min-w-9 px-3 flex items-center justify-center rounded-md border text-sm transition-colors ${
                      p === currentPage
                        ? "bg-[#8B1A1A] text-white border-[#8B1A1A]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="h-9 w-9 flex items-center justify-center rounded-md border text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                »
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
