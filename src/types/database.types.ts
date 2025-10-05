// Types for Database Tables

export interface Rol {
  id: number;
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

export interface Grado {
  id: number;
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

export interface Seccion {
  id: number;
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

export interface Usuario {
  id: string; // UUID
  nombre: string;
  documento: string;
  sexo: 'M' | 'F';
  edad: number;
  gradoId: number;
  seccionId: number;
  RolId: number;
  grado?: Grado;
  seccion?: Seccion;
  rol?: Rol;
  created_at?: string;
  updated_at?: string;
}

// Alias para mantener compatibilidad
export type Alumno = Usuario;

// Database Schema Type
export interface Database {
  public: {
    Tables: {
      rol: {
        Row: Rol;
        Insert: Omit<Rol, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Rol, 'id' | 'created_at' | 'updated_at'>>;
      };
      grado: {
        Row: Grado;
        Insert: Omit<Grado, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Grado, 'id' | 'created_at' | 'updated_at'>>;
      };
      seccion: {
        Row: Seccion;
        Insert: Omit<Seccion, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Seccion, 'id' | 'created_at' | 'updated_at'>>;
      };
      usuarios: {
        Row: Usuario;
        Insert: Omit<Usuario, 'created_at' | 'updated_at' | 'grado' | 'seccion' | 'rol'>;
        Update: Partial<Omit<Usuario, 'id' | 'created_at' | 'updated_at' | 'grado' | 'seccion' | 'rol'>>;
      };
    };
  };
}
