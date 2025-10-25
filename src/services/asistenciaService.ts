import { Asistencia, PaginatedResponse } from "@/types/database.types"
import { PaginationParams } from "./helpers"
import { supabase } from "@/lib/supabase"


const TABLE = 'asistencia'

export async function getAllAsistencias({
  page = 1,
  limit = 10,
  filters = {},
}: PaginationParams): Promise<PaginatedResponse<Asistencia>> {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from(TABLE)
    .select(`*, usuarios(id, nombre, documento, grado(nombre), seccion(nombre))`, { count: 'exact' })
    .order('fecha', { ascending: false })
    .range(from, to)

  // Aplicar filtros dinámicos
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) query = query.eq(key, value)
  }

  const { data, error, count } = await query
  if (error) throw error

  return { data: data || [], count: count || 0 }
}

export async function getAsistenciaById(id: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .select(`*, usuario(id, nombre, documento)`)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createAsistencia(asistencia: Omit<Asistencia, 'id'>) {
  const { data, error } = await supabase.from(TABLE).insert(asistencia).select().single()
  if (error) throw error
  return data
}

export async function updateAsistencia(id: number, asistencia: Partial<Asistencia>) {
  const { data, error } = await supabase.from(TABLE).update(asistencia).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteAsistencia(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}

export async function getByUsuarioId(
  usuarioId: string,
  { page = 1, limit = 10, filters = {} }: PaginationParams
): Promise<PaginatedResponse<Asistencia>> {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .eq('usuarioid', usuarioId)
    .order('fecha', { ascending: false })
    .range(from, to)

  // Aplicar filtros dinámicos
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      if (key === 'fechaDesde') {
        query = query.gte('fecha', value)
      } else if (key === 'fechaHasta') {
        query = query.lte('fecha', value)
      } else {
        query = query.eq(key, value)
      }
    }
  }

  const { data, error, count } = await query
  if (error) throw error

  return { data: data || [], count: count || 0 }
}

export const asistenciaService = {
  getAllAsistencias,
  getAsistenciaById,
  createAsistencia,
  updateAsistencia,
  deleteAsistencia,
  getByUsuarioId,
}
