import { Injectable, inject } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { SicodisApiService } from './sicodis-api.service';
import { Profile } from '../models/profile.interface';

/**
 * Servicio para gestionar perfiles y su información
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private sicodisApiService = inject(SicodisApiService);

  // Cache de perfiles para evitar múltiples llamadas al servidor
  private profilesCache: Profile[] | null = null;

  /**
   * Obtiene todos los perfiles disponibles
   * Usa cache para optimizar llamadas repetidas
   */
  getProfiles(): Observable<Profile[]> {
    if (this.profilesCache) {
      console.log('📦 Usando perfiles desde cache');
      return of(this.profilesCache);
    }

    return this.sicodisApiService.getPerfiles().pipe(
      tap(profiles => {
        this.profilesCache = profiles;
        console.log('✅ Perfiles cargados:', profiles.length);
      })
    );
  }

  /**
   * Obtiene un perfil específico por ID
   */
  getProfileById(id: number): Observable<Profile | undefined> {
    return new Observable(observer => {
      this.getProfiles().subscribe({
        next: (profiles) => {
          const profile = profiles.find(p => p.id_perfil === id);
          observer.next(profile);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Limpia el cache de perfiles
   * Útil cuando se actualizan perfiles en el servidor
   */
  clearCache(): void {
    this.profilesCache = null;
    console.log('🗑️ Cache de perfiles limpiado');
  }
}
