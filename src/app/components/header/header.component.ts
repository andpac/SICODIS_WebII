// src/app/components/header/header.component.ts

import { Component, OnInit, OnDestroy, ElementRef, Renderer2, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { DOCUMENT } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, ButtonModule, Menubar, DialogModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {

  items: MenuItem[] | undefined;
  private isScrolled = false;
  private scrollThreshold = 100; // Píxeles de scroll antes de aplicar efectos (aumentado para mejor UX)
  private isBrowser: boolean;
  showVideo: boolean = false;


  constructor(
    private route: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Inicio',
        command: () => this.redirectHome()
      },
      {
        label: 'SGP',
        items: [
          {
            label: 'Resumen',
            command: () => this.redirectUrl("sgp-inicio")
          },          
          {
            label: 'Documentos y Anexos',
            command: () => this.redirectUrl("sgp-documentos-anexos")
          },
          {
            label: 'Detalle Presupuestal',
            command: () => this.redirectUrl("sgp-detalle-presupuestal")
          },
          {
            label: 'Tablero Comparativo',
            command: () => this.redirectUrl("sgp-comparativa")
          },
          {
            label: 'Resguardos Indígenas',
            command: () => this.downloadFile('assets/data/sgp/sgp_resguardos_datos.xlsx')
          },
          {
            label: 'Variables Certificadas',
            command: () => this.downloadFile('assets/data/sgp/sgp_variables.xlsx')
          },
          {
            label: 'Histórico',
            command: () => this.redirectUrl("sgp-historico")
          }
        ]
      },
      {
        label: 'SGR',
        items: [
          // {
          //   label: 'Comparativo Avance vs Presupuesto',
          //   command: () => this.redirectUrl("sgr-comparativo")
          // },
          // ,
          {
            label: 'Recaudo directas',
            command: () => this.redirectUrl("sgr-recaudo-directas")
          }
          , 
          {
            label: 'Recaudo mensual',
            command: () => this.redirectUrl("sgr-recaudo-mensual")
          }
          ,
          {
            label: 'Recaudo frente a presupuesto',
            command: () => this.redirectUrl("sgr-presupuesto-y-recaudo")
          }
          ,          
          {
            label: 'Programación',
            items: [
              {
                label: 'Plan de Recursos',
                items: [
                  {
                    label: '2025 - 2034',
                    command: () => this.downloadFile('assets/data/sgr/plan-recursos-2025-2034.xlsx')
                  },
                  {
                    label: '2023 - 2032',
                    command: () => this.downloadFile('assets/data/sgr/plan-recursos-2023-2032.xlsx')
                  },
                  {
                    label: '2021 - 2030',
                    command: () => this.downloadFile('assets/data/sgr/plan-recursos-2021-2030.xlsx')
                  }
                ]
              },
              {
                label: 'Plan Bienal de Caja',
                items: [
                  {
                    label: '2025 - 2026',
                    command: () => this.downloadFile('assets/data/sgr/plan-bienal-caja-2025-2026.xlsx')
                  },
                  {
                    label: '2023 - 2024',
                    command: () => this.downloadFile('assets/data/sgr/plan-bienal-caja-2023-2024.xlsx')
                  },
                  {
                    label: '2021 - 2022',
                    command: () => this.downloadFile('assets/data/sgr/plan-bienal-caja-2021-2022.xlsx')
                  }
                ]
              }
            ]
          }
          ,
          {
            label: 'Administración y Sistema de Seguimiento (SSEC)',
             command: () => this.redirectUrl("reporte-funcionamiento")
          }


          // ,
          // {
          //   label: 'Visor General de recursos AD hidrocarburos y minería',
          //   // command: () => this.redirectUrl("propuesta-resumen-sgr")
          // }
        ]
      },
      {
        label: 'PGN',
        items: [
          {
            label: 'Regionalización Programación',
            command: () => this.redirectUrl("pgn-regionalizacion")
          },
          {
            label: 'Regionalización Seguimiento',
            command: () => this.redirectUrl("pgn-seguimiento")
          },
          {
            label: 'Inversión por sector, entidad y proyecto',
            command: () => this.redirectUrl("pgn-inversion-por-sector")
          }
          // ,          
          // {
          //   label: 'Comparativa Regionalización',
          //   command: () => this.redirectUrl("pgn-comparativa-regionalizacion")
          // }          
        ]
      },   
      {
        label: 'Ayuda',
        items: [
          {
            label: 'Preguntas Frecuentes',
            command: () => this.redirectFAQ()
          }
          ,
          {
            label: 'Guía rápida de usuario',
            command: () => this.redirectGuiaRapida()
          }
          // ,{
          //   label: 'Manual de usuario'
          // }
        ]
      }
    ];

    // Agregar menú de Administración solo para administradores
    if (this.isAdmin()) {
      this.items.push({
        label: 'Administración',
        icon: 'pi pi-shield',
        items: [
          {
            label: 'Gestión de Usuarios',
            icon: 'pi pi-users',
            command: () => this.redirectUrl('admin/usuarios')
          }
        ]
      });
    }

    // Agregar menú de usuario (siempre visible si está autenticado)
    if (this.isAuthenticated()) {
      const currentUser = this.userService.getCurrentUserValue();
      const userName = currentUser?.nombre_usuario || 'Usuario';

      this.items.push({
        label: userName,
        icon: 'pi pi-user',
        items: [
          {
            label: 'Mi Perfil',
            icon: 'pi pi-id-card',
            command: () => this.redirectUrl('mi-perfil')
          },
          {
            separator: true
          },
          {
            label: 'Cerrar Sesión',
            icon: 'pi pi-sign-out',
            command: () => this.logout()
          }
        ]
      });
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.authService.hasValidToken();
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.userService.isAdmin();
  }

  /**
   * Cierra sesión del usuario
   */
  logout(): void {
    this.authService.clearToken();
    this.userService.clearCurrentUser();
    this.route.navigate(['/']);
  
  }

  ngOnDestroy() {
    // Limpiar clases del body al destruir el componente (solo en el navegador)
    if (this.isBrowser) {
      this.renderer.removeClass(this.document.body, 'menu-is-sticky');
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: Event): void {
    // Solo ejecutar en el navegador
    if (!this.isBrowser) {
      return;
    }

    const scrollTop = window.pageYOffset || this.document.documentElement.scrollTop || this.document.body.scrollTop || 0;
    
    if (scrollTop > this.scrollThreshold && !this.isScrolled) {
      this.isScrolled = true;
      // Agregar clase al contenedor principal para activar el estado scrolled
      const headerContainer = this.elementRef.nativeElement.querySelector('.header-container');
      if (headerContainer) {
        this.renderer.addClass(headerContainer, 'scrolled');
      }
      
      // Agregar clase específica al menú para hacerlo sticky
      const menuContainer = this.elementRef.nativeElement.querySelector('.menu-container');
      if (menuContainer) {
        this.renderer.addClass(menuContainer, 'menu-sticky');
      }
      
      // Agregar clase al body para ajustar el padding del contenido principal
      this.renderer.addClass(this.document.body, 'menu-is-sticky');
      
    } else if (scrollTop <= this.scrollThreshold && this.isScrolled) {
      this.isScrolled = false;
      
      // Remover clases cuando se vuelve al top
      const headerContainer = this.elementRef.nativeElement.querySelector('.header-container');
      if (headerContainer) {
        this.renderer.removeClass(headerContainer, 'scrolled');
      }
      
      const menuContainer = this.elementRef.nativeElement.querySelector('.menu-container');
      if (menuContainer) {
        this.renderer.removeClass(menuContainer, 'menu-sticky');
      }
      
      // Remover clase del body
      this.renderer.removeClass(this.document.body, 'menu-is-sticky');
    }
  }


downloadFile(path: string) {
  const link = document.createElement('a');
  link.href = path;
  link.target = '_blank';
  link.download = '';
  link.click();
}


  redirectHome() {
    this.route.navigate(['/']);
  }

  redirectSGR() {
    this.route.navigate(['/reports-sgr']);
  }

  redirectUrl(path: string) {
    this.route.navigate([path]);
  }

  redirectSGP() {
    this.route.navigate(['/reports-sgp']);
  }

  redirectFAQ() {
    this.route.navigate(['/faq']);
  }

  redirectTools() {
    this.route.navigate(['/tools']);
  }

  redirectDocs(item: string) {
    const urls: any = {
      "sgp": "https://www.dnp.gov.co/LaEntidad_/subdireccion-general-inversiones-seguimiento-evaluacion/direccion-programacion-inversiones-publicas/Paginas/distribucion-de-recursos-territoriales.aspx",
      "sgr": "https://www.dnp.gov.co/LaEntidad_/subdireccion-general-inversiones-seguimiento-evaluacion/direccion-programacion-inversiones-publicas/Paginas/sistema-general-de-regalias.aspx"
    };
    window.open(urls[item], '_blank');
  }

  redirectGuiaRapida() {
    this.showVideo = true;
  }

}