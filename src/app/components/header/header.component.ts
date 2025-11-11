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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, ButtonModule, Menubar],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {

  items: MenuItem[] | undefined;
  private isScrolled = false;
  private scrollThreshold = 100; // Píxeles de scroll antes de aplicar efectos (aumentado para mejor UX)
  private isBrowser: boolean;

  constructor(
    private route: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
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
            label: 'Distribución Doce Doceavas y Anexos',
            command: () => this.redirectUrl("sgp-documentos-anexos")
          },
          {
            label: 'Ficha SGP, información Presupuestal',
            command: () => this.redirectUrl("sgp-detalle-presupuestal")
          },
          {
            label: 'Ficha comparativa de distribución SGP',
            command: () => this.redirectUrl("sgp-comparativa")
          },
          {
            label: 'Distribución SGP para los Resguardos Indígenas',
            // command: () => this.redirectUrl("reports-sgp-budget")
          },
          {
            label: 'Eficiencia Fiscal y Eficiencia Administrativa de la participación para Propósito general',
            command: () => this.redirectUrl("sgp-eficiencia")
          },
          {
            label: 'Ficha para la proyección de los recursos del SGP – Vigencia 2024'
          }
        ]
      },
      {
        label: 'SGR',
        items: [
          {
            label: 'Comparativo Avance vs Presupuesto',
            command: () => this.redirectUrl("sgr-comparativo")
          },
          {
            label: 'Administración y Sistema de Seguimiento (SSEC)',
             command: () => this.redirectUrl("reporte-funcionamiento")
          },          
          {
            label: 'Plan Bienal de Caja',
            command: () => this.redirectUrl("sgr-programacion")
          },
          {
            label: 'Recaudo directas',
            command: () => this.redirectUrl("sgr-recaudo-directas")
          },{
            label: 'Recaudo mensual',
            command: () => this.redirectUrl("sgr-recaudo-mensual")
          },
          {
            label: 'Recaudo frente a presupuesto',
            command: () => this.redirectUrl("sgr-presupuesto-y-recaudo")
          },
          {
            label: 'Visor General de recursos AD hidrocarburos y minería',
            // command: () => this.redirectUrl("propuesta-resumen-sgr")
          }
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
          },          
          {
            label: 'Comparativa Regionalización',
            command: () => this.redirectUrl("pgn-comparativa-regionalizacion")
          }          
        ]
      },   
      {
        label: 'Ayuda',
        items: [
          {
            label: 'Preguntas Frecuentes',
            command: () => this.redirectFAQ()
          },{
            label: 'Guías y manuales'
          }
        ]
      }      
    ];
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
}