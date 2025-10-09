export interface Grado {
  id: number
  nombre: string
}

export interface Rol {
  id: number
  nombre: string
}

export interface Seccion {
  id: number
  nombre: string
}

export interface Usuario {
  id: string
  nombre: string
  documento: string
  sexo: 'M' | 'F'
  edad: number
  gradoId?: number | null
  seccionId?: number | null
  rolId?: number | null
  grado?: Grado
  seccion?: Seccion
  rol?: Rol
}

export type EstadoAsistencia = 'ASISTENCIA' | 'TARDANZA' | 'FALTA'

export interface Asistencia {
  id: number
  usuarioId: string
  fecha: string // ISO date
  hora_llegada?: string | null // HH:mm:ss
  hora_salida?: string | null
  estado: EstadoAsistencia
  usuarios?: Usuario
}

export interface InfoContacto {
  id: number
  usuarioId: string
  correo?: string | null
  telefono?: string | null
  usuario?: Usuario
}

export interface Configuracion {
  id: number
  hora_entrada: string
  hora_salida: string
  hora_falta: string | null
  tolerancia_minutos: number
  fecha_creacion: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  filters?: Record<string, any>
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
}
