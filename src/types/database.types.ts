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
  gradoid?: number | null
  seccionid?: number | null
  rolId?: number | null
  created_at?: string
  grado?: Grado
  seccion?: Seccion
  rol?: Rol
}

export type EstadoAsistencia = 'ASISTENCIA' | 'TARDANZA' | 'FALTA'

export interface Asistencia {
  id: number
  usuarioid: string
  fecha: string // ISO date
  hora_llegada?: string | null // HH:mm:ss
  hora_salida?: string | null
  estado: EstadoAsistencia
  presente: boolean
  tipo?: string | null
  observaciones?: string | null
  usuarios?: Usuario
}

export interface InfoContacto {
  id: number
  nombre: string
  usuarioid: string
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

// Bulk upload types
export interface BulkStudentData {
  nombres: string
  apellidos: string
  nro_documento: string
  sexo: 'M' | 'F'
  edad: number
  grado: number
  seccion: string
  nombre_contacto: string
  correo_contacto?: string
  telefono_contacto?: string
}

export interface BulkCreateResponse {
  created: number
  skipped: number
  failed: number
  errors: Array<{
    row: number
    documento: string
    error: string
  }>
  createdStudents: Array<{ id: string; nombre: string }>
  skippedStudents: Array<{ documento: string; nombre: string }>
}

