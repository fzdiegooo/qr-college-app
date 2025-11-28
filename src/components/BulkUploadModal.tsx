"use client";
import { useState } from "react";
import { FaTimes, FaFileUpload, FaDownload, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { parseExcelFile } from "@/utils/excelParser";
import { usuarioService } from "@/services/alumnosService";
import { BulkStudentData, BulkCreateResponse } from "@/types/database.types";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<BulkStudentData[]>([]);
  const [parseErrors, setParseErrors] = useState<Array<{ row: number; error: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkCreateResponse | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      alert('Por favor selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }

    setFile(selectedFile);
    setParseErrors([]);
    setParsedData([]);
    setUploadResult(null);
    setShowResults(false);

    try {
      const result = await parseExcelFile(selectedFile);
      setParsedData(result.data);
      setParseErrors(result.errors);
    } catch (error: any) {
      alert(error.message || 'Error al leer el archivo');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) {
      alert('No hay datos válidos para cargar');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await usuarioService.createBulk(parsedData);
      setUploadResult(result);
      setShowResults(true);
    } catch (error: any) {
      alert(error.message || 'Error al cargar los alumnos');
      setShowResults(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    // Call onSuccess if there were created students
    if (uploadResult && uploadResult.created > 0) {
      onSuccess();
    }
    
    setFile(null);
    setParsedData([]);
    setParseErrors([]);
    setUploadResult(null);
    setShowResults(false);
    onClose();
  };

  const handleDownloadTemplate = () => {
    window.open("https://docs.google.com/spreadsheets/d/17qi9vg9H9v4NnFlLSYGxm-FTpU2PrItZJVJQFbSHscM/edit?usp=sharing", "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-800">Matrícula Masiva</h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!showResults ? (
            <>
              {/* Download Template Button */}
              <div className="mb-6">
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <FaDownload />
                  Plantilla Excel
                </button>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar archivo Excel
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#8B1A1A] file:text-white hover:file:bg-[#6B1414] cursor-pointer"
                  />
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Archivo seleccionado: <span className="font-medium">{file.name}</span>
                  </p>
                )}
              </div>

              {/* Parse Errors */}
              {parseErrors.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <FaExclamationTriangle />
                    Errores encontrados ({parseErrors.length})
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    <ul className="space-y-1 text-sm text-red-800">
                      {parseErrors.map((err, idx) => (
                        <li key={idx}>
                          Fila {err.row}: {err.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Preview Data */}
              {parsedData.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Vista previa ({parsedData.length} alumnos)
                  </h4>
                  <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Nombre</th>
                          <th className="px-3 py-2 text-left">DNI</th>
                          <th className="px-3 py-2 text-left">Edad</th>
                          <th className="px-3 py-2 text-left">Grado</th>
                          <th className="px-3 py-2 text-left">Sección</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {parsedData.map((alumno, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2">{idx + 1}</td>
                            <td className="px-3 py-2">{alumno.nombres} {alumno.apellidos}</td>
                            <td className="px-3 py-2">{alumno.nro_documento}</td>
                            <td className="px-3 py-2">{alumno.edad}</td>
                            <td className="px-3 py-2">{alumno.grado}</td>
                            <td className="px-3 py-2">{alumno.seccion}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Results Summary */
            <div className="space-y-6">
              <div className="text-center">
                <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-gray-800 mb-2">
                  Proceso Completado
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-700">
                    {uploadResult?.created || 0}
                  </div>
                  <div className="text-sm text-green-600 mt-1">Creados</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-700">
                    {uploadResult?.skipped || 0}
                  </div>
                  <div className="text-sm text-yellow-600 mt-1">Omitidos (ya existían)</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-700">
                    {uploadResult?.failed || 0}
                  </div>
                  <div className="text-sm text-red-600 mt-1">Fallidos</div>
                </div>
              </div>

              {/* Skipped Students */}
              {uploadResult && uploadResult.skippedStudents.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-900 mb-2">
                    Alumnos omitidos (ya registrados):
                  </h5>
                  <ul className="space-y-1 text-sm text-yellow-800 max-h-40 overflow-y-auto">
                    {uploadResult.skippedStudents.map((student, idx) => (
                      <li key={idx}>
                        {student.nombre} - DNI: {student.documento}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Errors */}
              {uploadResult && uploadResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h5 className="font-semibold text-red-900 mb-2">
                    Errores:
                  </h5>
                  <ul className="space-y-1 text-sm text-red-800 max-h-40 overflow-y-auto">
                    {uploadResult.errors.map((err, idx) => (
                      <li key={idx}>
                        Fila {err.row} - DNI {err.documento}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-end gap-3">
          {!showResults ? (
            <>
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={parsedData.length === 0 || isProcessing}
                className="px-6 py-2 bg-[#8B1A1A] text-white rounded-lg hover:bg-[#6B1414] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaFileUpload />
                    Cargar Alumnos
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-[#8B1A1A] text-white rounded-lg hover:bg-[#6B1414] transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
