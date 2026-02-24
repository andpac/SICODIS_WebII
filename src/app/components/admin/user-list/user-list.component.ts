import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';

// Services and Models
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.interface';
import { UserDetailComponent } from '../user-detail/user-detail.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    BreadcrumbModule,
    IconFieldModule,
    InputIconModule,
    UserDetailComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  // Señales para estado reactivo
  isLoading = signal(false);

  // Datos de usuarios
  users: User[] = [];
  totalRecords: number = 0;
  currentPage: number = 1;
  rowsPerPage: number = 10;

  // Búsqueda
  searchTerm: string = '';
  searchTimeout: any;

  // Dialog de detalle
  displayDialog: boolean = false;
  selectedUserId: number | null = null;
  dialogMode: 'view' | 'edit' | 'create' = 'view';

  // Breadcrumb
  breadcrumbItems: MenuItem[] = [];
  homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupBreadcrumb();
    this.loadUsers();
  }

  /**
   * Configura el breadcrumb de navegación
   */
  setupBreadcrumb(): void {
    this.breadcrumbItems = [
      { label: 'Administración' },
      { label: 'Gestión de Usuarios', styleClass: 'active-breadcrumb' }
    ];
  }

  /**
   * Carga la lista de usuarios desde el servidor
   */
  loadUsers(): void {
    this.isLoading.set(true);

    const params = {
      page: this.currentPage,
      limit: this.rowsPerPage,
      search: this.searchTerm || undefined
    };

    this.userService.getUsers(params).subscribe({
      next: (response) => {
        this.users = response.usuarios;
        this.totalRecords = response.total;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la lista de usuarios'
        });
        this.isLoading.set(false);

        // Fallback: Mostrar datos de ejemplo si el backend no está disponible
        this.loadMockData();
      }
    });
  }

  /**
   * Datos de ejemplo para desarrollo/testing
   */
  loadMockData(): void {
    this.users = [
      {
        id_usuario: 1,
        nombre_usuario: 'Juan Pérez',
        login: 'juan.perez',
        entidad: 'Departamento Nacional de Planeación',
        usa_autenticacion_dnp: true,
        directorio_activo: true,
        cargo: 'Subdirector',
        telefono: '3015551234',
        extension: '101',
        activo: true,
        perfiles: [1],
        fecha_actualizacion: new Date('2025-01-15'),
        usuario_actualizacion: 'admin'
      },
      {
        id_usuario: 2,
        nombre_usuario: 'María González',
        login: 'maria.gonzalez',
        entidad: 'SDRT',
        usa_autenticacion_dnp: false,
        directorio_activo: false,
        cargo: 'Analista',
        telefono: '3025559876',
        extension: '202',
        activo: true,
        perfiles: [3],
        fecha_actualizacion: new Date('2025-02-10'),
        usuario_actualizacion: 'admin'
      },
      {
        id_usuario: 3,
        nombre_usuario: 'Carlos Rodríguez',
        login: 'carlos.rodriguez',
        entidad: 'DNP',
        usa_autenticacion_dnp: true,
        directorio_activo: true,
        cargo: 'Coordinador',
        telefono: '3105554567',
        extension: '303',
        activo: false,
        perfiles: [2, 4],
        fecha_actualizacion: new Date('2024-12-20'),
        usuario_actualizacion: 'maria.gonzalez'
      }
    ];
    this.totalRecords = 3;
    this.isLoading.set(false);

    this.messageService.add({
      severity: 'info',
      summary: 'Modo de prueba',
      detail: 'Mostrando datos de ejemplo'
    });
  }

  /**
   * Maneja el cambio de página
   */
  onPageChange(event: any): void {
    this.currentPage = event.first / event.rows + 1;
    this.rowsPerPage = event.rows;
    this.loadUsers();
  }

  /**
   * Maneja la búsqueda con debounce
   */
  onSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1; // Reset a primera página
      this.loadUsers();
    }, 500);
  }

  /**
   * Abre el dialog para crear un nuevo usuario
   */
  openNewUserDialog(): void {
    this.selectedUserId = null;
    this.dialogMode = 'create';
    this.displayDialog = true;
  }

  /**
   * Ver detalles de un usuario (modo solo lectura)
   */
  viewUser(user: User): void {
    this.selectedUserId = user.id_usuario;
    this.dialogMode = 'view';
    this.displayDialog = true;
  }

  /**
   * Editar un usuario
   */
  editUser(user: User): void {
    this.selectedUserId = user.id_usuario;
    this.dialogMode = 'edit';
    this.displayDialog = true;
  }

  /**
   * Confirmar eliminación de usuario
   */
  confirmDelete(user: User): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar al usuario "${user.nombre_usuario}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteUser(user.id_usuario);
      }
    });
  }

  /**
   * Elimina un usuario
   */
  deleteUser(userId: number): void {
    this.isLoading.set(true);

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Usuario Eliminado',
          detail: 'El usuario ha sido eliminado exitosamente'
        });
        this.loadUsers(); // Recargar lista
      },
      error: (error) => {
        console.error('❌ Error al eliminar usuario:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el usuario'
        });
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Maneja el evento cuando se guarda un usuario
   */
  handleUserSaved(): void {
    this.displayDialog = false;
    this.loadUsers(); // Recargar lista
    this.messageService.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'Usuario guardado exitosamente'
    });
  }

  /**
   * Obtiene la clase de severidad para el tag de estado
   */
  getStatusSeverity(activo: boolean): 'success' | 'danger' {
    return activo ? 'success' : 'danger';
  }

  /**
   * Obtiene el texto del tag de estado
   */
  getStatusText(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }
}
