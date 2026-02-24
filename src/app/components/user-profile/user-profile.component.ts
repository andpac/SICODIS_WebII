import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MessageService, MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services and Models
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.interface';
import { PROFILE_NAMES } from '../../models/profile.interface';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    BreadcrumbModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  // Estado
  isLoading = signal(false);
  isSaving = signal(false);
  isEditing = signal(false);

  // Datos del usuario
  user: User | null = null;
  editableUser: Partial<User> = {};

  // Breadcrumb
  breadcrumbItems: MenuItem[] = [];
  homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupBreadcrumb();
    this.loadCurrentUser();
  }

  /**
   * Configura el breadcrumb
   */
  setupBreadcrumb(): void {
    this.breadcrumbItems = [
      { label: 'Mi Perfil', styleClass: 'active-breadcrumb' }
    ];
  }

  /**
   * Carga el usuario actual
   */
  loadCurrentUser(): void {
    this.isLoading.set(true);

    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.resetEditableUser();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar perfil:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar su perfil'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Resetea los datos editables al original
   */
  resetEditableUser(): void {
    if (this.user) {
      this.editableUser = {
        nombre_usuario: this.user.nombre_usuario,
        telefono: this.user.telefono,
        extension: this.user.extension
      };
    }
  }

  /**
   * Activa el modo de edición
   */
  enableEdit(): void {
    this.isEditing.set(true);
    this.resetEditableUser();
  }

  /**
   * Cancela la edición
   */
  cancelEdit(): void {
    this.isEditing.set(false);
    this.resetEditableUser();
  }

  /**
   * Guarda los cambios del perfil
   */
  saveProfile(): void {
    if (!this.isFormValid()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Complete todos los campos requeridos'
      });
      return;
    }

    this.isSaving.set(true);

    this.userService.updateOwnProfile(this.editableUser).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isEditing.set(false);
        this.isSaving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Perfil Actualizado',
          detail: 'Su perfil ha sido actualizado exitosamente'
        });
      },
      error: (error) => {
        console.error('❌ Error al actualizar perfil:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el perfil'
        });
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Valida el formulario
   */
  isFormValid(): boolean {
    return !!(
      this.editableUser.nombre_usuario &&
      this.editableUser.nombre_usuario.trim().length > 0
    );
  }

  /**
   * Obtiene los nombres de los perfiles del usuario
   */
  getUserProfileNames(): string[] {
    if (!this.user) return [];

    return this.user.perfiles.map(profileId =>
      PROFILE_NAMES[profileId] || 'Usuario'
    );
  }

  /**
   * Obtiene el color del tag de perfil
   */
  getProfileTagSeverity(profileName: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (profileName.includes('SuperAdministrador')) return 'danger';
    if (profileName.includes('Administrador')) return 'warn';
    if (profileName.includes('Consultas')) return 'info';
    if (profileName.includes('Cargue')) return 'success';
    return 'secondary';
  }
}
