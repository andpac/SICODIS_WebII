/**
 * Interface para el modelo de Perfil en SICODIS
 */
export interface Profile {
  id_perfil: number;
  nombre_perfil: string; // "SuperAdministrador", "Administrador", etc.
  descripcion: string;
  permisos: Permission[];
  activo: boolean;
}

/**
 * Interface para permisos granulares
 */
export interface Permission {
  id_permiso: number;
  nombre_permiso: string;
  modulo: string; // 'SGR', 'SGP', 'PGN', 'ADMIN'
  accion: 'ver' | 'crear' | 'editar' | 'eliminar' | 'exportar';
  recurso: string;
}

/**
 * Mapeo de IDs de perfiles a nombres
 */
export const PROFILE_NAMES: { [key: number]: string } = {
  1: 'SuperAdministrador',
  2: 'Administrador',
  3: 'Consultas SDRT',
  4: 'Consultas DNP',
  5: 'Cargue Información'
};

/**
 * Roles administrativos que tienen acceso al módulo de administración
 */
export const ADMIN_ROLES = ['SuperAdministrador', 'Administrador'];
