import { supabase } from '@/lib/supabase';
import { InfoContacto, PaginatedResponse, PaginationParams } from '@/types/database.types';

const TABLE = 'info_contacto';

export const infoContactoService = {
	async getAll({ page = 1, limit = 10, filters = {} }: PaginationParams): Promise<PaginatedResponse<InfoContacto>> {
		const from = (page - 1) * limit;
		const to = from + limit - 1;
		let query = supabase
			.from(TABLE)
			.select('*, usuarios(id, nombre, documento)', { count: 'exact' })
			.order('id', { ascending: true })
			.range(from, to);
		for (const [key, value] of Object.entries(filters)) {
			if (value !== undefined && value !== null) query = query.eq(key, value);
		}
		const { data, count, error } = await query;
		if (error) throw error;
		return { data: data || [], count: count || 0 };
	},

	async getById(id: number): Promise<InfoContacto | null> {
		const { data, error } = await supabase
			.from(TABLE)
			.select('*, usuarios(id, nombre, documento)')
			.eq('id', id)
			.single();
		if (error) throw error;
		return data as InfoContacto;
	},

	async getByUsuarioId(usuarioid: string): Promise<InfoContacto | null> {
		const { data, error } = await supabase
			.from(TABLE)
			.select('*, usuarios(id, nombre, documento)')
			.eq('usuarioid', usuarioid)
			.single();
		if (error) throw error;
		return data as InfoContacto;
	},

	async create(payload: Omit<InfoContacto, 'id' | 'usuario'>): Promise<InfoContacto> {
		// Forzar usuarioid en minúsculas
		const fixedPayload = { ...payload, usuarioid: (payload as any).usuarioid ?? (payload as any).usuarioId };
		delete (fixedPayload as any).usuarioId;
		const { data, error } = await supabase
			.from(TABLE)
			.insert(fixedPayload)
			.select('*, usuarios(id, nombre, documento)')
			.single();
		if (error) throw error;
		return data as InfoContacto;
	},

	async update(id: number, payload: Partial<Omit<InfoContacto, 'id' | 'usuario'>>): Promise<InfoContacto> {
		const { data, error } = await supabase
			.from(TABLE)
			.update(payload)
			.eq('id', id)
			.select('*, usuarios(id, nombre, documento)')
			.single();
		if (error) throw error;
		return data as InfoContacto;
	},

	async remove(id: number): Promise<boolean> {
		const { error } = await supabase.from(TABLE).delete().eq('id', id);
		if (error) throw error;
		return true;
	},
};
