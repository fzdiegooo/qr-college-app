import { supabase } from "@/lib/supabase"
import { PaginationParams } from "./helpers"
import { Configuracion, PaginatedResponse } from "@/types/database.types"


const TABLE = 'configuracion'

export async function getAllConfiguraciones({
  page = 1,
  limit = 10,
  filters = {},
}: PaginationParams): Promise<PaginatedResponse<Configuracion>> {
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase.from(TABLE).select('*', { count: 'exact' }).range(from, to).order('id', { ascending: true })

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) query = query.eq(key, value)
  }

  const { data, error, count } = await query
  if (error) throw error

  return { data: data || [], count: count || 0 }
}

export async function getConfiguracionById(id: number) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createConfiguracion(config: Omit<Configuracion, 'id'>) {
  const { data, error } = await supabase.from(TABLE).insert(config).select().single()
  if (error) throw error
  return data
}

export async function updateConfiguracion(id: number, config: Partial<Configuracion>) {
  const { data, error } = await supabase.from(TABLE).update(config).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteConfiguracion(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}
