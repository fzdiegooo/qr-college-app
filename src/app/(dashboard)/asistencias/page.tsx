"use client";


import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Html5Qrcode } from "html5-qrcode";
import { getAllAsistencias } from "@/services/asistenciaService";
import { usuarioService } from "@/services/alumnosService";
import { infoContactoService } from "@/services/infoContactoService";
import { Asistencia } from "@/types/database.types";
import { FaSearch } from "react-icons/fa";
import { Temporal, toTemporalInstant } from "temporal-polyfill";


export default function AsistenciasPage() {
  const { role, loading: authLoading } = useAuth();
  // Tabs
  // Si es PORTERO, solo mostrar 'registrar'
  const isPortero = role === 'PORTERO';
  const [tab, setTab] = useState<'registros' | 'registrar'>(isPortero ? 'registrar' : 'registros');

  // Si el rol cambia a PORTERO en caliente, forzar tab a 'registrar'
  useEffect(() => {
    if (isPortero && tab !== 'registrar') {
      setTab('registrar');
    }
  }, [isPortero, tab]);

  // Para escaneo QR
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stopping, setStopping] = useState(false);
  const autoRestartTimeout = useRef<NodeJS.Timeout | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const html5Qr = useRef<Html5Qrcode | null>(null);

  // Para registros
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [loadingRegistros, setLoadingRegistros] = useState(false);
  const [search, setSearch] = useState("");
  // Filtro de fecha usando temporal-polyfill y zona horaria Lima
  const timeZone = 'America/Lima';
  const todayPlain = Temporal.Now.plainDateISO(timeZone);
  const todayStr = todayPlain.toString();
  const [fecha, setFecha] = useState(todayStr);

  // Función para detener el escáner de forma segura
  const stopScanner = async () => {
    if (stopping) return; // Evitar múltiples llamadas
    
    setStopping(true);
    
    try {
      if (html5Qr.current) {
        try {
          // Verificar si el escáner está corriendo antes de intentar detenerlo
          const state = await html5Qr.current.getState();
          console.log("Estado actual del escáner:", state);
          
          // Estados: 0 = NOT_STARTED, 1 = PAUSED, 2 = SCANNING
          if (state === 2) { // Solo detener si está escaneando
            console.log("Deteniendo escáner...");
            await html5Qr.current.stop();
            console.log("Escáner detenido correctamente");
          } else {
            console.log("El escáner no está corriendo, estado:", state);
          }
        } catch (getStateError) {
          console.warn("Error al obtener estado:", getStateError);
          // Si no podemos obtener el estado, intentar detener con cuidado
          try {
            await html5Qr.current.stop();
            console.log("Escáner detenido (método alternativo)");
          } catch (stopError) {
            console.warn("Error al detener escáner:", stopError);
            // Si el error es "scanner is not running", es aceptable
            const errorMessage = stopError instanceof Error ? stopError.message : String(stopError);
            if (!errorMessage.includes("scanner is not running") && !errorMessage.includes("paused")) {
              throw stopError;
            } else {
              console.log("Escáner ya estaba detenido o pausado");
            }
          }
        }
        html5Qr.current = null;
      }
    } catch (e) {
      console.warn("Error general al detener escáner:", e);
    }
    
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
    }
    
    // Limpiar timeout si existe
    if (autoRestartTimeout.current) {
      clearTimeout(autoRestartTimeout.current);
      autoRestartTimeout.current = null;
    }
    
    setScanning(false);
    setStopping(false);
  };

  // QR sólo si tab === 'registrar'
  useEffect(() => {
    console.log("useEffect QR:", { tab, scanning, stopping });
    
    // Si no estamos en el tab de registrar, limpiar todo
    if (tab !== 'registrar') {
      if (html5Qr.current) {
        try {
          html5Qr.current.stop().catch((error) => {
            console.warn("Error al detener escáner al cambiar tab:", error);
          });
        } catch (e) {
          console.warn("Error al intentar detener escáner:", e);
        }
        html5Qr.current = null;
      }
      if (qrRef.current) {
        qrRef.current.innerHTML = "";
      }
      setScanning(false);
      setStopping(false);
      return;
    }

    // Si no está escaneando o está deteniendo, no hacer nada
    if (!scanning || stopping) {
      return;
    }

    let isActive = true;
    let scannerInstance: Html5Qrcode | null = null;
    
    const startScanner = async () => {
      if (!qrRef.current || !isActive) return;
      
      try {
        console.log("Iniciando escáner QR...");
        
        // Limpiar contenedor completamente
        qrRef.current.innerHTML = "";
        
        // Crear nueva instancia
        scannerInstance = new Html5Qrcode(qrRef.current.id);
        html5Qr.current = scannerInstance;
        
        await scannerInstance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (!isActive) return;
            console.log("QR detectado:", decodedText);
            await handleScan(decodedText);
          },
          (errorMessage) => {
            // Ignorar errores de escaneo (son normales)
          }
        );
        
        console.log("Escáner iniciado correctamente");
      } catch (error) {
        console.error("Error al iniciar escáner:", error);
        setError("Error al iniciar la cámara. Verifica los permisos.");
        setScanning(false);
        setStopping(false);
      }
    };

    startScanner();
    
    return () => {
      console.log("Limpiando useEffect QR");
      isActive = false;
      if (scannerInstance) {
        // Intentar detener de forma segura, ignorando errores
        try {
          scannerInstance.stop().catch((error) => {
            console.warn("Error al limpiar escáner (esperado):", error);
          });
        } catch (e) {
          console.warn("Error al intentar detener escáner:", e);
        }
      }
    };
  }, [scanning, tab]);

  const handleScan = async (decodedText: string) => {
    // Detener el escáner inmediatamente
    setScanning(false);
    setResult(null);
    setError(null);
    setLoading(true);

    try {
      // Se espera que el QR contenga el id del usuario
      const documento = decodedText.trim();
      const usuarioId = (await usuarioService.getByDocumento(documento)).id;
      // Registrar asistencia
      const res = await fetch("/api/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId }),
      });
      const data = await res.json();

      // Si la asistencia se registró correctamente, buscar datos y enviar correo
      if (res.ok) {
        setResult(data.message || "Asistencia registrada");

        // Obtener datos del usuario y contacto
        const usuario = await usuarioService.getById(usuarioId);
        const contacto = await infoContactoService.getByUsuarioId(usuarioId);

        // Enviar correo al microservicio con el tipo correcto (solo si hay contacto)
        if (contacto?.correo) {
          await fetch("http://86.48.21.43:3100/api/send-school-attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: contacto.correo,
              templateId: 1,
              parentName: contacto.nombre,
              studentName: usuario.nombre,
              grade: (usuario.grado as any)?.nombre || "",
              section: (usuario.seccion as any)?.nombre || "",
              actionType: data.actionType || "entrada"
            })
          });
        }
      } else {
        setError(data.error || "Error al registrar asistencia");
      }
    } catch (e) {
      setError("Error de red o inesperado");
    } finally {
      setLoading(false);

      // Limpiar timeout anterior si existe
      if (autoRestartTimeout.current) {
        clearTimeout(autoRestartTimeout.current);
      }

      // Reactivar escáner automáticamente después de 3s
      autoRestartTimeout.current = setTimeout(() => {
        setResult(null);
        setError(null);
        setStopping(false);
        setScanning(true);
      }, 3000);
    }
  };

  // Limpiar timeout si el componente se desmonta
  useEffect(() => {
    return () => {
      if (autoRestartTimeout.current) {
        clearTimeout(autoRestartTimeout.current);
        autoRestartTimeout.current = null;
      }
      stopScanner();
    };
  }, []);

  // Cargar asistencias del día actual
  // Solo pedir datos al cambiar fecha o página
  useEffect(() => {
    if (tab !== 'registros') return;
    const fetchAsistencias = async () => {
      setLoadingRegistros(true);
      try {
        const { data } = await getAllAsistencias({
          page,
          limit: PAGE_SIZE,
          filters: { fecha },
        });
        setAsistencias(data);
        setTotal(data.length);
      } catch (e) {
        setAsistencias([]);
        setTotal(0);
      } finally {
        setLoadingRegistros(false);
      }
    };
    fetchAsistencias();
  }, [tab, page, fecha]);

  // Filtrar por nombre en frontend (sin pedir datos)
  const asistenciasFiltradas = search.trim()
    ? asistencias.filter(a => a.usuarios?.nombre?.toLowerCase().includes(search.trim().toLowerCase()))
    : asistencias;

  if (authLoading) {
    return <div className="p-8 text-center text-gray-500">Cargando autenticación...</div>;
  }

  return (
    <div className="mx-auto space-y-4 md:space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 md:gap-2 mb-4 md:mb-6 overflow-x-auto">
        {isPortero ? (
          <button
            className={`px-3 md:px-5 py-2 rounded-t-md font-semibold border-b-2 transition-colors text-sm md:text-base whitespace-nowrap ${'border-[#8B1A1A] text-[#8B1A1A] bg-white'}`}
            disabled
          >
            Registrar asistencia
          </button>
        ) : (
          <>
            <button
              className={`px-3 md:px-5 py-2 rounded-t-md font-semibold border-b-2 transition-colors text-sm md:text-base whitespace-nowrap ${tab === 'registros' ? 'border-[#8B1A1A] text-[#8B1A1A] bg-white' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setTab('registros')}
            >
              Registros
            </button>
            <button
              className={`px-3 md:px-5 py-2 rounded-t-md font-semibold border-b-2 transition-colors text-sm md:text-base whitespace-nowrap ${tab === 'registrar' ? 'border-[#8B1A1A] text-[#8B1A1A] bg-white' : 'border-transparent text-gray-500 bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setTab('registrar')}
            >
              Registrar asistencia
            </button>
          </>
        )}
      </div>

      {/* Contenido de cada tab */}
      {(!isPortero && tab === 'registros') && (
        <div className="bg-white rounded-xl shadow-md p-3 md:p-6 text-left">
          <div className="flex flex-col gap-3 mb-4">
            <div className="font-semibold text-lg text-gray-800">Registros</div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={e => {
                    // Normalizar a formato YYYY-MM-DD Lima
                    try {
                      const d = Temporal.PlainDate.from(e.target.value);
                      setFecha(d.toString());
                    } catch {
                      setFecha(e.target.value);
                    }
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent text-sm"
                  max={todayStr}
                />
              </div>
              <div className="relative w-full sm:w-64">
                <label className="block text-xs font-medium text-gray-600 mb-1 sm:invisible">Buscar</label>
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setPage(1)}
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
          {loadingRegistros ? (
            <div className="px-6 py-12 text-center">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1A1A]"></div>
              </div>
            </div>
          ) : asistenciasFiltradas.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No se encontraron asistencias
            </div>
          ) : (
            <>
              {/* Vista móvil - Cards */}
              <div className="md:hidden divide-y divide-gray-200">
                {asistenciasFiltradas.map((a) => (
                  <div key={a.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {a.usuarios?.nombre || 'Sin nombre'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Doc: {a.usuarios?.documento || '—'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full font-medium text-xs ml-3 ${
                        a.estado === 'ASISTENCIA'
                          ? 'bg-green-100 text-green-700'
                          : a.estado === 'TARDANZA'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {a.estado}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Llegada:</span>
                        <span className="ml-2 text-gray-900">{a.hora_llegada || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Salida:</span>
                        <span className="ml-2 text-gray-900">{a.hora_salida || '—'}</span>
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
                      <th className="px-4 py-3 text-left text-sm font-semibold">Alumno</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Documento</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Hora llegada</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Hora salida</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {asistenciasFiltradas.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800 text-sm">{a.usuarios?.nombre || '—'}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{a.usuarios?.documento || '—'}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{a.hora_llegada || '—'}</td>
                        <td className="px-4 py-3 text-gray-600 text-sm">{a.hora_salida || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-medium text-xs ${
                            a.estado === 'ASISTENCIA'
                              ? 'bg-green-100 text-green-700'
                              : a.estado === 'TARDANZA'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {a.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {/* Paginación */}
          <div className="border-t px-3 py-3 md:px-6 md:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span className="text-xs md:text-sm text-gray-600 text-center md:text-left">
              {asistenciasFiltradas.length === 0 ? (
                "Sin registros"
              ) : (
                <>
                  <span className="md:hidden">
                    {asistenciasFiltradas.length} registros
                  </span>
                  <span className="hidden md:inline">
                    Mostrando 1–{asistenciasFiltradas.length} de {asistenciasFiltradas.length}
                  </span>
                </>
              )}
            </span>
            {/* Si quieres paginar el resultado filtrado, implementa paginación aquí sobre asistenciasFiltradas */}
          </div>
        </div>
      )}

      {(isPortero || tab === 'registrar') && (
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-lg md:text-xl font-bold mb-2">Registro de Asistencias</h2>
            <p className="mb-4 text-gray-600 text-sm md:text-base">Escanea el QR del alumno para registrar su asistencia.</p>

            <div className="flex flex-col items-center space-y-4">
              {!scanning && !result && !error && !stopping && (
                <button
                  className="w-full max-w-xs px-6 py-3 bg-[#8B1A1A] text-white rounded-lg hover:bg-[#6B1414] font-semibold text-sm md:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    setResult(null);
                    setError(null);
                    setStopping(false);
                    setScanning(true);
                  }}
                  disabled={loading || stopping}
                >
                  {loading ? "Procesando..." : "Iniciar escáner QR"}
                </button>
              )}

              {/* QR Reader Container */}
              <div className="w-full max-w-xs mx-auto">
                <div 
                  id="qr-reader-container" 
                  ref={qrRef} 
                  style={{ 
                    width: "100%", 
                    maxWidth: "320px",
                    height: scanning ? "320px" : "0",
                    margin: "auto",
                    display: scanning ? "block" : "none",
                    borderRadius: "8px",
                    overflow: "hidden"
                  }} 
                />
              </div>

              {/* Botón de Stop cuando está escaneando */}
              {scanning && !stopping && (
                <button
                  className="w-full max-w-xs px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm md:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    console.log("Botón stop clickeado");
                    stopScanner();
                  }}
                  disabled={stopping}
                >
                  {stopping ? "Deteniendo..." : "Detener escáner"}
                </button>
              )}

              {/* Indicador de loading cuando está deteniendo */}
              {stopping && (
                <div className="w-full max-w-xs p-4 bg-gray-100 text-gray-600 rounded-lg text-center">
                  <div className="font-medium">Deteniendo escáner...</div>
                </div>
              )}

              {result && (
                <div className="w-full max-w-xs p-4 bg-green-100 text-green-800 rounded-lg text-center">
                  <div className="font-semibold mb-1">{result}</div>
                  <div className="text-xs text-green-600">Preparando escáner para el siguiente...</div>
                </div>
              )}
              
              {error && (
                <div className="w-full max-w-xs p-4 bg-red-100 text-red-800 rounded-lg text-center">
                  <div className="font-semibold mb-1">{error}</div>
                  <div className="text-xs text-red-600">Preparando escáner para el siguiente...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
