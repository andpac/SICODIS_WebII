// src/app/components/header/header.component.ts

import { Component, OnDestroy, ElementRef, Renderer2, HostListener, Inject, PLATFORM_ID, computed, inject } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { DOCUMENT } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { UserAuthService } from '../../auth/user-auth.service';
import { ThemeService } from '../../theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, ButtonModule, Menubar, DialogModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {

  private auth = inject(UserAuthService);
  private theme = inject(ThemeService);

  /**
   * Solo los administradores ven el menú "Administración". La autorización real
   * la aplican authGuard + paginaGuard en cada ruta; esto es únicamente UX.
   */
  readonly esAdmin = computed(
    () => this.auth.estaAutenticado() && this.auth.roles().some(rol => rol.startsWith('ADMIN')),
  );

  /** Modelo del menú, reactivo a la sesión: agrega "Administración" para admins. */
  readonly items = computed<MenuItem[]>(() => {
    const items = this.itemsBase();
    if (this.esAdmin()) {
      items.push(this.itemAdministracion());
    }
    return items;
  });

  private isScrolled = false;
  private scrollThreshold = 100; // Píxeles de scroll antes de aplicar efectos (aumentado para mejor UX)
  private isBrowser: boolean;
  showVideo: boolean = false;


  constructor(
    private route: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /** Menú público, común a todos los visitantes. */
  private itemsBase(): MenuItem[] {
    return [
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
            command: () => this.redirectUrl("sgp-resguardos")
          },
          {
            label: 'Variables Certificadas',
            command: () => this.downloadFile('assets/data/sgp/sgp_variables.xlsx')
          },
          {
            label: 'Histórico',
            command: () => this.redirectUrl("sgp-historico")
          },
          {
            label: 'Eficiencias',
            command: () => this.redirectUrl("sgp-eficiencias")
          },
          {
            label: 'Ficha Municipal',
            command: () => this.redirectUrl("sgp-ficha")
          },          
          {
            label: 'Proyecciones',
            command: () => this.downloadFile('https://colaboracion.dnp.gov.co/CDT/Inversiones%20y%20finanzas%20pblicas/Documentos%20GFT/Documentos_SGP/Ficha%20Proyecciones%20SGP%202026.xlsx')
          },
          {
            label: 'Situado Fiscal',
            items: [
              {
                label: 'Resumen',
                command: () => this.openExternal('https://sicodispr.dnp.gov.co/ReportesSGP/SGP_Historico_1994_2001.aspx')
              },
              {
                label: 'Histórico',
                command: () => this.openExternal('https://sicodispr.dnp.gov.co/ReportesSGP/SGP_SF_HistoricoEntidadyFuente.aspx')
              }
            ]
          }
        ]
      },
      {
        label: 'SGR',
        items: [
          {
            label: 'Resumen',
            command: () => this.redirectUrl("sgr-inicio")
          },
          {
            label: 'Recaudo mensual',
            command: () => this.redirectUrl("sgr-recaudo-mensual")
          }
          ,
          {
            label: 'Recaudo directas',
            command: () => this.redirectUrl("sgr-recaudo-directas")
          }
          ,
          {
            label: 'Recaudo frente a presupuesto',
            command: () => this.redirectUrl("sgr-presupuesto-y-recaudo")
          }
          ,
          {
            label: 'Administración y Sistema de Seguimiento (SSEC)',
             command: () => this.redirectUrl("reporte-funcionamiento")
          },
          {
            label: 'Plan de Recursos',
            command: () => this.redirectUrl("sgr-plan-recursos")
          },
          {
            label: 'Plan Bienal de Caja',
            command: () => this.redirectUrl("sgr-plan-bienal-de-caja")
          },
          {
            label: 'Comparativo',
            command: () => this.redirectUrl("sgr-comparativo")
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
  }

  /** Sección protegida: rutas de administración (authGuard + paginaGuard). */
  private itemAdministracion(): MenuItem {
    return {
      label: 'Administración',
      icon: 'pi pi-lock',
      items: [
        {
          label: 'Configuración',
          command: () => this.redirectUrl('admin-config')
        },
        {
          label: 'SGR - Programación',
          items: [
            {
              label: 'Carga de Insumos',
              command: () => this.redirectUrl('sgr-carga-insumos')
            },
            {
              label: 'Ejecución de la Distribución',
              command: () => this.redirectUrl('sgr-ejecucion-distribucion')
            },
            {
              label: 'Parámetros de la Distribución',
              command: () => this.redirectUrl('sgr-parametros-distribucion')
            }
          ]
        },
        {
          // Equivale al menú «Cálculo» del sistema anterior, donde vive la IAC
          // junto con las participaciones por asignación (pendientes de migrar).
          label: 'SGR - Cálculo',
          items: [
            {
              label: 'Instrucción de Abono a Cuenta',
              command: () => this.redirectUrl('sgr-iac')
            }
          ]
        },
        {
          separator: true
        },
        {
          label: 'Tema',
          icon: 'pi pi-palette',
          items: [
            {
              label: 'Clásico',
              icon: this.theme.tema() === 'clasico' ? 'pi pi-check' : 'pi pi-circle',
              command: () => this.theme.set('clasico')
            },
            {
              label: 'PND 2026–2030',
              icon: this.theme.tema() === 'pnd' ? 'pi pi-check' : 'pi pi-circle',
              command: () => this.theme.set('pnd')
            }
          ]
        }
      ]
    };
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

openExternal(url: string) {
  window.open(url, '_blank');
}


  redirectHome() {
    this.route.navigate(['/']);
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