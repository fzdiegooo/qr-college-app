import { supabase } from '../lib/supabase';
import { Seccion } from '../types/database.types';

export interface Paginacion {
  page: number;
  limit: number;
}

export interface SeccionFiltro {
  nombre?: string;
}

export const getSecciones = async (filtros?: SeccionFiltro, paginacion?: Paginacion) => {
  let query = supabase.from('seccion').select('*');

  if (filtros?.nombre) query = query.ilike('nombre', `%${filtros.nombre}%`);

  if (paginacion?.page && paginacion?.limit) {
    const start = (paginacion.page - 1) * paginacion.limit;
    const end = start + paginacion.limit - 1;
    query = query.range(start, end);
  }

  query = query.order('nombre', { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return data as Seccion[];
};

export const getSeccionById = async (id: number): Promise<Seccion | null> => {
  const { data, error } = await supabase
    .from('seccion')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createSeccion = async (seccion: Omit<Seccion, 'id' | 'created_at' | 'updated_at'>): Promise<Seccion> => {
  const { data, error } = await supabase
    .from('seccion')
    .insert(seccion as never)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateSeccion = async (id: number, seccion: Partial<Omit<Seccion, 'id' | 'created_at' | 'updated_at'>>): Promise<Seccion> => {
  const { data, error } = await supabase
    .from('seccion')
    .update(seccion as never)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteSeccion = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('seccion')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const seccionService = {
  getAll: getSecciones,
  getById: getSeccionById,
  search: (query: string) => getSecciones({ nombre: query }),
  create: createSeccion,
  update: updateSeccion,
  delete: deleteSeccion,
};
 