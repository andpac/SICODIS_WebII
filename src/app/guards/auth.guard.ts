import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';

/**
 * Guard para proteger rutas que requieren autenticación
 * Verifica que exista un token válido antes de permitir el acceso
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario tiene un token válido
  if (!authService.hasValidToken()) {
    console.warn('⛔ Acceso denegado: No hay token válido');
    router.navigate(['/'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  return true;
};
