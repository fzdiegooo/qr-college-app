"use client";
import { getGrados } from "@/services/gradoService";
import { getSecciones } from "@/services/seccionService";
import { Usuario, Grado, Seccion } from "@/types/database.types";
import { usuarioService } from "@/services/alumnosService";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [alumnos, setAlumnos] = useState<Usuario[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
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
      const { data, count } = await usuarioService.getAll({
        page: currentPage,
        limit: PAGE_SIZE,
        filters: filtros,
      });
      setAlumnos(data);
      setTotalAlumnos(count);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setFiltros((prev: any) => ({ ...prev, nombre: searchTerm }));
    } else {
      setFiltros((prev: any) => {
        const { nombre, ...resto } = prev;
        return resto;
      });
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: any) => {
    // Solo guardar el filtro si tiene valor
    if (value === "" || value === undefined) {
      const { [key]: _, ...restoFiltros } = filtros;
      setFiltros(restoFiltros);
    } else {
      // Si el filtro es gradoid o seccionid, asegurarse que sea número
      if (["gradoid", "seccionid", "edad", "rolid"].includes(key)) {
        setFiltros({ ...filtros, [key]: Number(value) });
      } else {
        setFiltros({ ...filtros, [key]: value });
      }
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
    <div className="space-y-4 md:space-y-6">
      {/* Toolbar principal */}
      <div className="bg-white rounded-xl shadow-md px-3 py-4 md:px-4 md:py-3">
        <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              Gestión de Alumnos
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Administra la información de los estudiantes
            </p>
          </div>
          
          {/* Barra de búsqueda en móvil */}
          <div className="flex flex-col space-y-2 md:hidden">
            <div className="relative">
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
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 h-9 px-3 rounded-md bg-[#8B1A1A] text-white text-sm flex items-center justify-center gap-2 hover:bg-[#6B1414] transition-colors"
              >
                <FaSearch className="text-xs" /> Buscar
              </button>
              <button
                onClick={() => setShowFilters(true)}
                className="h-9 px-3 rounded-md border border-gray-300 text-sm flex items-center gap-1 hover:bg-gray-50 transition-colors"
              >
                <FaFilter className="text-xs" /> Filtros
              </button>
              <button className="h-9 px-3 rounded-md bg-blue-600 text-white text-sm flex items-center gap-1 hover:bg-blue-700 transition-colors">
                <FaPlus className="text-xs" />
              </button>
            </div>
          </div>

          {/* Barra de búsqueda en desktop */}
          <div className="hidden md:flex flex-wrap gap-2 items-center">
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
          </div>
        </div>
      </div>

      {/* Drawer lateral de filtros */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="bg-black/50 flex-1"
            onClick={() => setShowFilters(false)}
          />
          <div className="w-full max-w-xs bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Grado
                </label>
                <select
                  value={filtros.gradoid || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "gradoid",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent text-sm"
                >
                  <option value="">Todos los grados</option>
                  {grados.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sección
                </label>
                <select
                  value={filtros.seccionid || ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "seccionid",
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent text-sm"
                >
                  <option value="">Todas las secciones</option>
                  {secciones.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sexo
                </label>
                <select
                  value={filtros.sexo || ""}
                  onChange={(e) =>
                    handleFilterChange("sexo", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent text-sm"
                >
                  <option value="">Todos</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex flex-col gap-2">
              <button
                onClick={() => {
                  clearFilters();
                }}
                className="w-full h-10 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Limpiar filtros
              </button>
              <button
                onClick={() => {
                  setShowFilters(false);
                  setCurrentPage(1);
                  loadAlumnos();
                }}
                className="w-full h-10 rounded-lg bg-[#8B1A1A] text-white text-sm font-medium hover:bg-[#6B1414] transition-colors"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
            </div>
          </div>
        ) : alumnos.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No se encontraron alumnos
          </div>
        ) : (
          <>
            {/* Vista mobile - Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {alumnos.map((alumno) => (
                <div key={alumno.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#8B1A1A] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {alumno.nombre.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {alumno.nombre}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Doc: {alumno.documento}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => router.push(`/alumnos/${alumno.id}`)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Ver"
                      >
                        <FaEye className="text-sm" />
                      </button>
                      <button
                        className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors"
                        title="Editar"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Sexo:</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        alumno.sexo === "M"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-pink-100 text-pink-700"
                      }`}>
                        {alumno.sexo === "M" ? "M" : "F"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Edad:</span>
                      <span className="ml-2 text-gray-900">{alumno.edad}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Grado:</span>
                      <span className="ml-2 text-gray-900">
                        {(alumno.grado as any)?.nombre || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sección:</span>
                      <span className="ml-2 text-gray-900">
                        {(alumno.seccion as any)?.nombre || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden md:block overflow-x-auto max-h-[60vh]">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#8B1A1A] to-[#6B1414] text-white sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Documento
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Sexo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Edad
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Grado
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Sección
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {alumnos.map((alumno) => (
                    <tr
                      key={alumno.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#8B1A1A] to-[#3B82F6] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            {alumno.nombre.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">
                            {alumno.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {alumno.documento}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium text-xs ${
                            alumno.sexo === "M"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-pink-100 text-pink-700"
                          }`}
                        >
                          {alumno.sexo === "M" ? "M" : "F"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{alumno.edad}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {(alumno.grado as any)?.nombre || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {(alumno.seccion as any)?.nombre || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => router.push(`/alumnos/${alumno.id}`)}
                            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Ver"
                          >
                            <FaEye className="text-xs" />
                          </button>
                          <button
                            className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                            title="Eliminar"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Paginación */}
        <div className="border-t px-3 py-3 md:px-6 md:py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span className="text-xs md:text-sm text-gray-600 text-center md:text-left">
              {totalAlumnos === 0 ? (
                "Sin registros"
              ) : (
                <>
                  <span className="md:hidden">
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, totalAlumnos)} de{" "}
                    {totalAlumnos}
                  </span>
                  <span className="hidden md:inline">
                    Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, totalAlumnos)} de{" "}
                    {totalAlumnos}
                  </span>
                </>
              )}
            </span>
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-1" aria-label="Paginación">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-md border text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  «
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // En móvil mostrar menos páginas
                    const isMobile = window.innerWidth < 768;
                    if (isMobile) {
                      if (totalPages <= 3) return true;
                      if (p === 1 || p === totalPages) return true;
                      if (Math.abs(p - currentPage) <= 0) return true;
                      return false;
                    }
                    // En desktop usar la lógica original
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
                      className={`h-8 w-8 md:h-9 md:min-w-9 md:px-3 flex items-center justify-center rounded-md border text-sm transition-colors ${
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
                  className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-md border text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  »
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
