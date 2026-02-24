/**
 * Interface para el modelo de Usuario en SICODIS
 */
export interface User {
  id_usuario: number;
  nombre_usuario: string;
  login: string;
  entidad: string;
  usa_autenticacion_dnp: boolean;
  directorio_activo: boolean;
  cargo: string;
  telefono: string;
  extension: string;
  activo: boolean;
  perfiles: number[];
  fecha_actualizacion: Date;
  usuario_actualizacion: string;
}

/**
 * Interface para crear un nuevo usuario
 */
export interface CreateUserRequest {
  nombre_usuario: string;
  login: string;
  entidad: string;
  usa_autenticacion_dnp: boolean;
  directorio_activo: boolean;
  cargo: string;
  telefono: string;
  extension: string;
  activo: boolean;
  perfiles: number[];
}

/**
 * Interface para actualizar un usuario existente
 */
export interface UpdateUserRequest extends CreateUserRequest {
  id_usuario: number;
}

/**
 * Interface para la respuesta de lista de usuarios con paginación
 */
export interface UserListResponse {
  usuarios: User[];
  total: number;
  pagina: number;
  porPagina: number;
}

/**
 * Interface para los parámetros de búsqueda y paginación
 */
export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
