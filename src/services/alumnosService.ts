import { supabase } from '../lib/supabase';
import { Usuario } from '../types/database.types';

// Tipos para filtros y paginación
export interface UsuarioFiltro {
  gradoId?: number;
  seccionId?: number;
  rolId?: number;
  sexo?: 'M' | 'F';
  nombre?: string;
  documento?: string;
  edadMin?: number;
  edadMax?: number;
}

export interface Paginacion {
  page: number;
  limit: number;
}

export const getUsuarios = async (filtros?: UsuarioFiltro, paginacion?: Paginacion) => {
  let query = supabase
    .from('usuarios')
    .select(`
      *,
      grado(*),
      seccion(*),
      rol(*)
    `);

  // Filtros
  if (filtros?.gradoId) query = query.eq('gradoid', filtros.gradoId);
  if (filtros?.seccionId) query = query.eq('seccionid', filtros.seccionId);
  if (filtros?.rolId) query = query.eq('rolid', filtros.rolId);
  if (filtros?.sexo) query = query.eq('sexo', filtros.sexo);
  if (filtros?.nombre) query = query.ilike('nombre', `%${filtros.nombre}%`);
  if (filtros?.documento) query = query.ilike('documento', `%${filtros.documento}%`);
  if (filtros?.edadMin !== undefined) query = query.gte('edad', filtros.edadMin);
  if (filtros?.edadMax !== undefined) query = query.lte('edad', filtros.edadMax);

  // Paginación
  if (paginacion?.page && paginacion?.limit) {
    const start = (paginacion.page - 1) * paginacion.limit;
    const end = start + paginacion.limit - 1;
    query = query.range(start, end);
  }

  query = query
    .order('id', { foreignTable: 'grado', ascending: true })
    .order('id', { foreignTable: 'seccion', ascending: true })

  const { data, error } = await query;
  if (error) throw error;
  return data as Usuario[];
};

export const getAlumnos = async (filtros?: Omit<UsuarioFiltro, 'rolId'>, paginacion?: Paginacion) => {
  return getUsuarios({ ...filtros, rolId: 1 }, paginacion);
};

// Variante con total usando count: 'exact' (útil para paginación basada en total)
export const getAlumnosWithTotal = async (
  filtros?: Omit<UsuarioFiltro, 'rolId'>,
  paginacion?: Paginacion
): Promise<{ data: Usuario[]; total: number }> => {
  let query = supabase
    .from('usuarios')
    .select(`
      *,
      grado(*),
      seccion(*),
      rol(*)
    `, { count: 'exact' })
    .eq('rolid', 1);

  if (filtros?.gradoId) query = query.eq('gradoid', filtros.gradoId);
  if (filtros?.seccionId) query = query.eq('seccionid', filtros.seccionId);
  if (filtros?.sexo) query = query.eq('sexo', filtros.sexo);
  if (filtros?.nombre) query = query.ilike('nombre', `%${filtros.nombre}%`);
  if (filtros?.documento) query = query.ilike('documento', `%${filtros.documento}%`);
  if (filtros?.edadMin !== undefined) query = query.gte('edad', filtros.edadMin);
  if (filtros?.edadMax !== undefined) query = query.lte('edad', filtros.edadMax);

  if (paginacion?.page && paginacion?.limit) {
    const start = (paginacion.page - 1) * paginacion.limit;
    const end = start + paginacion.limit - 1;
    query = query.range(start, end);
  }

  query = query
    .order('id', { foreignTable: 'grado', ascending: true })
    .order('id', { foreignTable: 'seccion', ascending: true })

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data || []) as Usuario[], total: count || 0 };
};

export const getUsuarioById = async (id: string): Promise<Usuario | null> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      grado(*),
      seccion(*),
      rol(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const searchUsuarios = async (query: string, rolId?: number): Promise<Usuario[]> => {
  let dbQuery = supabase
    .from('usuarios')
    .select(`
      *,
      grado(*),
      seccion(*),
      rol(*)
    `)
    .or(`nombre.ilike.%${query}%,documento.ilike.%${query}%`);

  if (rolId) dbQuery = dbQuery.eq('rolid', rolId);

  dbQuery = dbQuery.order('nombre', { ascending: true });

  const { data, error } = await dbQuery;
  if (error) throw error;
  return data as Usuario[];
};

export const createUsuario = async (usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at' | 'grado' | 'seccion' | 'rol'>): Promise<Usuario> => {
  const { data, error } = await supabase
    .from('usuarios')
    .insert(usuario as never)
    .select(`
      *,
      grado(*),
      seccion(*),
      rol(*)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const createAlumno = async (alumno: Omit<Usuario, 'id' | 'created_at' | 'updated_at' | 'grado' | 'seccion' | 'rol' | 'RolId'>): Promise<Usuario> => {
  return createUsuario({ ...alumno, RolId: 1 });
};

export const updateUsuario = async (id: string, usuario: Partial<Omit<Usuario, 'id' | 'created_at' | 'updated_at' | 'grado' | 'seccion' | 'rol'>>): Promise<Usuario> => {
  const { data, error } = await supabase
    .from('usuarios')
    .update(usuario as never)
    .eq('id', id)
    .select(`
      *,
      grado(*),
      seccion(*),
      rol(*)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const deleteUsuario = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
