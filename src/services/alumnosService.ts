import { supabase } from '@/lib/supabase'
import { buildQuery, PaginationParams } from './helpers'
import { PaginatedResponse, Usuario } from '@/types/database.types'

const TABLE = 'usuarios'

export const usuarioService = {
  async getAll({ page = 1, limit = 10, filters }: PaginationParams): Promise<PaginatedResponse<Usuario>> {
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from(TABLE)
      .select(
        `
        *,
        grado(nombre),
        seccion(nombre),
        rol(nombre)
      `,
        { count: 'exact' }
      )
      // primero por id de grado y luego por id de seccion
      .order('gradoid', { ascending: true })
      .order('seccionid', { ascending: true })
      .order('nombre', { ascending: true })

    query = buildQuery(query, filters)

    const { data, count, error } = await query.range(from, to)
    if (error) throw error
    return { data: (data as unknown) as Usuario[], count: count ?? 0 }
  },

  async getById(id: string): Promise<Usuario> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(
        `
        *,
        grado(nombre),
        seccion(nombre),
        rol(nombre)
      `
      )
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Usuario
  },

  // Excluir relaciones en el payload de creación
  async create(payload: Omit<Usuario, 'id' | 'grado' | 'seccion' | 'rol'>): Promise<Usuario> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(payload)
      .select(
        `
        *,
        grado(nombre),
        seccion(nombre),
        rol(nombre)
      `
      )
      .single()
    if (error) throw error
    return data as Usuario
  },

  async update(id: string, payload: Partial<Omit<Usuario, 'id' | 'grado' | 'seccion' | 'rol'>>): Promise<Usuario> {
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select(
        `
        *,
        grado(nombre),
        seccion(nombre),
        rol(nombre)
      `
      )
      .single()
    if (error) throw error
    return data as Usuario
  },

  async remove(id: string): Promise<boolean> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)
    if (error) throw error
    return true
  },

  async createBulk(students: any[]): Promise<any> {
    const response = await fetch('/api/alumnos/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alumnos: students }),
    });

    if (!response.ok) {
      throw new Error('Error al crear alumnos en masa');
    }

    return response.json();
  },
  
  async getByDocumento(documento: string): Promise<Usuario> {
    const { data, error } = await supabase
      .from(TABLE)
      .select(
        `
        *,
        grado(nombre),
        seccion(nombre),
        rol(nombre)
      `
      )
      .eq('documento', documento)
      .single()
    if (error) throw error
    return data as Usuario
  }
}