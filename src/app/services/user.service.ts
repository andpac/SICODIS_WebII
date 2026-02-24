import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { SicodisApiService } from './sicodis-api.service';
import { User, CreateUserRequest, UpdateUserRequest, UserListResponse } from '../models/user.interface';
import { PROFILE_NAMES, ADMIN_ROLES } from '../models/profile.interface';

/**
 * Servicio para gestionar el estado y operaciones de usuarios
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private sicodisApiService = inject(SicodisApiService);

  // BehaviorSubject para mantener el estado del usuario actual
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadCurrentUserFromStorage();
  }

  /**
   * Carga el usuario actual desde localStorage al iniciar
   */
  private loadCurrentUserFromStorage(): void {
    const stored = localStorage.getItem('current_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('❌ Error parsing stored user:', e);
        localStorage.removeItem('current_user');
      }
    }
  }

  /**
   * Obtiene la lista de usuarios con paginación y filtros
   */
  getUsers(params?: { page?: number; limit?: number; search?: string }): Observable<UserListResponse> {
    return this.sicodisApiService.getUsuarios(params);
  }

  /**
   * Obtiene un usuario específico por ID
   */
  getUserById(id: number): Observable<User> {
    return this.sicodisApiService.getUsuarioById(id);
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(user: CreateUserRequest): Observable<User> {
    return this.sicodisApiService.createUsuario(user);
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(id: number, user: UpdateUserRequest): Observable<User> {
    return this.sicodisApiService.updateUsuario(id, user);
  }

  /**
   * Elimina un usuario (soft delete)
   */
  deleteUser(id: number): Observable<void> {
    return this.sicodisApiService.deleteUsuario(id);
  }

  /**
   * Obtiene el usuario actual autenticado desde el servidor
   * y actualiza el estado local
   */
  getCurrentUser(): Observable<User> {
    return this.sicodisApiService.getCurrentUser().pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('current_user', JSON.stringify(user));
        console.log('✅ Usuario actual cargado:', user.nombre_usuario);
      }),
      catchError(error => {
        console.error('❌ Error al obtener usuario actual:', error);
        this.clearCurrentUser();
        throw error;
      })
    );
  }

  /**
   * Actualiza el perfil del usuario actual (campos limitados)
   */
  updateOwnProfile(updates: Partial<User>): Observable<User> {
    return this.sicodisApiService.updateOwnProfile(updates).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('current_user', JSON.stringify(user));
        console.log('✅ Perfil actualizado:', user.nombre_usuario);
      })
    );
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param permission - String de permiso (ej: 'admin:usuarios:editar')
   */
  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;

    // Lógica simplificada: Los admins tienen todos los permisos
    if (this.isAdmin()) return true;

    // TODO: Implementar lógica granular de permisos cuando esté disponible
    // Por ahora, solo verificar permisos básicos

    // Permisos de admin
    if (permission.startsWith('admin:')) {
      return this.isAdmin();
    }

    // Por defecto, los usuarios autenticados tienen acceso a lectura
    if (permission.includes(':ver') || permission.includes(':read')) {
      return true;
    }

    return false;
  }

  /**
   * Verifica si el usuario actual es administrador
   */
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;

    // Convertir IDs de perfiles a nombres
    const userProfileNames = user.perfiles.map(profileId =>
      PROFILE_NAMES[profileId] || 'Usuario'
    );

    // Verificar si tiene algún rol administrativo
    return userProfileNames.some(profile =>
      ADMIN_ROLES.includes(profile)
    );
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(roleName: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;

    const userProfileNames = user.perfiles.map(profileId =>
      PROFILE_NAMES[profileId] || 'Usuario'
    );

    return userProfileNames.includes(roleName);
  }

  /**
   * Obtiene el nombre de perfil por ID
   */
  getProfileName(profileId: number): string {
    return PROFILE_NAMES[profileId] || 'Usuario';
  }

  /**
   * Obtiene los nombres de perfiles del usuario actual
   */
  getCurrentUserProfileNames(): string[] {
    const user = this.currentUserSubject.value;
    if (!user) return [];

    return user.perfiles.map(profileId =>
      PROFILE_NAMES[profileId] || 'Usuario'
    );
  }

  /**
   * Obtiene el valor actual del usuario sin Observable
   */
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Limpia el usuario actual del estado y localStorage
   */
  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('current_user');
    console.log('🗑️ Usuario actual limpiado');
  }
}
