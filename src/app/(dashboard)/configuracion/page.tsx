"use client";
import { useEffect, useState } from "react";
import { getAllConfiguraciones, updateConfiguracion } from "@/services/configuracionService";

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllConfiguraciones({ page: 1, limit: 1 });
      setConfig(res.data[0] || null);
    } catch (e: any) {
      setError("Error al cargar configuración");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateConfiguracion(config.id, {
        hora_entrada: config.hora_entrada,
        hora_salida: config.hora_salida,
        hora_falta: config.hora_falta || null,
        tolerancia_minutos: Number(config.tolerancia_minutos),
      });
      setSuccess("Configuración guardada correctamente");
    } catch (e: any) {
      setError("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Configuración</h1>
      {loading ? (
        <div className="text-gray-500">Cargando...</div>
      ) : error ? (
        <div className="text-red-600 font-semibold mb-4">{error}</div>
      ) : !config ? (
        <div className="text-gray-500">No hay configuración registrada.</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 bg-white rounded-xl shadow p-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Hora de entrada</label>
              <input
                type="time"
                name="hora_entrada"
                value={config.hora_entrada || ""}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora de falta</label>
              <input
                type="time"
                name="hora_falta"
                value={config.hora_falta || ""}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tolerancia (minutos)</label>
              <input
                type="number"
                name="tolerancia_minutos"
                value={config.tolerancia_minutos || 0}
                min={0}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hora de salida</label>
              <input
                type="time"
                name="hora_salida"
                value={config.hora_salida || ""}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="bg-[#8B1A1A] text-white px-8 py-2 rounded font-semibold hover:bg-[#6B1414] transition"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
            {success && <div className="text-green-700 text-sm self-center">{success}</div>}
          </div>
        </form>
      )}
    </div>
  );
}
