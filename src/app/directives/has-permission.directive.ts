import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../services/user.service';

/**
 * Directiva estructural para renderizar contenido condicionalmente
 * basado en los permisos del usuario
 *
 * Uso:
 * <div *appHasPermission="'admin:usuarios:editar'">
 *   Botón Editar Usuario (solo visible para admins)
 * </div>
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input('appHasPermission') requiredPermission!: string;

  private destroy$ = new Subject<void>();
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Suscribirse a cambios en el usuario actual
    this.userService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.updateView();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView() {
    const hasPermission = this.userService.hasPermission(this.requiredPermission);

    if (hasPermission && !this.hasView) {
      // Mostrar contenido
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      // Ocultar contenido
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
