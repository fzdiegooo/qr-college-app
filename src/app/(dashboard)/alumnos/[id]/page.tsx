"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Usuario, Asistencia, InfoContacto } from "@/types/database.types";
import { usuarioService } from "@/services/alumnosService";
import { asistenciaService } from "@/services/asistenciaService";
import { infoContactoService } from "@/services/infoContactoService";
import QRCode from "qrcode";
import {
  FaArrowLeft,
  FaDownload,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter,
  FaTimes,
  FaPrint,
} from "react-icons/fa";
import { Temporal } from "temporal-polyfill";

export default function AlumnoDetallePage() {

  // Estados para edición de usuario y contacto (después de definir alumno e infoContacto)
  const [editNombre, setEditNombre] = useState("");
  const [editDocumento, setEditDocumento] = useState("");
  const [editEdad, setEditEdad] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");
  const [editCorreo, setEditCorreo] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editContactoNombre, setEditContactoNombre] = useState("");
  const [editContactoSuccess, setEditContactoSuccess] = useState("");
  const [editContactoError, setEditContactoError] = useState("");

  const [alumno, setAlumno] = useState<Usuario | null>(null);
  const [infoContacto, setInfoContacto] = useState<InfoContacto | null>(null);
  const [loadingContacto, setLoadingContacto] = useState(false);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAsistencias, setLoadingAsistencias] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setEditContactoNombre(infoContacto?.nombre || "");
    setEditCorreo(infoContacto?.correo || "");
    setEditTelefono(infoContacto?.telefono || "");
  }, [infoContacto]);

  useEffect(() => {
    setEditNombre(alumno?.nombre || "");
    setEditDocumento(alumno?.documento || "");
    setEditEdad(alumno?.edad ? String(alumno.edad) : "");
  }, [alumno]);
  const router = useRouter();
  const params = useParams();
  const alumnoId = params.id as string;
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Paginación para asistencias
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAsistencias, setTotalAsistencias] = useState(0);
  const PAGE_SIZE = 10;

  // Filtros para asistencias
  const [filtros, setFiltros] = useState<any>({});

  useEffect(() => {
    loadAlumnoData();
  }, [alumnoId]);

  useEffect(() => {
    if (alumno) {
      loadInfoContacto();
    }
  }, [alumno]);
  const loadInfoContacto = async () => {
    setLoadingContacto(true);
    try {
      const contacto = await infoContactoService.getByUsuarioId(alumno!.id);
      setInfoContacto(contacto);
    } catch (error) {
      setInfoContacto(null);
      console.error("Error al cargar info de contacto:", error);
    } finally {
      setLoadingContacto(false);
    }
  };

  useEffect(() => {
    if (alumno) {
      loadAsistencias();
      generateQR();
    }
  }, [alumno, currentPage, filtros]);

  const loadAlumnoData = async () => {
    try {
      setLoading(true);
      const alumnoData = await usuarioService.getById(alumnoId);
      setAlumno(alumnoData);
    } catch (error) {
      console.error("Error al cargar alumno:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAsistencias = async () => {
    if (!alumno) return;
    
    try {
      setLoadingAsistencias(true);
      const { data, count } = await asistenciaService.getByUsuarioId(alumno.id, {
        page: currentPage,
        limit: PAGE_SIZE,
        filters: filtros,
      });
      setAsistencias(data);
      setTotalAsistencias(count);
    } catch (error) {
      console.error("Error al cargar asistencias:", error);
    } finally {
      setLoadingAsistencias(false);
    }
  };

  const generateQR = async () => {
    if (!alumno || !qrCanvasRef.current) return;

    try {
      await QRCode.toCanvas(qrCanvasRef.current, alumno.documento, {
        width: 200,
        margin: 2,
        color: {
          dark: "#8B1A1A",
          light: "#FFFFFF",
        },
      });
      setQrGenerated(true);
    } catch (error) {
      console.error("Error al generar QR:", error);
    }
  };

  const downloadQR = () => {
    if (!qrCanvasRef.current || !alumno) return;

    const link = document.createElement("a");
    link.download = `qr-${alumno.nombre.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = qrCanvasRef.current.toDataURL();
    link.click();
  };

  const printQR = () => {
    if (!qrCanvasRef.current || !alumno) return;

    const printWindow = window.open("", "_blank");
    const qrDataUrl = qrCanvasRef.current.toDataURL();
    
    printWindow?.document.write(`
      <html>
        <head>
          <title>QR - ${alumno.nombre}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px; 
            }
            .qr-container { 
              display: inline-block; 
              border: 2px solid #8B1A1A; 
              padding: 20px; 
              border-radius: 10px; 
            }
            h2 { color: #8B1A1A; margin-bottom: 10px; }
            p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>${alumno.nombre}</h2>
            <p>Documento: ${alumno.documento}</p>
            <p>Grado: ${(alumno.grado as any)?.nombre || "—"} - Sección: ${(alumno.seccion as any)?.nombre || "—"}</p>
            <br>
            <img src="${qrDataUrl}" alt="Código QR" />
            <br><br>
            <p style="font-size: 12px; color: #666;">Código QR para registro de asistencia</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow?.document.close();
    printWindow?.print();
  };

  const handleFilterChange = (key: string, value: any) => {
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
    setCurrentPage(1);
  };

  const formatFecha = (fecha: string) => {
    const plainDate = Temporal.PlainDate.from(fecha);
    return plainDate.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatHora = (hora: string) => {
    const plainTime = Temporal.PlainTime.from(hora);
    return plainTime.toLocaleString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(totalAsistencias / PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Alumno no encontrado</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-[#8B1A1A] text-white rounded-lg hover:bg-[#6B1414] transition-colors"
        >
          Volver
        </button>
      </div>
    );
  }

  // ...existing code...

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detalle del Alumno</h1>
          <p className="text-gray-500">Información completa y registro de asistencias</p>
        </div>
      </div>

      {/* Información del alumno y QR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información personal y contacto */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  // Editar datos del usuario
                  try {
                    await usuarioService.update(alumno.id, {
                      nombre: editNombre,
                      documento: editDocumento,
                      edad: Number(editEdad),
                    });
                    setAlumno({ ...alumno, nombre: editNombre, documento: editDocumento, edad: Number(editEdad) });
                    setEditSuccess('Datos actualizados correctamente');
                  } catch (err) {
                    setEditError('Error al actualizar datos');
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Documento</label>
                  <input
                    type="text"
                    className="w-full rounded border px-3 py-2"
                    value={editDocumento}
                    onChange={(e) => setEditDocumento(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Edad</label>
                  <input
                    type="number"
                    className="w-full rounded border px-3 py-2"
                    value={editEdad}
                    onChange={(e) => setEditEdad(e.target.value)}
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar datos</button>
                {editSuccess && <p className="text-green-600 text-sm mt-2">{editSuccess}</p>}
                {editError && <p className="text-red-600 text-sm mt-2">{editError}</p>}
              </form>
              {infoContacto ? (
                <form
                  className="space-y-4 mt-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    // Editar info de contacto
                    try {
                      const contacto = await infoContactoService.update(infoContacto.id, {
                        nombre: editContactoNombre,
                        correo: editCorreo,
                        telefono: editTelefono,
                      });
                      setInfoContacto(contacto);
                      setEditContactoSuccess('Contacto actualizado correctamente');
                    } catch (err) {
                      setEditContactoError('Error al actualizar contacto');
                    }
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nombre del contacto</label>
                    <input
                      type="text"
                      className="w-full rounded border px-3 py-2"
                      value={editContactoNombre}
                      onChange={(e) => setEditContactoNombre(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Correo electrónico</label>
                    <input
                      type="email"
                      className="w-full rounded border px-3 py-2"
                      value={editCorreo}
                      onChange={(e) => setEditCorreo(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
                    <input
                      type="text"
                      className="w-full rounded border px-3 py-2"
                      value={editTelefono}
                      onChange={(e) => setEditTelefono(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar contacto</button>
                  {editContactoSuccess && <p className="text-green-600 text-sm mt-2">{editContactoSuccess}</p>}
                  {editContactoError && <p className="text-red-600 text-sm mt-2">{editContactoError}</p>}
                </form>
              ) : (
                <form
                  className="space-y-4 mt-6"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    // Crear info de contacto
                    try {
                      const contacto = await infoContactoService.create({
                        usuarioid: alumno.id,
                        nombre: editContactoNombre,
                        correo: editCorreo,
                        telefono: editTelefono,
                      });
                      setInfoContacto(contacto);
                      setEditContactoSuccess('Contacto creado correctamente');
                    } catch (err) {
                      setEditContactoError('Error al crear contacto');
                    }
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nombre del contacto</label>
                    <input
                      type="text"
                      className="w-full rounded border px-3 py-2"
                      value={editContactoNombre}
                      onChange={(e) => setEditContactoNombre(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Correo electrónico</label>
                    <input
                      type="email"
                      className="w-full rounded border px-3 py-2"
                      value={editCorreo}
                      onChange={(e) => setEditCorreo(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
                    <input
                      type="text"
                      className="w-full rounded border px-3 py-2"
                      value={editTelefono}
                      onChange={(e) => setEditTelefono(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Crear contacto</button>
                  {editContactoSuccess && <p className="text-green-600 text-sm mt-2">{editContactoSuccess}</p>}
                  {editContactoError && <p className="text-red-600 text-sm mt-2">{editContactoError}</p>}
                </form>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Grado</label>
                <p className="text-gray-900">{(alumno.grado as any)?.nombre || "No asignado"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Sección</label>
                <p className="text-gray-900">{(alumno.seccion as any)?.nombre || "No asignada"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Sexo</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${alumno.sexo === "M" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                  {alumno.sexo === "M" ? "Masculino" : "Femenino"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Código QR */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Código QR</h2>
          <div className="text-center space-y-4">
            <div className="inline-block p-4 border-2 border-gray-200 rounded-lg">
              <canvas ref={qrCanvasRef} className="mx-auto" />
            </div>
            {qrGenerated && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={downloadQR}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#8B1A1A] text-white rounded-lg hover:bg-[#6B1414] transition-colors"
                >
                  <FaDownload className="text-sm" />
                  Descargar QR
                </button>
                <button
                  onClick={printQR}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaPrint className="text-sm" />
                  Imprimir QR
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historial de Asistencias */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Historial de Asistencias
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Registro completo de asistencias del alumno
              </p>
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaFilter className="text-sm" />
              Filtros
            </button>
          </div>
        </div>

        {loadingAsistencias ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B1A1A] mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando asistencias...</p>
          </div>
        ) : asistencias.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No hay registros de asistencia
          </div>
        ) : (
          <>
            {/* Vista móvil - Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {asistencias.map((asistencia) => (
                <div key={asistencia.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-green-500" />
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          asistencia.estado === 'ASISTENCIA'
                            ? "bg-green-100 text-green-700"
                            : asistencia.estado === 'TARDANZA'
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {asistencia.estado}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatFecha(asistencia.fecha)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Llegada:</span>
                      <span className="ml-2 text-gray-900">
                        {asistencia.hora_llegada || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Salida:</span>
                      <span className="ml-2 text-gray-900">
                        {asistencia.hora_salida || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vista desktop - Tabla */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#8B1A1A] to-[#6B1414] text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Hora Llegada
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Hora Salida
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {asistencias.map((asistencia) => (
                    <tr key={asistencia.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FaCheckCircle className="text-green-500" />
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              asistencia.estado === 'ASISTENCIA'
                                ? "bg-green-100 text-green-700"
                                : asistencia.estado === 'TARDANZA'
                                ? "bg-red-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {asistencia.estado}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400 text-sm" />
                          {formatFecha(asistencia.fecha)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        <div className="flex items-center gap-2">
                          <FaClock className="text-gray-400 text-sm" />
                          {asistencia.hora_llegada || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        <div className="flex items-center gap-2">
                          <FaClock className="text-gray-400 text-sm" />
                          {asistencia.hora_salida || "—"}
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
        {totalPages > 1 && (
          <div className="border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, totalAsistencias)} de{" "}
                {totalAsistencias} registros
              </span>
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-md border disabled:opacity-50 hover:bg-gray-50"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-md border ${
                        pageNum === currentPage
                          ? "bg-[#8B1A1A] text-white border-[#8B1A1A]"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-md border disabled:opacity-50 hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Modal de filtros */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Filtrar Asistencias
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha desde
                </label>
                <input
                  type="date"
                  value={filtros.fechaDesde || ""}
                  onChange={(e) =>
                    handleFilterChange("fechaDesde", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha hasta
                </label>
                <input
                  type="date"
                  value={filtros.fechaHasta || ""}
                  onChange={(e) =>
                    handleFilterChange("fechaHasta", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filtros.presente !== undefined ? String(filtros.presente) : ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "presente",
                      e.target.value === "" ? undefined : e.target.value === "true"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="true">Presente</option>
                  <option value="false">Ausente</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-2 bg-[#8B1A1A] text-white rounded-lg hover:bg-[#6B1414] transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}