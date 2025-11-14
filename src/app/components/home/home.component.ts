import { Component, OnInit } from '@angular/core';
import { ReportsTargetComponent } from '../reports-target/reports-target.component';
import { CommonModule  } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router } from '@angular/router';
import { Card, CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';


import { CarouselModule } from 'primeng/carousel';
import { TagModule } from 'primeng/tag';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { NumberFormatPipe } from '../../utils/numberFormatPipe';
import { SafeGaugeComponent } from './safe-gauge.component';
import { SicodisApiService, ResumenParticipaciones } from '../../services/sicodis-api.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReportsTargetComponent,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    MatIconModule,
    CarouselModule,
    TagModule,
    NumberFormatPipe,
    SafeGaugeComponent,
    TableModule,
    ChartModule,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {

  cards: MyCard[] = [
    {
      imageUrl: '/assets/img/target2.svg',
      date: 'Junio 3 de 2024',
      description: '',
      title: 'Informes y documentos del Sistema General de Regalías',
      buttonLabel: 'Ver Reportes',
      link: 'https://www.dnp.gov.co/LaEntidad_/subdireccion-general-inversiones-seguimiento-evaluacion/direccion-programacion-inversiones-publicas/Paginas/sistema-general-de-regalias.aspx'
    },
    {
      imageUrl: '/assets/img/carrousel1.jpg',
      date: 'Junio 3 de 2024',
      description: '',
      title: 'Documentos del Sistema General de Participaciones',
      buttonLabel: 'Ver Reportes',
      link: 'https://www.dnp.gov.co/LaEntidad_/subdireccion-general-inversiones-seguimiento-evaluacion/direccion-programacion-inversiones-publicas/Paginas/sistema-general-de-participaciones.aspx'
    },
    {
      imageUrl: '/assets/img/carrousel2.jpg',
      date: 'Junio 3 de 2024',
      description: '',
      title: 'Sobre distribución de recursos territoriales​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​',
      buttonLabel: 'Ver Reportes',
      link: 'https://www.dnp.gov.co/LaEntidad_/subdireccion-general-inversiones-seguimiento-evaluacion/direccion-programacion-inversiones-publicas/Paginas/distribucion-de-recursos-territoriales.aspx'
    }
  ];

  highlightApps = [
    {
        id: '1000',
        code: 'f230fh0g3',
        name: 'Aplicativo ABC',
        description: 'Product Description',
        image: 'https://colaboracion.dnp.gov.co/CDT/PublishingImages/Noticias/2024/Diciembre/boletin-conpes-dnp.jpg',
        price: 65,
        category: 'Accessories',
        quantity: 24,
        inventoryStatus: 'INSTOCK',
        rating: 5
    },
    {
        id: '1001',
        code: 'nvklal433',
        name: 'Aplicativo XYZ',
        description: 'Product Description',
        image: 'https://colaboracion.dnp.gov.co/CDT/PublishingImages/Noticias/2024/Diciembre/boletin-dh.jpg',
        price: 72,
        category: 'Accessories',
        quantity: 61,
        inventoryStatus: 'OUTOFSTOCK',
        rating: 4
    },
    {
        id: '1002',
        code: 'zz21cz3c1',
        name: 'Aplicativo 123',
        description: 'Product Description',
        image: 'https://colaboracion.dnp.gov.co/CDT/PublishingImages/Noticias/2024/Diciembre/comunales.jpg',
        price: 79,
        category: 'Fitness',
        quantity: 2,
        inventoryStatus: 'LOWSTOCK',
        rating: 3
    },
    {
        id: '1003',
        code: '244wgerg2',
        name: 'Aplicativo QWE',
        description: 'Product Description',
        image: 'https://colaboracion.dnp.gov.co/CDT/PublishingImages/Noticias/2024/Diciembre/boletin-mercado-popular.jpg',
        price: 29,
        category: 'Clothing',
        quantity: 25,
        inventoryStatus: 'INSTOCK',
        rating: 5
    },
    {
        id: '1004',
        code: 'h456wer53',
        name: 'Aplicativo ASD',
        description: 'Product Description',
        image: 'https://colaboracion.dnp.gov.co/CDT/PublishingImages/Noticias/2024/Diciembre/Bolet%C3%ADn-Director%20firmando%20acuerdo%20en%20Cali.jpeg',
        price: 15,
        category: 'Accessories',
        quantity: 73,
        inventoryStatus: 'INSTOCK',
        rating: 4
    },
    {
        id: '1005',
        code: 'av2231fwg',
        name: 'Aplicativo ZXC',
        description: 'Product Description',
        image: 'https://colaboracion.dnp.gov.co/CDT/PublishingImages/Noticias/2024/Diciembre/Imagen%20de%20vendedores%20de%20corabastos%20con%20sus%20mercados.jpg',
        price: 120,
        category: 'Accessories',
        quantity: 0,
        inventoryStatus: 'OUTOFSTOCK',
        rating: 4
    },
    {
        id: '1006',
        code: 'bib36pfvm',
        name: 'Aplicativo POI',
        description: 'Product Description',
        image: 'https://colaboracion.dnp.gov.co/CDT/PublishingImages/Noticias/2024/Diciembre/director-dnp.jpg',
        price: 32,
        category: 'Accessories',
        quantity: 5,
        inventoryStatus: 'LOWSTOCK',
        rating: 3
    },
    {
        id: '1007',
        code: 'mbvjkgip5',
        name: 'Aplicativo MNB',
        description: 'Product Description',
        image: 'https://colaboracion.dnp.gov.co/CDT/PublishingImages/Noticias/2024/Diciembre/Cuarta%20Sesi%C3%B3n%20Ordinaria%20del%20Consejo%20del%20Mecanismo%20Especial%20de%20Seguimiento%20de%20Pol%C3%ADticas%20P%C3%BAblicas.jpeg',
        price: 34,
        category: 'Accessories',
        quantity: 23,
        inventoryStatus: 'INSTOCK',
        rating: 5
    }
  ];

  // cards2: MyCard[] = [
  //   {
  //     title: 'Servicios Profesionales',
  //     description: 'Ofrecemos servicios de alta calidad adaptados a sus necesidades específicas. Nuestro equipo de expertos está listo para ayudarte.',
  //     imageUrl: '/assets/img/target2.svg',
  //     date: 'Junio 3 de 2024',
  //     buttonLabel: 'Ver Reportes'
  //   },
  //   {
  //     title: 'Productos Innovadores',
  //     description: 'Descubre nuestra línea de productos innovadores diseñados para mejorar tu vida diaria. Calidad y tecnología de vanguardia.',
  //     imageUrl: '/assets/img/target1.svg',
  //     date: 'Junio 3 de 2024',
  //     buttonLabel: 'Explorar Más'
  //   },
  //   {
  //     title: 'Nuestro Equipo',
  //     description: 'Conoce al equipo de profesionales detrás de nuestro éxito. Personas apasionadas y comprometidas con la excelencia.',
  //     imageUrl: '/assets/img/target2.svg',
  //     date: 'Junio 3 de 2024',
  //     buttonLabel: 'Conocer Equipo'
  //   },
  //   {
  //     title: 'Contacto',
  //     description: 'Estamos aquí para responder tus preguntas. Contáctanos y descubre cómo podemos ayudarte a alcanzar tus objetivos.',
  //     imageUrl: '/assets/img/target1.svg',
  //     date: 'Junio 3 de 2024',
  //     buttonLabel: 'Contactar'
  //   }
  // ];

  titleSGR = 'Sistema General de Regalías - SGR';
  titleSGP = 'Sistema General de Participaciones - SGP';
  titlePGN = 'Presupuesto General de la Nación - PGN';
  titleGeovisor = 'Geovisor';

  descriptionSGP =
    'Son los recursos que la Nación transfiere a las entidades territoriales y resguardos indígenas, para la financiación de los servicios a su cargo, conforme con las competencias establecidas en la ley.';

  descriptionSGR =
    'Es el conjunto de ingresos, asignaciones, órganos, procedimientos y regulaciones, para el uso eficiente y la destinación de los ingresos provenientes de la explotación de los recursos naturales no renovables.';

  descriptionPGN =
    'En esta sección podrá consultar información relacionada con la ejecución presupuestal de las entidades que hacen parte del Presupuesto General de la Nación (PGN).';

  descriptionGeovisor =
    'Comparativo y valores vigentes de los recursos distribuidos del SGP y SGR por regiones y departamentos.';

  responsiveOptions: any[] | undefined;

  cols: number = 4;
  cols2: number = 2;
  cols3: number = 3;

  // Add to the component class
  departments = [
    { id: 1, name: 'Antioquia' },
    { id: 2, name: 'Cundinamarca' },
    { id: 3, name: 'Santander' },
    // Add more departments as needed
  ];

  municipalities = [
    { id: 1, name: 'Medellín', deptId: 1 },
    { id: 2, name: 'Bogotá', deptId: 2 },
    { id: 3, name: 'Bucaramanga', deptId: 3 },
    // Add more municipalities as needed
  ];

  selectedDepartment: number | null = null;

  sgpItems: { concept: string; amount: number; isTotal: boolean; avanceDistribucion?: number }[] = [];

  // Datos para el gráfico donut SGP
  donutSgpData: any;
  donutSgpOptions: any;
  sgpPorcentajeEjecucion: string = '0,0';

  // Datos para los gráficos donut SGR
  donutSgrCorrientesData: any;
  donutSgrCorrientesOptions: any;
  sgrPorcentajeCorrientes: string = '0,0';
  
  donutSgrOtrosData: any;
  donutSgrOtrosOptions: any;
  sgrPorcentajeOtros: string = '0,0';

  sgrItems = [
    { concept: 'Inversión', amount: 2000000000, progress: 67.65, isFirst: true, isTotal: false },
    { concept: 'Ahorro', amount: 500000000, progress: 56.73, isFirst: false, isTotal: false },
    { concept: 'Administración y SSEC', amount: 400000000, progress: 73.69,isFirst: false, isTotal: false },    
    { concept: 'Total Ahorro', amount: 3700000000, progress: 83.2, isFirst: false, isTotal: true }
  ];

  isBrowser: boolean = false;
  showGauges: boolean = false;

  gaugeSize: number = 180;
  gaugeTick: number = 10;
  gaugeValue: number = 68.2;

  markerConfig = {
    "0": { color: '#555', size: 8, label: '0', type: 'line'},
    "15": { color: '#555', size: 4, type: 'line'},
    "30": { color: '#555', size: 8, label: '30', type: 'line'},
    "40": { color: '#555', size: 4, type: 'line'},
    "50": { color: '#555', size: 8, label: '50', type: 'line'},
    "60": { color: '#555', size: 4, type: 'line'},
    "70": { color: '#555', size: 8, label: '70', type: 'line'},
    "85": { color: '#555', size: 4, type: 'line'},
    "100": { color: '#555', size: 8, label: '100', type: 'line'},
  }

  constructor(private route: Router,
    private breakpointObserver: BreakpointObserver,
    private sicodisApiService: SicodisApiService
  ) {
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large
    ]).pipe(
      map(result => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          return 1;
        } else if (result.breakpoints[Breakpoints.Small]) {
          return 2;
        } else if (result.breakpoints[Breakpoints.Medium]) {
          return 3;
        }
        return 4;
      })
    ).subscribe(cols => this.cols = cols);

    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large
    ]).pipe(
      map(result => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          return 1;
        } else if (result.breakpoints[Breakpoints.Small]) {
          return 1;
        } else if (result.breakpoints[Breakpoints.Medium]) {
          return 2;
        }
        return 2;
      })
    ).subscribe(cols2 => this.cols2 = cols2);

    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large
    ]).pipe(
      map(result => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          return 1;
        } else if (result.breakpoints[Breakpoints.Small]) {
          return 1;
        } else if (result.breakpoints[Breakpoints.Medium]) {
          return 2;
        }
        return 3;
      })
    ).subscribe(cols3 => this.cols3 = cols3);
  }

  ngOnInit() {
    this.initializeDonutChart();
    this.initializeSgrDonutCharts();
    this.responsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '1199px',
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '767px',
            numVisible: 2,
            numScroll: 1
        },
        {
            breakpoint: '575px',
            numVisible: 1,
            numScroll: 1
        }
    ];
    
    this.loadSgpData();
    this.initializeSgrData();
  }

  private initializeDonutChart() {
    // Register custom plugin for center text in donut charts
    const centerTextPlugin = {
      id: 'centerText',
      beforeDraw: (chart: any) => {
        if (chart.config.options.plugins?.centerText?.display) {
          const ctx = chart.ctx;
          const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
          const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 1.42;
          
          ctx.save();
          ctx.font = 'bold 22px Arial';
          ctx.fillStyle = '#aaa4a2ff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const text = chart.config.options.plugins.centerText.text();
          ctx.fillText(text, centerX, centerY);
          ctx.restore();
        }
      }
    };

    // Register the plugin globally
    if (typeof Chart !== 'undefined') {
      Chart.register(centerTextPlugin);
    }

    //const documentStyle = getComputedStyle(document.documentElement);
    //const textColor = documentStyle.getPropertyValue('--text-color') || '#333';
    
    this.donutSgpOptions = {
      cutout: '60%',
      rotation: -90,
      circumference: 180,
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: "#333",
            font: { size: 14 }
          }
        },
        title: {
          display: true,
          text: 'Avance de Ejecución',
          color: "#333",
          font: { size: 18, weight: 'bold' }
        },
        tooltip: {
          callbacks: {
            label: function(tooltipItem: any) {
              return `${Math.ceil(tooltipItem.raw).toLocaleString('es-CO')}`;
            }
          },
          xAlign: 'left',
          yAlign: 'bottom'
        },
        centerText: {
          display: true,
          text: () => {
            const value = this.sgpPorcentajeEjecucion;
            if (!value || value === 'Infinity' || value === 'NaN' || isNaN(parseFloat(value.replace(',', '.')))) {
              return '0,0%';
            }
            return value + '%';
          }
        }
      }
    };
  }

  private initializeSgrDonutCharts() {
    //const documentStyle = getComputedStyle(document.documentElement);
    //const textColor = documentStyle.getPropertyValue('--text-color') || '#333';
    
    // Opciones para gráfico corrientes (naranja)
    this.donutSgrCorrientesOptions = {
      cutout: '60%',
      rotation: -90,
      circumference: 180,
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: "#333",
            font: { size: 14 }
          }
        },
        title: {
          display: true,
          text: 'Avance de distribución corrientes',
          color: "#333",
          font: { size: 18, weight: 'bold' }
        },
        tooltip: {
          callbacks: {
            label: function(tooltipItem: any) {
              return `${Math.ceil(tooltipItem.raw).toLocaleString('es-CO')}`;
            }
          },
          xAlign: 'left',
          yAlign: 'bottom'
        },
        centerText: {
          display: true,
          text: () => {
            const value = this.sgrPorcentajeCorrientes;
            if (!value || value === 'Infinity' || value === 'NaN' || isNaN(parseFloat(value.replace(',', '.')))) {
              return '0,0%';
            }
            return value + '%';
          }
        }
      }
    };

    // Opciones para gráfico otros (verde agua)
    this.donutSgrOtrosOptions = {
      cutout: '60%',
      rotation: -90,
      circumference: 180,
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: "#333",
            font: { size: 14 }
          }
        },
        title: {
          display: true,
          text: 'Avance de distribución otros',
          color: "#333",
          font: { size: 18, weight: 'bold' }
        },
        tooltip: {
          callbacks: {
            label: function(tooltipItem: any) {
              return `${Math.ceil(tooltipItem.raw).toLocaleString('es-CO')}`;
            }
          },
          xAlign: 'left',
          yAlign: 'bottom'
        },
        centerText: {
          display: true,
          text: () => {
            const value = this.sgrPorcentajeOtros;
            if (!value || value === 'Infinity' || value === 'NaN' || isNaN(parseFloat(value.replace(',', '.')))) {
              return '0,0%';
            }
            return value + '%';
          }
        }
      }
    };
  }

  private initializeSgrData() {
    // Datos de ejemplo para corrientes (naranja)
    const corrientesDistribuido = 1350000000;
    const corrientesTotal = 2000000000;
    const corrientesRestante = corrientesTotal - corrientesDistribuido;
    const corrientesPorcentaje = (corrientesDistribuido / corrientesTotal) * 100;
    
    this.sgrPorcentajeCorrientes = corrientesPorcentaje.toFixed(1).replace('.', ',');
    
    this.donutSgrCorrientesData = {
      labels: ['Distribución', 'Presupuesto'],
      datasets: [
        {
          data: [corrientesDistribuido, corrientesRestante],
          backgroundColor: ['#ee825a', '#eceae9'],
          hoverBackgroundColor: ['#e85c16', '#dee2e6'],
          borderColor: '#CCCCCC',
          borderWidth: 1,
        }
      ]
    };

    // Datos de ejemplo para otros (verde agua)
    const otrosDistribuido = 285000000;
    const otrosTotal = 500000000;
    const otrosRestante = otrosTotal - otrosDistribuido;
    const otrosPorcentaje = (otrosDistribuido / otrosTotal) * 100;
    
    this.sgrPorcentajeOtros = otrosPorcentaje.toFixed(1).replace('.', ',');
    
    this.donutSgrOtrosData = {
      labels: ['Distribución', 'Presupuesto'],
      datasets: [
        {
          data: [otrosDistribuido, otrosRestante],
          backgroundColor: ['#77d6ba', '#eceae9'],
          hoverBackgroundColor: ['#5bc4a7', '#dee2e6'],
          borderColor: '#CCCCCC',
          borderWidth: 1,
        }
      ]
    };
  }

  loadSgpData() {
    this.sicodisApiService.getSgpResumenParticipaciones(2025, 'TODOS', 'TODOS').subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.processSgpData(response);
        } else {
          console.error('La respuesta no es un array:', response);
        }
      },
      error: (error) => {
        console.error('Error al obtener datos SGP:', error);
      }
    });
  }

  private processSgpData(data: any[]) {
    // Buscar el registro con id_concepto = 99 (total)
    const totalRecord = data.find(item => item.id_concepto == 99);
    const totalAmount = totalRecord ? totalRecord.total : 1;
    
    // Filtrar solo conceptos principales (4 dígitos) excluyendo el total
    const principalRecords = data.filter(item => 
      item.id_concepto != 99 && 
      item.id_concepto.toString().length === 4
    );
    
    // Calcular sumatoria de conceptos principales
    const sumaConcepts = principalRecords.reduce((sum, item) => sum + (item.total || 0), 0);
    
    // Procesar registros principales y calcular avance distribución
    this.sgpItems = principalRecords.map(item => ({
      concept: item.concepto,
      amount: item.total,
      isTotal: false,
      avanceDistribucion: totalAmount > 0 ? (item.total / totalAmount) * 100 : 0
    }));
    
    // Agregar el registro total al final
    if (totalRecord) {
      this.sgpItems.push({
        concept: totalRecord.concepto,
        amount: totalRecord.total,
        isTotal: true,
        avanceDistribucion: 100
      });
    }
    
    // Calcular datos para el gráfico donut
    this.updateDonutChart(sumaConcepts, totalAmount);
  }

  private updateDonutChart(sumaConceptos: number, totalAmount: number) {
    const restante = totalAmount - sumaConceptos;
    const porcentaje = totalAmount > 0 ? (sumaConceptos / totalAmount) * 100 : 0;
    
    this.sgpPorcentajeEjecucion = porcentaje.toFixed(1).replace('.', ',');
    
    this.donutSgpData = {
      labels: ['Distribución', 'Restante'],
      datasets: [
        {
          data: [sumaConceptos, restante],
          backgroundColor: ['#259ae7ff', '#eceae9'],
          hoverBackgroundColor: ['#45ca33ff', '#05720eff'],
          borderColor: '#CCCCCC',
          borderWidth: 1,
        }
      ]
    };
  }

  redirectSGR() {
    this.route.navigate(['/reports-sgr']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  redirectSGP() {
    this.route.navigate(['/sgp-inicio']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  redirectTo(page: string){
    this.route.navigate([`/${page}`]).then(() => {
      window.scrollTo(0, 0);
    });
  }

  redirectToFAQ(){
    this.route.navigate(['/faq']).then(() => {
      window.scrollTo(0, 0);
    });
  }
}

export interface Product {
  id?: string;
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  inventoryStatus?: string;
  category?: string;
  image?: string;
  rating?: number;
}

export interface MyCard {
  title: string;
  description: string;
  imageUrl: string;
  buttonLabel: string;
  date: string;
  link: string;
}
