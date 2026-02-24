import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, catchError, of } from 'rxjs';
import { UserService } from '../services/user.service';
import { PROFILE_NAMES } from '../models/profile.interface';

/**
 * Guard para proteger rutas basado en roles de usuario
 * Verifica que el usuario tenga uno de los roles requeridos
 *
 * Uso en rutas:
 * {
 *   path: 'admin',
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: ['SuperAdministrador', 'Administrador'] }
 * }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  // Obtener roles requeridos de la configuración de la ruta
  const requiredRoles = route.data['roles'] as string[];

  if (!requiredRoles || requiredRoles.length === 0) {
    console.warn('⚠️ roleGuard: No se especificaron roles requeridos');
    return true;
  }

  return userService.getCurrentUser().pipe(
    map(user => {
      // Convertir IDs de perfiles a nombres
      const userProfileNames = user.perfiles.map(profileId =>
        PROFILE_NAMES[profileId] || 'Usuario'
      );

      // Verificar si el usuario tiene alguno de los roles requeridos
      const hasRole = userProfileNames.some(profile =>
        requiredRoles.includes(profile)
      );

      if (!hasRole) {
        console.warn(
          `⛔ Acceso denegado: Usuario con perfiles [${userProfileNames.join(', ')}] ` +
          `intentó acceder a ruta que requiere [${requiredRoles.join(', ')}]`
        );
        router.navigate(['/unauthorized']);
        return false;
      }

      console.log(`✅ Acceso permitido: Usuario tiene rol(es) requerido(s)`);
      return true;
    }),
    catchError((error) => {
      console.error('❌ Error al verificar roles:', error);
      router.navigate(['/']);
      return of(false);
    })
  );
};
