import { supabase } from '../lib/supabase';
import { Rol } from '../types/database.types';

export interface Paginacion {
  page: number;
  limit: number;
}

export interface RolFiltro {
  nombre?: string;
}

export const getRoles = async (filtros?: RolFiltro, paginacion?: Paginacion) => {
  let query = supabase.from('rol').select('*');

  // Filtros
  if (filtros?.nombre) query = query.ilike('nombre', `%${filtros.nombre}%`);

  // Paginación
  if (paginacion?.page && paginacion?.limit) {
    const start = (paginacion.page - 1) * paginacion.limit;
    const end = start + paginacion.limit - 1;
    query = query.range(start, end);
  }

  // Orden
  query = query.order('nombre', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data as Rol[];
};

export const getRolById = async (id: number): Promise<Rol | null> => {
  const { data, error } = await supabase
    .from('rol')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createRol = async (rol: Omit<Rol, 'id' | 'created_at' | 'updated_at'>): Promise<Rol> => {
  const { data, error } = await supabase
    .from('rol')
    .insert(rol as never)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateRol = async (id: number, rol: Partial<Omit<Rol, 'id' | 'created_at' | 'updated_at'>>): Promise<Rol> => {
  const { data, error } = await supabase
    .from('rol')
    .update(rol as never)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteRol = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('rol')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const rolService = {
  getAll: getRoles,
  getById: getRolById,
  search: (query: string) => getRoles({ nombre: query }),
  create: createRol,
  update: updateRol,
  delete: deleteRol,
};
