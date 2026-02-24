import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services and Models
import { UserService } from '../../../services/user.service';
import { ProfileService } from '../../../services/profile.service';
import { User, CreateUserRequest, UpdateUserRequest } from '../../../models/user.interface';
import { Profile, PROFILE_NAMES } from '../../../models/profile.interface';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    FloatLabelModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() userId: number | null = null;
  @Input() mode: 'view' | 'edit' | 'create' = 'view';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onSave = new EventEmitter<void>();

  // Estado de carga
  isLoading = signal(false);
  isSaving = signal(false);

  // Datos del usuario
  user: Partial<User> = this.getEmptyUser();

  // Perfiles disponibles
  availableProfiles: Profile[] = [];
  selectedProfiles: { [key: number]: boolean } = {};

  // Modo solo lectura
  get isReadOnly(): boolean {
    return this.mode === 'view';
  }

  // Título del diálogo
  get dialogTitle(): string {
    switch (this.mode) {
      case 'create':
        return 'Nuevo Usuario';
      case 'edit':
        return 'Editar Usuario';
      case 'view':
        return 'Información del Usuario';
      default:
        return 'Usuario';
    }
  }

  constructor(
    private userService: UserService,
    private profileService: ProfileService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Cuando cambia la visibilidad o el userId, cargar datos
    if (changes['visible'] && this.visible) {
      if (this.userId && this.mode !== 'create') {
        this.loadUser(this.userId);
      } else if (this.mode === 'create') {
        this.resetForm();
      }
    }

    // Cuando cambia el modo, ajustar comportamiento
    if (changes['mode']) {
      if (this.mode === 'create') {
        this.resetForm();
      }
    }
  }

  /**
   * Obtiene estructura vacía de usuario
   */
  getEmptyUser(): Partial<User> {
    return {
      id_usuario: undefined,
      nombre_usuario: '',
      login: '',
      entidad: '',
      usa_autenticacion_dnp: false,
      directorio_activo: false,
      cargo: '',
      telefono: '',
      extension: '',
      activo: true,
      perfiles: [],
      fecha_actualizacion: new Date(),
      usuario_actualizacion: ''
    };
  }

  /**
   * Carga los perfiles disponibles
   */
  loadProfiles(): void {
    this.profileService.getProfiles().subscribe({
      next: (profiles) => {
        this.availableProfiles = profiles;
      },
      error: (error) => {
        console.error('❌ Error al cargar perfiles:', error);
        // Fallback: usar perfiles estáticos
        this.loadMockProfiles();
      }
    });
  }

  /**
   * Perfiles estáticos para desarrollo
   */
  loadMockProfiles(): void {
    this.availableProfiles = [
      {
        id_perfil: 1,
        nombre_perfil: 'Subdirector(a) - SuperAdministrador',
        descripcion: 'Acceso total al sistema',
        permisos: [],
        activo: true
      },
      {
        id_perfil: 2,
        nombre_perfil: 'Administrador',
        descripcion: 'Gestión de usuarios y configuración',
        permisos: [],
        activo: true
      },
      {
        id_perfil: 3,
        nombre_perfil: 'Consultas SDRT',
        descripcion: 'Consulta de información SDRT',
        permisos: [],
        activo: true
      },
      {
        id_perfil: 4,
        nombre_perfil: 'Consultas DNP',
        descripcion: 'Consulta de información DNP',
        permisos: [],
        activo: true
      },
      {
        id_perfil: 5,
        nombre_perfil: 'Cargue Información',
        descripcion: 'Carga de datos al sistema',
        permisos: [],
        activo: true
      }
    ];
  }

  /**
   * Carga un usuario por ID
   */
  loadUser(id: number): void {
    this.isLoading.set(true);

    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.user = user;
        this.updateSelectedProfiles();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar usuario:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el usuario'
        });
        this.isLoading.set(false);
        this.onCancel();
      }
    });
  }

  /**
   * Actualiza el objeto selectedProfiles basado en los perfiles del usuario
   */
  updateSelectedProfiles(): void {
    this.selectedProfiles = {};
    if (this.user.perfiles) {
      this.user.perfiles.forEach(profileId => {
        this.selectedProfiles[profileId] = true;
      });
    }
  }

  /**
   * Resetea el formulario a valores por defecto
   */
  resetForm(): void {
    this.user = this.getEmptyUser();
    this.selectedProfiles = {};
  }

  /**
   * Verifica si el formulario es válido
   */
  isFormValid(): boolean {
    if (this.isReadOnly) return false;

    // Campos requeridos
    const hasRequiredFields = !!(
      this.user.nombre_usuario &&
      this.user.login &&
      this.user.entidad
    );

    // Al menos un perfil seleccionado
    const selectedProfileIds = this.getSelectedProfileIds();
    const hasProfiles = selectedProfileIds.length > 0;

    return hasRequiredFields && hasProfiles;
  }

  /**
   * Obtiene los IDs de perfiles seleccionados
   */
  getSelectedProfileIds(): number[] {
    return Object.keys(this.selectedProfiles)
      .filter(key => this.selectedProfiles[parseInt(key)])
      .map(key => parseInt(key));
  }

  /**
   * Guarda el usuario (crear o editar)
   */
  handleSave(): void {
    if (!this.isFormValid()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'Complete todos los campos requeridos'
      });
      return;
    }

    this.isSaving.set(true);

    // Preparar datos
    const userData = {
      ...this.user,
      perfiles: this.getSelectedProfileIds()
    };

    if (this.mode === 'create') {
      this.createUser(userData as CreateUserRequest);
    } else if (this.mode === 'edit') {
      this.updateUser(userData as UpdateUserRequest);
    }
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(userData: CreateUserRequest): void {
    this.userService.createUser(userData).subscribe({
      next: (user) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Usuario Creado',
          detail: `Usuario "${user.nombre_usuario}" creado exitosamente`
        });
        this.isSaving.set(false);
        this.onSave.emit();
        this.closeDialog();
      },
      error: (error) => {
        console.error('❌ Error al crear usuario:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo crear el usuario'
        });
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(userData: UpdateUserRequest): void {
    if (!this.user.id_usuario) return;

    this.userService.updateUser(this.user.id_usuario, userData).subscribe({
      next: (user) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Usuario Actualizado',
          detail: `Usuario "${user.nombre_usuario}" actualizado exitosamente`
        });
        this.isSaving.set(false);
        this.onSave.emit();
        this.closeDialog();
      },
      error: (error) => {
        console.error('❌ Error al actualizar usuario:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo actualizar el usuario'
        });
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Genera reporte de usuarios (placeholder)
   */
  generateReport(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Reporte',
      detail: 'Funcionalidad de reporte en desarrollo'
    });
  }

  /**
   * Cancela y cierra el diálogo
   */
  onCancel(): void {
    this.closeDialog();
  }

  /**
   * Cierra el diálogo y resetea el formulario
   */
  closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);

    // Resetear después de un delay para evitar parpadeos
    setTimeout(() => {
      this.resetForm();
    }, 300);
  }
}
