import { supabase } from '../lib/supabase';
import { Grado } from '../types/database.types';

export interface Paginacion {
  page: number;
  limit: number;
}

export interface GradoFiltro {
  nombre?: string;
}

export const getGrados = async (filtros?: GradoFiltro, paginacion?: Paginacion) => {
  let query = supabase.from('grado').select('*');

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
  return data as Grado[];
};

export const getGradoById = async (id: number): Promise<Grado | null> => {
  const { data, error } = await supabase
    .from('grado')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createGrado = async (grado: Omit<Grado, 'id' | 'created_at' | 'updated_at'>): Promise<Grado> => {
  const { data, error } = await supabase
    .from('grado')
    .insert(grado as never)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateGrado = async (id: number, grado: Partial<Omit<Grado, 'id' | 'created_at' | 'updated_at'>>): Promise<Grado> => {
  const { data, error } = await supabase
    .from('grado')
    .update(grado as never)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteGrado = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('grado')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const gradoService = {
  getAll: getGrados,
  getById: getGradoById,
  search: (query: string) => getGrados({ nombre: query }),
  create: createGrado,
  update: updateGrado,
  delete: deleteGrado,
};
