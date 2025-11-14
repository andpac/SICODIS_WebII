import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MatIconModule } from '@angular/material/icon';
import { FaqItem, FaqItemComponent } from '../faq-item/faq-item.component';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

interface FaqSection {
  title: string;
  icon: string;
  items: FaqItem[];
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    ButtonModule,
    CardModule,
    MatIconModule,
    Breadcrumb
  ],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent implements OnInit {

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  faqSections: FaqSection[] = [
    {
      title: 'Sistema General de Participaciones (SGP)',
      icon: 'account_balance',
      items: [
        {
          title: '¿Qué es el Sistema General de Participaciones?',
          content: 'El Sistema General de Participaciones (SGP) es el mecanismo establecido por la Constitución y la ley para distribuir recursos del presupuesto nacional hacia las entidades territoriales (departamentos, distritos y municipios) para financiar los servicios a su cargo, en especial educación, salud, agua potable y saneamiento básico.',
          route: 'reports-sgp',
          value: '0'
        },
        {
          title: '¿Cómo consultar la distribución de recursos del SGP por entidad territorial?',
          content: 'Puede consultar la distribución comparativa de recursos SGP por entidad territorial, visualizando las variaciones año a año y los criterios de distribución aplicados.',
          route: 'reports-sgp-dist',
          value: '1'
        },
        {
          title: '¿Dónde puedo ver el presupuesto SGP por vigencia?',
          content: 'En la ficha presupuestal SGP puede consultar los recursos asignados por entidad territorial, correspondientes a las doceavas distribuidas en cada vigencia.',
          route: 'reports-sgp-budget',
          value: '2'
        },
        {
          title: '¿Cómo ver la evolución histórica del SGP?',
          content: 'Puede consultar las gráficas de evolución del SGP desde 2005, tanto en precios corrientes como constantes, incluyendo el análisis por cada participación (educación, salud, agua potable, propósito general).',
          route: 'graphics-sgp',
          value: '3'
        }
      ]
    },
    {
      title: 'Sistema General de Regalías (SGR)',
      icon: 'oil_barrel',
      items: [
        {
          title: '¿Qué es el Sistema General de Regalías?',
          content: 'El Sistema General de Regalías (SGR) es el conjunto de ingresos, órganos, procedimientos y regulaciones a través del cual se distribuyen los ingresos provenientes de la explotación de recursos naturales no renovables.',
          route: 'reports-sgr',
          value: '4'
        },
        {
          title: '¿Cómo consultar el plan bienal de caja del SGR?',
          content: 'Puede generar reportes detallados del plan bienal de caja para los recursos del SGR, incluyendo la información de presupuesto y ejecución por bienio.',
          route: 'reports-sgr-bienal',
          value: '5'
        },
        {
          title: '¿Dónde veo el comparativo de presupuesto vs recaudo del SGR?',
          content: 'En el módulo comparativo puede consultar el avance durante el bienio seleccionado, del presupuesto frente al recaudo comunicado a través de las Instrucciones de Abono a Cuenta (IAC).',
          route: 'reports-sgr-comparative',
          value: '6'
        },
        {
          title: '¿Cómo acceder al comparativo IAC vs Presupuesto detallado?',
          content: 'Este módulo presenta el comparativo detallado entre las Instrucciones de Abono a Cuenta y el presupuesto asignado, con información por entidad y concepto.',
          route: 'comparativo-iac-presupuesto',
          value: '7'
        },
        {
          title: '¿Qué información contiene el resumen del plan de recursos SGR?',
          content: 'El resumen del plan de recursos presenta la información consolidada de asignaciones, distribución y ejecución de recursos del SGR por diferentes conceptos y entidades.',
          route: 'reports-sgr-resumen-plan-recursos',
          value: '8'
        },
        {
          title: '¿Dónde consulto la propuesta resumen del SGR?',
          content: 'La propuesta resumen SGR presenta información detallada sobre presupuestos, recaudos y distribución de recursos, organizada jerárquicamente por conceptos presupuestales.',
          route: 'propuesta-resumen-sgr',
          value: '9'
        }
      ]
    },
    // {
    //   title: 'Herramientas de Consulta y Análisis',
    //   icon: 'analytics',
    //   items: [
    //     {
    //       title: '¿Cómo usar el tablero de control (Dashboard)?',
    //       content: 'El dashboard presenta un resumen ejecutivo con las principales métricas del SGP y SGR, incluyendo gráficos interactivos y mapas de distribución territorial.',
    //       route: 'dashboard',
    //       value: '10'
    //     },
    //     {
    //       title: '¿Qué información muestra el mapa de distribución?',
    //       content: 'El mapa interactivo permite visualizar geográficamente la distribución de recursos del SGP y SGR por departamentos y municipios de Colombia.',
    //       route: 'reports-map',
    //       value: '11'
    //     },
    //     {
    //       title: '¿Cómo usar el módulo de presupuesto y recaudo?',
    //       content: 'Este módulo permite consultar y comparar información de presupuesto vigente con el recaudo efectivo, presentando análisis financieros detallados.',
    //       route: 'presupuesto-y-recaudo',
    //       value: '12'
    //     },
    //     {
    //       title: '¿Qué herramientas adicionales están disponibles?',
    //       content: 'En el baúl de herramientas encontrará utilidades adicionales como consulta de variables de distribución, históricos, proyecciones y análisis de eficiencia.',
    //       route: 'tools',
    //       value: '13'
    //     }
    //   ]
    // },
    {
      title: 'Conceptos y Definiciones',
      icon: 'help',
      items: [
        {
          title: '¿Qué son las Instrucciones de Abono a Cuenta (IAC)?',
          content: 'Las IAC son los documentos mediante los cuales se comunica oficialmente a las entidades territoriales el recaudo de regalías y compensaciones que les corresponde, para que puedan ser incorporadas en sus presupuestos.',
          value: '14'
        },
        {
          title: '¿Qué significa "doceava" en el contexto del SGP?',
          content: 'Las doceavas son las doce partes iguales en que se divide el monto anual del SGP para su distribución mensual a las entidades territoriales. Para educación se distribuyen 12 doceavas, para los demás conceptos 11 doceavas más la última doceava del año anterior.',
          value: '15'
        },
        {
          title: '¿Qué es el FONPET?',
          content: 'El Fondo Nacional de Pensiones de las Entidades Territoriales (FONPET) es un fondo destinado a atender el pasivo pensional de las entidades territoriales, financiado con recursos del SGR.',
          value: '16'
        },
        {
          title: '¿Qué son las asignaciones directas del SGR?',
          content: 'Son recursos del SGR que se asignan directamente a las entidades territoriales productoras de recursos naturales no renovables, correspondientes al 20% del total de los ingresos del sistema.',
          value: '17'
        }
      ]
    },
    {
      title: 'Soporte Técnico',
      icon: 'support',
      items: [
        {
          title: '¿Cómo exportar la información consultada?',
          content: 'La mayoría de módulos cuentan con botones de exportación que permiten descargar la información en formato Excel para su análisis posterior.',
          value: '18'
        },
        {
          title: '¿Con qué frecuencia se actualiza la información?',
          content: 'La información del SGP se actualiza mensualmente con cada distribución. La información del SGR se actualiza de acuerdo con los reportes de recaudo y las instrucciones de abono a cuenta.',
          value: '19'
        },
        {
          title: '¿Qué hacer si encuentro inconsistencias en los datos?',
          content: 'Si identifica posibles inconsistencias en la información, puede reportarlas a través del formulario de PQRSD disponible en el sitio web del DNP o contactar directamente al equipo técnico al correo sicodis@dnp.gov.co',
          value: '20'
        },
        {
          title: '¿Hay documentación técnica disponible?',
          content: 'Sí, en la sección "Documentos Financiamiento Territorial" encontrará la documentación técnica, metodológica y normativa relacionada con el SGP y SGR.',
          value: '21'
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.items = [
        { label: 'Preguntas Frecuentes' }        
    ];

    this.home = { icon: 'pi pi-home', routerLink: '/' };
  }

  navigateToRoute(route: string) {
    if (route) {
      this.router.navigate([route]);
    }
  }
}