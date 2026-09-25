import { Component, NgZone, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SicodisApiService } from '../../services/sicodis-api.service';
import type { DiccionarioItem, SiglasItem, FuncionamientoSiglasDiccionario, ConceptoFuente } from '../../services/sicodis-api.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import Chart from 'chart.js/auto';

// Funciones de utilidad solo para fallback en caso de que la API no responda
import { 
  getFuentes,
  getConceptosByFuente,
  getBeneficiariosByFuenteAndConcepto
} from '../../utils/sgr-functions';
import { NumberFormatPipe } from '../../utils/numberFormatPipe';
import { PercentFormatPipe } from '../../utils/percentFormatPipe';
import { MatIconModule } from '@angular/material/icon';
import { FloatLabel } from 'primeng/floatlabel';
import { Select, SelectChangeEvent } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { MultiSelect, MultiSelectChangeEvent  } from 'primeng/multiselect';
import { InfoPopupComponent } from '../info-popup/info-popup.component';
import { InfografiaPopupComponent } from '../infografia-popup/infografia-popup.component';
import { departamentos } from '../../data/departamentos';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';

interface SelectOption {
  value: string;
  label: string;
}

/**
 * Reporte de Funcionamiento Component - Optimized Version
 * 
 * Este componente ha sido refactorizado para usar exclusivamente la API de SICODIS
 * en lugar de cálculos locales. Los cambios principales incluyen:
 * 
 * - Removidos métodos obsoletos de cálculo local (calcularTotalesConBeneficiarios, etc.)
 * - Consolidados los manejadores de filtros para usar cargarDistribucionTotalDesdeAPI()
 * - Optimizada la carga inicial de datos API en paralelo
 * - Implementada lógica reutilizable para manejo de selección TOTAL
 * - Simplificados los imports eliminando dependencias no utilizadas
 * 
 * Los datos locales JSON ahora solo se usan como fallback en caso de error de API.
 */

@Component({
  selector: 'app-reporte-funcionamiento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatGridListModule,
    MatCardModule,
    ButtonModule,
    ChartModule,
    ProgressSpinnerModule,
    NumberFormatPipe,
    PercentFormatPipe,
    MatIconModule,
    FloatLabel,
    Select,
    MultiSelect,
    InfoPopupComponent,
    InfografiaPopupComponent,
    SplitButtonModule,
    Breadcrumb
  ],
  templateUrl: './reporte-funcionamiento.component.html',
  styleUrl: './reporte-funcionamiento.component.scss'
})
export class ReporteFuncionamientoComponent implements OnInit {
  platformId = inject(PLATFORM_ID);

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  // Datos originales cargados desde el JSON
  private funcionamientoData: any[] = [];
  private funcionamientoDataEntities: any[] = [];
  funcionamientoDataEntitiesCR: any[] = [];
  
  // Datos con el registro de totales incluido
  private funcionamientoDataConTotales: any[] = [];

  // Datos para diccionario y siglas
  private siglasDiccionarioData: FuncionamientoSiglasDiccionario | null = null;

  // Datos API cargados una vez al inicializar
  private fuentesAsignacionesAPI: any[] = [];
  private departamentosAPI: any[] = [];

  // Opciones para los selects
  fuentes: SelectOption[] = [];
  conceptos: SelectOption[] = [];
  beneficiarios: SelectOption[] = [];
  departamentos: SelectOption[] = [];
  municipios: SelectOption[] = [];

  // Valores seleccionados - iniciar sin selección
  selectedVigencia: any; // Seleccionar el primer elemento por defecto
  selectedFuente: any[] = [];
  selectedConcepto: any[] = [];
  selectedBeneficiario: any[] = [];
  selectedDepartamento: any;
  selectedMunicipio: any[] = [];
  selectedEntidadCR: any;
  isEntidadCRSelected: boolean = false;

  fechaActualizacion: string = '';
  fechaCorteRecaudo: string = '';  
  
  private vigenciasConfig: Record<number, { actualizacion: string; corte: string }> = {
    1: { actualizacion: 'diciembre 31 de 2012', corte: 'diciembre 31 de 2012' },
    2: { actualizacion: 'diciembre 31 de 2014', corte: 'diciembre 31 de 2014' },
    3: { actualizacion: 'diciembre 31 de 2016', corte: 'diciembre 31 de 2016' },
    4: { actualizacion: 'diciembre 31 de 2018', corte: 'septiembre 15 de 2018' },
    5: { actualizacion: 'diciembre 31 de 2020', corte: 'diciembre 31 de 2020' },
    6: { actualizacion: 'diciembre 31 de 2022', corte: 'agosto 15 de 2022' },
    7: { actualizacion: 'diciembre 31 de 2024', corte: 'diciembre 15 de 2024' },
    8: { actualizacion: 'febrero 28 de 2026', corte: 'febrero 15 de 2026' }
  };  

  // Datos para las tarjetas (se actualizarán según la selección)
  presupuestoData = {
    presupuestoAsignado: 0,
    disponibilidadInicial: 0,
    recursosBloquedos: 0,
    presupuestoVigenteDisponible: 0
  };

  ejecucionData = {
    cdp: 0,
    compromiso: 0,
    pagos: 0,
    saldo_sin_afectacion: 0,
    saldo_por_comprometer: 0
  };

  situacionCajaData = {
    disponibilidadInicial: 0,
    recaudo: 0,
    cajaTotal: 0,
    cajaDisponible: 0
  };

  avanceRecaudoData = {
    presupuestoCorriente: 0,
    iacCorriente: 0,
    avance: 0,
    avanceIacPbc: 0
  }

  // Datos para los gráficos
  horizontalBarAfectacionData: any;
  horizontalBarAfectacionOptions: any;
  hBarSituacionCajaOpts: any;
  donutAvanceEjecucionData: any;
  donutAvanceEjecucionOptions: any;
  hBarSituacionCajaData: any;
  hBarAvanceRecaudoData: any;
  hBarAvanceRecaudoOptions: any;
  detailChartData: any;
  detailChartOptions: any;

  compromisoPorcentaje: string = '0.0';
  
  distribucionTotal: any = [];
  distribucionTotalMultiple: any[] = [];
  
  // Loading states
  isLoadingData: boolean = false;
  
  // Estructuras para mantener relaciones fuente → concepto → beneficiario
  fuenteConceptoMap: Map<string, any[]> = new Map(); // fuente_id -> conceptos[]
  conceptoBeneficiarioMap: Map<string, any[]> = new Map(); // concepto_id -> beneficiarios[]
  beneficiarioFuenteMap: Map<string, string> = new Map(); // beneficiario_id -> fuente_id
  
  // Registro actualmente seleccionado
  registroActual: any = null;

  /**
   * Indica si se debe ocultar la tarjeta "Ejecución Presupuestal" y la gráfica
   * "Afectación Presupuestal". Aplica para el item "Recursos por distribuir" de las
   * asignaciones "Funcionamiento SGR" y "Fiscalización" (beneficiarios
   * "Recursos por distribuir - Funcionamiento" y "Recursos por distribuir - Fiscalización"),
   * que por ser recursos aún sin distribuir no tienen ejecución ni afectación presupuestal.
   */
  get ocultarEjecucionYAfectacion(): boolean {
    return this.selectedBeneficiario?.length === 1 &&
      (this.selectedBeneficiario[0]?.label ?? '')
        .trim()
        .toLowerCase()
        .startsWith('recursos por distribuir');
  }

  /**
   * Indica si se deben ocultar las tarjetas "Situación de Caja" y "Avance del recaudo de
   * ingresos corrientes" con sus gráficos. Aplica cuando el beneficiario es
   * "Departamento Nacional de Planeación - Comisión Rectora" y la entidad de la Comisión
   * Rectora seleccionada NO es "Comisión Rectora - DNP" (las demás entidades —departamentos,
   * municipios y asociaciones— no tienen situación de caja ni avance de recaudo propios).
   */
  get ocultarCajaYRecaudo(): boolean {
    return this.selectedBeneficiario?.length === 1 &&
      (this.selectedBeneficiario[0]?.label ?? '').trim() === this.DNP_CR &&
      this.selectedEntidadCR != null &&
      (this.selectedEntidadCR.nombre_entidad ?? '').trim() !== 'Comisión Rectora - DNP';
  }

  vigencias: any[] = [];

  showDptos: boolean = false;
  showMpios: boolean = false;
  showEntidadesCR: boolean = false;
  showDetailInfo: boolean = false;

  urlTrimestralReport: string = "https://www.dnp.gov.co/LaEntidad_/subdireccion-general-inversiones-seguimiento-evaluacion/direccion-programacion-inversiones-publicas/Paginas/sistema-general-de-regalias.aspx#funveinticincoseis"
  urlCurrentReport: string = "https://colaboracion.dnp.gov.co/CDT/Inversiones%20y%20finanzas%20pblicas/Documentos%20GFT/Informe%20Trimestral%20de%20funcionamiento%20del%20SGR%20%C3%9Altimo%20Informe.pdf";
  detailReportXlsFile = "reporte-detalle-recaudo-2025.xlsx"
  managementReportXlsFile = "reporte-gestion-financiera-2025.xlsx"
  // URLs de datos locales para fallback (solo se usan si la API falla)
  private readonly funcionamientoDataUrl = "/assets/data/funcionamiento-base.json";
  private readonly funcionamientoDataEntitiesUrl = "/assets/data/funcionamiento-base-entities.json"


  // Variables para controlar los popups de diccionario y siglas
  showDiccionarioPopup: boolean = false;
  showSiglasPopup: boolean = false;
  diccionarioContent: string = '';
  siglasContent: string = '';

  DNP_CR = 'Departamento Nacional de Planeación - Comisión Rectora';
  DEPARTAMENTO = 'DEPARTAMENTO';
  MUNICIPIO = 'MUNICIPIO';

  /**
   * Utility method to handle TOTAL selection exclusion logic
   */
  private manejarSeleccionTOTAL(selecciones: any[], tipo: string): any[] {
    if (!selecciones || selecciones.length === 0) return [];
    
    const totalSeleccionado = selecciones.some((item: any) => item.label === "TOTAL");
    const otrasOpcionesSeleccionadas = selecciones.some((item: any) => item.label !== "TOTAL");

    if (totalSeleccionado && otrasOpcionesSeleccionadas) {
      // Si TOTAL está seleccionado junto con otras opciones, remover TOTAL
      const resultado = selecciones.filter((item: any) => item.label !== "TOTAL");
      return resultado;
    } else if (totalSeleccionado && !otrasOpcionesSeleccionadas) {
      // Si solo TOTAL está seleccionado, mantenerlo
      return [{ value: "0", label: "TOTAL" }];
    } else {
      // Si no hay TOTAL seleccionado, usar la selección tal como viene
      return selecciones;
    }
  }

  /**
   * Configurar visibilidad de controles de departamentos y municipios
   */
  private configurarVisibilidadDepartamentosMunicipios(): void {
    if (this.selectedBeneficiario.length === 1 && 
      this.selectedVigencia == this.vigencias[0] && // Solo mostrar en última vigencia
      this.selectedBeneficiario[0].label.trim() === "Departamentos") {
      this.showDptos = true;
      this.showMpios = false;
      this.showEntidadesCR = false;
      this.cargarEntidadesSiNecesario();
    } else if (this.selectedBeneficiario.length === 1 && this.selectedBeneficiario[0].label.trim() === "Municipios") {
      this.showDptos = true;
      this.showMpios = true;
      this.showEntidadesCR = false;
      this.cargarEntidadesSiNecesario();
    } else if (this.selectedBeneficiario.length === 1 && 
      this.selectedVigencia == this.vigencias[0] && // Solo mostrar en última vigencia
      this.selectedBeneficiario[0].label.trim() === this.DNP_CR) {
      this.showEntidadesCR = true;
      this.showDptos = false;
      this.showMpios = false;
      this.cargarEntidadesComisionRectora();
    }
    else {
      this.showDptos = false;
      this.showMpios = false;
      this.showEntidadesCR = false;
    }
  }

  /**
   * Cargar entidades desde archivo local si no están cargadas (fallback)
   */
  private cargarEntidadesSiNecesario(): void {
    if (this.funcionamientoDataEntities.length === 0) {
      fetch(this.funcionamientoDataEntitiesUrl)
        .then(response => response.json())
        .then(data => {
          this.funcionamientoDataEntities = data;
        })
        .catch(error => {
          console.error('Error cargando entidades:', error);
        });
    }
  }

  /**
   * Cargar entidades de la Comisión Rectora desde API si no están cargadas
   */
  private async cargarEntidadesComisionRectora(): Promise<void> {
    if (this.funcionamientoDataEntitiesCR.length === 0) {
      const entitiesCR = await this.sicodisApiService.getEntidadesComisionRectora().toPromise();
      this.funcionamientoDataEntitiesCR = entitiesCR || [];
    }
  }


  // Métrica resaltada por hover en las gráficas
  highlightedMetric: string | null = null;

  constructor(
    private sicodisApiService: SicodisApiService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.items = [
        { label: 'Reporte de administración y SSEC' }        
    ];

    this.home = { icon: 'pi pi-home', routerLink: '/' };
    
    this.cargarDatos().then(async () => {
      this.generarRegistroTotales();    
      this.cargarDatosTotalesInicial();
      
      if (isPlatformBrowser(this.platformId)) {
        this.initializeCharts();
      }

      // Cargar datos API en paralelo para optimizar rendimiento
      await this.cargarVigencias();
      await this.cargarDatosAPIIniciales();

      
      // Inicializar componentes de UI
      this.inicializarFuentesVacio();
      this.inicializarDepartamentos();

      // Si no selecciona nada → seleccionar TOTAL automáticamente
      if (!this.selectedFuente || this.selectedFuente.length === 0) {
        const total = this.fuentes.find((f: any) => f.label === 'TOTAL');
        if (total) {
          this.selectedFuente = [total];
          this.cargarConceptosDesdeFuentes();
          const totalConcepto = this.conceptos.find(c => c.label === 'TOTAL');
          if (totalConcepto) {
            this.selectedConcepto = [totalConcepto];
            this.cargarBeneficiariosDesdeConcetos();
            const totalBeneficiario = this.beneficiarios.find(c => c.label === 'TOTAL');
            if (totalBeneficiario){
              this.selectedBeneficiario = [totalBeneficiario];
            }
          }
        }
      }      
      // Cargar datos iniciales desde API
      if (this.selectedVigencia) {
        await this.cargarDistribucionTotalDesdeAPI();
        const config = this.vigenciasConfig[this.selectedVigencia.id];

        if (!config) {
          // Si la vigencia no existe, deja vacío o pon valores por defecto
          this.fechaActualizacion = '';
          this.fechaCorteRecaudo = '';
          return;
        }

        this.fechaActualizacion = config.actualizacion;
        this.fechaCorteRecaudo = config.corte;        
      } else {
        // Fallback a datos locales si no hay vigencia seleccionada
        this.cargarDatosTotalesInicial();
      }
    }).catch(error => {
      console.error('Error al cargar los datos iniciales:', error);
      // Inicializar con datos vacíos si falla la carga
      this.funcionamientoDataConTotales = [];
      this.inicializarFuentesVacio();
    });

    // Cargar datos de diccionario y siglas
    this.cargarSiglasDiccionario();
    
    this.initializeMenuItems();
  }

  menuItems: MenuItem[] = [];

  private initializeMenuItems() {
    this.menuItems = [
      {
        label: 'Históricos y Resumen',
        command: () => this.clickMenuItem('historico')
      },
      {
        label: 'Último Informe',
        
        command: () => this.clickMenuItem('ultimoInforme')
      }
    ];
  }

  clickMenuItem(option: string): void {
    if (option === 'historico') {
      window.open(this.urlTrimestralReport, '_blank');
    }else{
      window.open(this.urlCurrentReport, '_blank');
    }
  }

  /**
   * Cargar los datos de diccionario y siglas usando el servicio
   */
  async cargarSiglasDiccionario(): Promise<void> {
    try {
      const data = await this.sicodisApiService.funcionamientoSiglasDiccionario().toPromise();
      this.siglasDiccionarioData = data || null;
      //console.log('Datos de diccionario y siglas cargados desde servicio:', this.siglasDiccionarioData);
    } catch (error) {
      console.error('Error cargando datos de diccionario y siglas desde API:', error);
      this.siglasDiccionarioData = null;
    }
  }

  /**
   * Cargar las vigencias desde el servicio
   */
  async cargarVigencias(): Promise<void> {
    try {
      const vigencias = await this.sicodisApiService.getSgrFunVigencias().toPromise();
      this.vigencias = vigencias?.map((vigencia: any) => ({
        id: vigencia.id_vigencia,
        label: vigencia.vigencia
      })) || [];
      
      // Seleccionar la primera vigencia por defecto
      if (this.vigencias.length > 0) {
        this.selectedVigencia = this.vigencias[0];
      }
      
    } catch (error) {
      console.info('Usando vigencias por defecto. En producción, este endpoint deberá funcionar correctamente.');
      
      // Fallback a vigencias por defecto en caso de error CORS
      this.vigencias = [
        { id: 1, label: "2023 - 2024" },
        { id: 2, label: "2024 - 2025" },
        { id: 3, label: "2025 - 2026" }
      ];
      this.selectedVigencia = this.vigencias[2]; // Seleccionar la más reciente por defecto
      
    }
  }

  /**
   * Generar contenido HTML para el diccionario
   */
  private generarContenidoDiccionario(): string {
    if (!this.siglasDiccionarioData?.diccionario?.data) {
      return '<p>No se pudieron cargar los datos del diccionario.</p>';
    }

    let contenido = '<div style="font-size: 11px;"><table style="width: 100%; border-collapse: collapse;">';
    contenido += '<thead><tr style="background-color: #f8f9fa;"><th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; font-weight: bold;">Id </th><th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; font-weight: bold;">Concepto</th><th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; font-weight: bold;">Descripción</th></tr></thead>';
    contenido += '<tbody>';

    this.siglasDiccionarioData.diccionario.data.forEach((item: DiccionarioItem) => {
      contenido += `<tr>
        <td style="border: 1px solid #dee2e6; padding: 8px; vertical-align: top; font-weight: 100;"><strong>${item.id_concepto}</strong></td>
        <td style="border: 1px solid #dee2e6; padding: 8px; vertical-align: top; font-weight: 500;"><strong>${item.concepto}</strong></td>
        <td style="border: 1px solid #dee2e6; padding: 8px; vertical-align: top;">${item.descripcion}</td>
      </tr>`;
    });

    contenido += '</tbody></table></div>';
    return contenido;
  }

  /**
   * Generar contenido HTML para las siglas
   */
  private generarContenidoSiglas(): string {
    if (!this.siglasDiccionarioData?.siglas?.data) {
      return '<p>No se pudieron cargar los datos de las siglas.</p>';
    }

    let contenido = '<div style="font-size: 11px;"><table style="width: 100%; border-collapse: collapse;">';
    contenido += '<thead><tr style="background-color: #f8f9fa;"><th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; font-weight: bold;">Sigla</th><th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; font-weight: bold;">Descripción</th></tr></thead>';
    contenido += '<tbody>';

    this.siglasDiccionarioData.siglas.data.forEach((item: SiglasItem) => {
      contenido += `<tr>
        <td style="border: 1px solid #dee2e6; padding: 8px; vertical-align: top; font-weight: 500;"><strong>${item.sigla}</strong></td>
        <td style="border: 1px solid #dee2e6; padding: 8px; vertical-align: top;">${item.descripcion}</td>
      </tr>`;
    });

    contenido += '</tbody></table></div>';
    return contenido;
  }

  /**
   * Mostrar popup del diccionario
   */
  showPopupDiccionario(): void {
    this.diccionarioContent = this.generarContenidoDiccionario();
    this.showDiccionarioPopup = true;
  }

  /**
   * Mostrar popup de siglas
   */
  showPopupSiglas(): void {
    this.siglasContent = this.generarContenidoSiglas();
    this.showSiglasPopup = true;
  }

  /**
   * Cerrar popup del diccionario
   */
  closeDiccionarioPopup(): void {
    this.showDiccionarioPopup = false;
  }

  /**
   * Cerrar popup de siglas
   */
  closeSiglasPopup(): void {
    this.showSiglasPopup = false;
  }

  /**
   * Cargar los datos desde el archivo JSON
   */
  async cargarDatos(): Promise<void> {
    try {
      const response = await fetch(this.funcionamientoDataUrl);
      this.funcionamientoData = await response.json();
    } catch (error) {
      console.error('Error cargando datos de funcionamiento:', error);
      this.funcionamientoData = [];
    }
  }

  /**
   * Cargar datos totales al inicializar la pÃ¡gina
   */
  private cargarDatosTotalesInicial(): void {
    try {
      // Buscar el registro de totales
      const registroTotales = this.funcionamientoDataConTotales.find(item => item.id === "TOTAL");
      
      if (registroTotales) {
        
        // Establecer el registro de totales como registro actual
        this.registroActual = registroTotales;
        
        // Asegurar que las opciones TOTAL estén disponibles en todas las listas
        this.fuentes = [...this.fuentes.filter(f => f.value !== "TOTAL")];
        this.conceptos = [{ value: "0", label: "TOTAL" }];
        this.beneficiarios = [{ value: "0", label: "TOTAL" }];
        
        // Pre-seleccionar "TOTAL" en todos los filtros
        // this.selectedFuente = [{
        //   value: 0,
        //   label: "TOTAL"
        // }];

        // this.selectedConcepto = [{
        //   value: "0",
        //   label: "TOTAL"
        // }];

        this.selectedBeneficiario = [{
          value: "TOTAL",
          label: "TOTAL"
        }];

        // Actualizar los datos de las tarjetas con los totales
        this.actualizarDatosDelRegistro();
        
        // Actualizar gráficos después de un pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
          this.actualizarGraficos();
        }, 100);
        
      } else {
      }
      
    } catch (error) {
      console.error('Error cargando datos totales iniciales:', error);
    }
  }

  private generarRegistroTotales(): void {
    if (!this.funcionamientoData || this.funcionamientoData.length === 0) {
      this.funcionamientoDataConTotales = [];
      return;
    }

    try {
      // Campos que se deben sumar
      const camposSuma = [
        'distribucion-presupuesto-corriente',
        'distribucion-otros',
        'total-asignado-bienio',
        'disponibilidad-inicial',
        'apropiacion-vigente',
        'recursos-bloqueados',
        'apropiacion-vigente-disponible',
        'iac-mayor-recaudo-saldos-y-reintegros',
        'iac-corriente',
        'iac-informadas',
        'caja-total',
        'cdp',
        'compromisos',
        'pagos',
        'saldo-por-comprometer',
        'caja-disponible',
        'saldo-disponible-a-pagos',
        'saldo-sin-afectacion'
      ];

      // Campos que se deben promediar (porcentajes)
      const camposPromedio = [
        'avance-iac-corriente',
        'ejecucion-a-compromisos'
      ];

      // Función para convertir string a número
      const convertirANumero = (valor: any): number => {
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
          // Eliminar puntos como separadores de miles y reemplazar comas por puntos para decimales
          const numeroLimpio = valor.replace(/\./g, '').replace(',', '.');
          const numero = parseFloat(numeroLimpio);
          return isNaN(numero) ? 0 : numero;
        }
        return 0;
      };

      // Función para convertir porcentaje string a número
      const convertirPorcentajeANumero = (valor: any): number => {
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
          // Remover el símbolo % y convertir
          const numeroLimpio = valor.replace('%', '').replace(',', '.');
          const numero = parseFloat(numeroLimpio);
          return isNaN(numero) ? 0 : numero;
        }
        return 0;
      };

      // Inicializar objeto de totales
      const registroTotales: any = {
        "cod-sgpr": "TOTAL",
        "cod-sicodis": "TOTAL",
        "id": "TOTAL",
        "fuente": "TOTAL",
        "concepto": "TOTAL",
        "beneficiario": "TOTAL",
        "acto-administrativo": "Consolidado Total"
      };

      // Calcular sumas
      camposSuma.forEach(campo => {
        const suma = this.funcionamientoData.reduce((total, registro) => {
          return total + convertirANumero(registro[campo]);
        }, 0);
        registroTotales[campo] = suma;
      });

      // Calcular promedios para porcentajes
      camposPromedio.forEach(campo => {
        const valoresValidos = this.funcionamientoData
          .map(registro => convertirPorcentajeANumero(registro[campo]))
          .filter(valor => !isNaN(valor) && valor !== 0);
        
        const promedio = valoresValidos.length > 0 
          ? valoresValidos.reduce((sum, val) => sum + val, 0) / valoresValidos.length 
          : 0;
        
        registroTotales[campo] = promedio;
      });

      // Agregar el registro de totales a los datos
      this.funcionamientoDataConTotales = [...this.funcionamientoData, registroTotales];
      
      
    } catch (error) {
      console.error('Error generando registro de totales:', error);
      this.funcionamientoDataConTotales = [...this.funcionamientoData];
    }
  }

  /**
   * Cargar datos API una sola vez al inicializar (método optimizado)
   */
  private async cargarDatosAPIIniciales(): Promise<void> {
    try {
      // Cargar fuentes desde el endpoint fuentes_asignaciones una sola vez
      const idVigencia = parseInt(this.selectedVigencia.id);
    
      this.fuentesAsignacionesAPI = await this.sicodisApiService.getFuentesAsignaciones(idVigencia).toPromise() || [];
    } catch (error) {
      this.fuentesAsignacionesAPI = [];
    }

    try {
      // Cargar departamentos desde el endpoint departamentos una sola vez
      this.departamentosAPI = await this.sicodisApiService.getDepartamentosFuncionamiento().toPromise() || [];
      //console.log('Departamentos API cargados:', this.departamentosAPI);
    } catch (error) {
      this.departamentosAPI = [];
    }
  }

  /**
   * Inicializar las opciones de fuentes sin seleccionar ninguna (método optimizado)
   */
  private inicializarFuentesVacio(): void {
    try {
      if (this.fuentesAsignacionesAPI && this.fuentesAsignacionesAPI.length > 0) {
        // Usar las fuentes de asignaciones del API ya cargadas
        const fuentesOrdenadas = this.fuentesAsignacionesAPI.sort((a, b) => a.fuente.localeCompare(b.fuente));
        this.fuentes = [
          ...fuentesOrdenadas.map((fuente: any) => ({
            value: fuente.id_fuente,
            label: fuente.fuente
          }))
        ];
        
      } else {
        // Fallback a datos locales si el API no tiene datos
        const fuentesUnicas = getFuentes(this.funcionamientoDataConTotales);
        this.fuentes = [
          { value: 0, label: "TOTAL" },
          ...fuentesUnicas.sort().map((fuente: any) => ({
            value: fuente, // En datos locales no tenemos ID, usar nombre
            label: fuente
          }))
        ];
        
      }
      
      // Inicializar los otros selects como vacíos
      //this.conceptos = [{ value: "0", label: "TOTAL" }];
      this.beneficiarios = [{ value: "0", label: "TOTAL" }];
      this.selectedFuente = [];
      this.selectedConcepto = [];
      this.selectedBeneficiario = [];
      this.registroActual = null;
      
      // Limpiar datos iniciales
      this.limpiarDatos();
      
    } catch (error) {
      console.error('Error inicializando fuentes:', error);
      this.fuentes = [];
      this.limpiarTodosDatos();
    }
  }

  // Resto de métodos actualizados para usar funcionamientoDataConTotales...

  /**
   * Evento cuando cambia la fuente seleccionada
   */
  onFuenteChange(event: MultiSelectChangeEvent): void {
    this.showDetailInfo = false;

    // --- Si ya estaba TOTAL y el usuario intenta desmarcarlo, no hacer nada ---
    if (
      (!event.value || event.value.length === 0) &&
      event.itemValue?.label === 'TOTAL'
    ) {
      // Restaurar TOTAL y salir sin hacer nada más
      setTimeout(() => {
        const total = this.fuentes.find((f: any) => f.label === 'TOTAL');
        this.selectedFuente = [total];
      });
      return;
    }

    // Si seleccionó TOTAL → dejar solo TOTAL
    if (event.itemValue.label === 'TOTAL') {
      this.selectedFuente = [event.itemValue];
    }
    // Si seleccionó otro y ya estaba TOTAL → quitar TOTAL
    else {
      this.selectedFuente = event.value.filter((f: any) => f.label !== 'TOTAL');
    }

    // Si selecciona todos los elementos excepto TOTAL → cambiar a TOTAL
    const totalFuentesDisponibles = this.fuentes.length;
    const totalSeleccionadas = this.selectedFuente.length;
    const incluyeTotal = this.selectedFuente.some((f: any) => f.label === 'TOTAL');

    if (!incluyeTotal && totalSeleccionadas === totalFuentesDisponibles - 1) {
      const total = this.fuentes.find((f: any) => f.label === 'TOTAL');
      this.selectedFuente = [total];
    }

    // Si no selecciona nada → seleccionar TOTAL automáticamente
    if (!this.selectedFuente || this.selectedFuente.length === 0) {
      const total = this.fuentes.find((f: any) => f.label === 'TOTAL');
      if (total) {
        this.selectedFuente = [total];
      }
    }

    this.hideOptionalSelect();

    try {
      // Limpiar selecciones dependientes
      this.selectedConcepto = [];
      this.selectedBeneficiario = [];
      this.beneficiarios = [];
      this.registroActual = null;
      this.limpiarDatos();

      if (!event.value || event.value.length === 0) {
        this.conceptos = [];
        return;
      }

      // Manejar la exclusión mutua con TOTAL
      /* this.selectedFuente = this.manejarSeleccionTOTAL(event.value, 'fuente');
      if (this.selectedFuente.length === 1 && this.selectedFuente[0].label === "TOTAL") {
        // Si solo TOTAL está seleccionado, configurar opciones dependientes
        this.conceptos = [{ value: "0", label: "TOTAL" }];
        this.beneficiarios = [{ value: "0", label: "TOTAL" }];
        this.cargarDatosTotalesInicial();
        return;
      } */

      // Obtener conceptos para todas las fuentes seleccionadas usando API
      this.cargarConceptosDesdeFuentes();
      const totalConcepto = this.conceptos.find(c => c.label === 'TOTAL');
      if (totalConcepto) {
            this.selectedConcepto = [totalConcepto];
      }
      // Llamar a la API para actualizar los datos con los nuevos filtros
      this.cargarDistribucionTotalDesdeAPI();
      
    } catch (error) {
      console.error('Error al cambiar fuente:', error);
      this.conceptos = [];
      this.limpiarDatos();
    }
  }

  /**
   * Filtra conceptos que no cuentan con información para la vigencia seleccionada.
   * Caso conocido: para la asignación "Fiscalización" en la vigencia 2013 - 2014 solo el
   * concepto "Fiscalización" tiene datos; se ocultan del selector "Formulación, articulación
   * y seguimiento", "Conocimiento y cartografía" y "Otros".
   */
  private filtrarConceptosSinDatos(conceptos: any[] | undefined): any[] {
    if (!conceptos) {
      return [];
    }

    const normalizar = (texto: string): string =>
      (texto ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();

    const esVigencia2013_2014 =
      this.selectedVigencia?.id === 2 ||
      normalizar(this.selectedVigencia?.label ?? '') === '2013 - 2014';

    if (!esVigencia2013_2014) {
      return conceptos;
    }

    return conceptos.filter((concepto: any) => {
      const esFiscalizacion = normalizar(concepto.fuente) === 'fiscalizacion';
      // De la asignación Fiscalización solo se conserva el concepto "Fiscalización".
      return !esFiscalizacion || normalizar(concepto.concepto) === 'fiscalizacion';
    });
  }

  /**
   * Obtiene los conceptos de las fuentes indicadas para la vigencia seleccionada.
   * Se usa el endpoint por vigencia porque `conceptos_fuentes/{ids}` ignora el filtro de
   * fuentes y devuelve todos los conceptos (p. ej. los de SSEC al elegir "Funcionamiento SGR").
   * Además se filtra por `id_fuente` en el cliente como salvaguarda.
   */
  private async obtenerConceptosDeFuentes(idsFuentes: number[]): Promise<ConceptoFuente[]> {
    const idsFuentesString = idsFuentes.join(',');
    const conceptos = this.selectedVigencia?.id
      ? await this.sicodisApiService.getConceptosFuentesVigencia(idsFuentesString, this.selectedVigencia.id).toPromise()
      : await this.sicodisApiService.getConceptosFuentes(idsFuentesString).toPromise();
    return (conceptos ?? []).filter(c => idsFuentes.includes(c.id_fuente));
  }

  /**
   * Cargar conceptos desde las fuentes seleccionadas usando API (optimizado)
   */
  private async cargarConceptosDesdeFuentes(): Promise<void> {
    try {
      // Usar los datos API ya cargados en lugar de hacer nueva llamada
      if (!this.fuentesAsignacionesAPI || this.fuentesAsignacionesAPI.length === 0) {
        this.usarConceptosLocales();
        return;
      }

      // Filtrar las fuentes seleccionadas para obtener sus IDs
      const idsFuentesSeleccionadas: number[] = [];
      this.selectedFuente.forEach((fuenteSeleccionada: any) => {
        if (fuenteSeleccionada.value !== "TOTAL") {
          // Si value es un número, usarlo directamente; si no, buscar por label
          if (typeof fuenteSeleccionada.value === 'number') {
            idsFuentesSeleccionadas.push(fuenteSeleccionada.value);
          } else {
            const fuenteEncontrada = this.fuentesAsignacionesAPI.find(f => f.fuente === fuenteSeleccionada.label);
            if (fuenteEncontrada) {
              idsFuentesSeleccionadas.push(fuenteEncontrada.id_fuente);
            }
          }
        }
      });

      if (idsFuentesSeleccionadas.length === 0) {
        this.conceptos = [{ value: "0", label: "TOTAL" }];
        return;
      }

      // Llamar al API con los IDs de fuentes separados por comas
      const conceptosFuentesApi = await this.obtenerConceptosDeFuentes(idsFuentesSeleccionadas);
      const conceptosFuentes = this.filtrarConceptosSinDatos(conceptosFuentesApi);

      if (conceptosFuentes && conceptosFuentes.length > 0) {
        // Usar conceptos del API ordenados alfabéticamente
        const conceptosOrdenados = conceptosFuentes.sort((a: any, b: any) => a.concepto.localeCompare(b.concepto));
        
        // Limpiar el mapa de fuente-concepto para las fuentes seleccionadas
        this.selectedFuente.forEach((fuente: any) => {
          if (fuente.value !== "TOTAL") {
            this.fuenteConceptoMap.delete(fuente.value.toString());
          }
        });
        
        // Construir el mapa fuente → conceptos
        this.selectedFuente.forEach((fuenteSeleccionada: any) => {
          if (fuenteSeleccionada.value !== "TOTAL") {
            const conceptosDeFuente = conceptosOrdenados.filter(
              (concepto: any) => concepto.id_fuente === fuenteSeleccionada.value
            );
            
            this.fuenteConceptoMap.set(fuenteSeleccionada.value.toString(), conceptosDeFuente.map(c => ({
              id: c.id_concepto,
              label: c.concepto,
              fuente_id: fuenteSeleccionada.value,
              fuente_label: fuenteSeleccionada.label
            })));
          }
        });
        
        this.conceptos = [
          { value: "0", label: "TOTAL" },
          ...conceptosOrdenados.map((concepto: any) => ({
            value: concepto.id_concepto,
            label: concepto.concepto
          }))
        ];
        
      } else {
        // Fallback a datos locales
        this.usarConceptosLocales();
        return;
      }
      
      // Los totales se calculan automáticamente via API cuando se cambian filtros
      
    } catch (error) {
      this.usarConceptosLocales();
    }
  }

  /**
   * Usar conceptos locales como fallback
   */
  private usarConceptosLocales(): void {
    let allConceptos: any[] = [];
    this.selectedFuente.forEach((fuente: any) => {
      if (fuente.label !== "TOTAL") {
        const conceptosUnicos = getConceptosByFuente(this.funcionamientoDataConTotales, fuente.label);
        allConceptos = [...allConceptos, ...conceptosUnicos];
      }
    });

    // Eliminar duplicados y agregar TOTAL
    const conceptosUnicos = [...new Set(allConceptos)];
    this.conceptos = [
      { value: "0", label: "TOTAL" },
      ...conceptosUnicos.sort().map((concepto: any) => ({
        value: concepto, // En datos locales no tenemos ID, usar nombre
        label: concepto
      }))
    ];
    
    
    // Los totales se calculan automáticamente via API cuando se cambian filtros
  }

  /**
   * Evento cuando cambia el concepto seleccionado
   */
  onConceptoChange(event: MultiSelectChangeEvent): void {
    this.showDetailInfo = false;

    // --- Si ya estaba TOTAL y el usuario intenta desmarcarlo, no hacer nada ---
    if (
      (!event.value || event.value.length === 0) &&
      event.itemValue?.label === 'TOTAL'
    ) {
      // Restaurar TOTAL y salir sin hacer nada más
      setTimeout(() => {
        const total = this.conceptos.find((f: any) => f.label === 'TOTAL');
        this.selectedConcepto = [total];
      });
      return;
    }

    // Si seleccionó TOTAL → dejar solo TOTAL
    if (event.itemValue.label === 'TOTAL') {
      this.selectedConcepto = [event.itemValue];
    }
    // Si seleccionó otro y ya estaba TOTAL → quitar TOTAL
    else {
      this.selectedConcepto = event.value.filter((f: any) => f.label !== 'TOTAL');
    }

    // Si selecciona todos los elementos excepto TOTAL → cambiar a TOTAL
    const totalConceptosDisponibles = this.conceptos.length;
    const totalSeleccionadas = this.selectedConcepto.length;
    const incluyeTotal = this.selectedConcepto.some((f: any) => f.label === 'TOTAL');

    if (!incluyeTotal && totalSeleccionadas === totalConceptosDisponibles - 1) {
      const total = this.conceptos.find((f: any) => f.label === 'TOTAL');
      this.selectedConcepto = [total];
    }

    // Si no selecciona nada → seleccionar TOTAL automáticamente
    if (!this.selectedConcepto || this.selectedConcepto.length === 0) {
      const total = this.conceptos.find((f: any) => f.label === 'TOTAL');
      if (total) {
        this.selectedConcepto = [total];
      }
    }

    this.hideOptionalSelect();

    try {
      // Limpiar selección de beneficiario
      this.selectedBeneficiario = [];
      this.registroActual = null;
      this.limpiarDatos();

      if (!this.selectedFuente || this.selectedFuente.length === 0 || 
          !event.value || event.value.length === 0) {
        this.beneficiarios = []; 
        return;
      }

      // Manejar la exclusión mutua con TOTAL
      //this.selectedConcepto = this.manejarSeleccionTOTAL(event.value, 'concepto');
      // if (this.selectedConcepto.length === 1 && this.selectedConcepto[0].label === "TOTAL") {
      //   // Si solo TOTAL está seleccionado, configurar opciones dependientes
      //   this.beneficiarios = [{ value: "0", label: "TOTAL" }];
      //   this.cargarDatosTotalesInicial();
      //   return;
      // }

      // Cargar beneficiarios (entidades) desde API usando conceptos seleccionados
      this.cargarBeneficiariosDesdeConcetos();
      
      // Llamar a la API para actualizar los datos con los nuevos filtros
      this.cargarDistribucionTotalDesdeAPI();
      
    } catch (error) {
      console.error('Error al cambiar concepto:', error);
      this.beneficiarios = [];
      this.limpiarDatos();
    }
  }

  /**
   * Cargar beneficiarios (entidades) desde conceptos seleccionados usando API (optimizado)
   */
  private async cargarBeneficiariosDesdeConcetos(): Promise<void> {
    try {
      // Usar los datos API ya cargados en lugar de hacer nueva llamada
      if (!this.fuentesAsignacionesAPI || this.fuentesAsignacionesAPI.length === 0) {
        this.usarBeneficiariosLocales();
        return;
      }

      // Obtener los IDs de las fuentes para poder obtener los conceptos con sus IDs
      const idsFuentesSeleccionadas: number[] = [];
      this.selectedFuente.forEach((fuenteSeleccionada: any) => {
        if (typeof fuenteSeleccionada.value === 'number') {
          idsFuentesSeleccionadas.push(fuenteSeleccionada.value);
        } else {
          const fuenteEncontrada = this.fuentesAsignacionesAPI.find(f => f.fuente === fuenteSeleccionada.label);
          if (fuenteEncontrada) {
            idsFuentesSeleccionadas.push(fuenteEncontrada.id_fuente);
          }
        }
      });

      if (idsFuentesSeleccionadas.length === 0) {
        this.beneficiarios = [{ value: "0", label: "TOTAL" }];
        return;
      }

      // Obtener los conceptos con sus IDs
      const conceptosFuentes = await this.obtenerConceptosDeFuentes(idsFuentesSeleccionadas);

      if (!conceptosFuentes || conceptosFuentes.length === 0) {
        this.usarBeneficiariosLocales();
        return;
      }

      // Filtrar los conceptos seleccionados para obtener sus IDs
      const idsConceptosSeleccionados: number[] = [];
      this.selectedConcepto.forEach((conceptoSeleccionado: any) => {
        if (conceptoSeleccionado.value !== "TOTAL") {
          // Si value es un número, usarlo directamente; si no, buscar por label
          if (typeof conceptoSeleccionado.value === 'number') {
            idsConceptosSeleccionados.push(conceptoSeleccionado.value);
          } else {
            const conceptoEncontrado = conceptosFuentes.find((c: any) => c.concepto === conceptoSeleccionado.label);
            if (conceptoEncontrado) {
              idsConceptosSeleccionados.push(conceptoEncontrado.id_concepto);
            }
          }
        }
      });

      if (idsConceptosSeleccionados.length === 0) {
        this.beneficiarios = [{ value: "0", label: "TOTAL" }];
        return;
      }

      // Cargar entidades para cada concepto seleccionado
      const todasLasEntidades: any[] = [];
      for (const idConcepto of idsConceptosSeleccionados) {
        try {
          const entidadesConcepto = await this.sicodisApiService.getEntidadesConceptosVigencia(idConcepto, this.selectedVigencia.id).toPromise();
          if (entidadesConcepto && entidadesConcepto.length > 0) {
            todasLasEntidades.push(...entidadesConcepto);
          }
        } catch (error) {
          console.warn(`Error cargando entidades para concepto ${idConcepto}:`, error);
        }
      }

      if (todasLasEntidades.length > 0) {
        // Limpiar mapas anteriores
        this.conceptoBeneficiarioMap.clear();
        this.beneficiarioFuenteMap.clear();
        
        // Usar entidades del API como beneficiarios
        const beneficiariosMap = new Map();
        todasLasEntidades.forEach(e => {
          if (!beneficiariosMap.has(e.beneficiario)) {
            beneficiariosMap.set(e.beneficiario, e.codigo_entidad);
          }
        });
        
        // Construir el mapa concepto → beneficiarios y beneficiario → fuente
        for (const idConcepto of idsConceptosSeleccionados) {
          const entidadesDelConcepto = todasLasEntidades.filter(e => 
            // Filtrar entidades que pertenecen a este concepto específico
            true // Por ahora, asumimos que todas las entidades están asociadas a todos los conceptos
          );
          
          const beneficiariosDelConcepto = entidadesDelConcepto.map(e => ({
            id: e.codigo_entidad,
            label: e.beneficiario,
            concepto_id: idConcepto
          }));
          
          this.conceptoBeneficiarioMap.set(idConcepto.toString(), beneficiariosDelConcepto);
          
          // Encontrar la fuente correspondiente a este concepto
          let fuenteDelConcepto = null;
          for (const [fuenteId, conceptos] of this.fuenteConceptoMap.entries()) {
            if (conceptos.some(c => c.id === idConcepto)) {
              fuenteDelConcepto = fuenteId;
              break;
            }
          }
          
          // Asociar cada beneficiario con su fuente
          if (fuenteDelConcepto) {
            beneficiariosDelConcepto.forEach(beneficiario => {
              this.beneficiarioFuenteMap.set(beneficiario.id.toString(), fuenteDelConcepto);
            });
          }
        }
        
        const beneficiariosOrdenados = Array.from(beneficiariosMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0])); // Ordenar por nombre
        
        this.beneficiarios = [
          { value: "0", label: "TOTAL" },
          ...beneficiariosOrdenados.map(([nombre, codigo]) => ({
            value: codigo,
            label: nombre
          }))
        ];
        this.selectedBeneficiario = [{ value: "0", label: "TOTAL" }];
        
      } else {
        // Fallback a datos locales
        this.usarBeneficiariosLocales();
        return;
      }
      
      // Los totales se calculan automáticamente via API cuando se cambian filtros
      
    } catch (error) {
      console.warn('Error cargando beneficiarios desde API, usando datos locales:', error);
      this.usarBeneficiariosLocales();
    }
  }

  /**
   * Usar beneficiarios locales como fallback
   */
  private usarBeneficiariosLocales(): void {
    let allBeneficiarios: any[] = [];
    this.selectedFuente.forEach((fuente: any) => {
      this.selectedConcepto.forEach((concepto: any) => {
        if (fuente.label !== "TOTAL" && concepto.label !== "TOTAL") {
          const beneficiariosUnicos = getBeneficiariosByFuenteAndConcepto(
            this.funcionamientoDataConTotales, 
            fuente.label, 
            concepto.label
          );
          allBeneficiarios = [...allBeneficiarios, ...beneficiariosUnicos];
        }
      });
    });

    // Eliminar duplicados y agregar TOTAL
    const beneficiariosUnicos = [...new Set(allBeneficiarios)];
    this.beneficiarios = [
      { value: "0", label: "TOTAL" },
      ...beneficiariosUnicos.sort().map((beneficiario: any) => ({
        value: beneficiario, // En datos locales no tenemos ID, usar nombre
        label: beneficiario
      }))
    ];
    
    
    // Los totales se calculan automáticamente via API cuando se cambian filtros
  }

  /**
   * Inicializar departamentos usando API o fallback local
   */
  private inicializarDepartamentos(): void {
    try {
      if (this.departamentosAPI && this.departamentosAPI.length > 0) {
        // Usar departamentos del API ya cargados
        this.departamentos = this.departamentosAPI
          .map(dpto => ({
            value: dpto.codigo_departamento,
            label: dpto.nombre_departamento
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        
      } else {
        // Fallback a datos locales si el API no tiene datos
        this.departamentos = departamentos.map(dpto => ({
          value: dpto.codigo,
          label: dpto.nombre
        })).sort((a, b) => a.label.localeCompare(b.label));
        
      }
    } catch (error) {
      console.error('Error inicializando departamentos:', error);
      // Fallback final a datos locales
      this.departamentos = departamentos.map(dpto => ({
        value: dpto.codigo,
        label: dpto.nombre
      })).sort((a, b) => a.label.localeCompare(b.label));
    }
  }
  
  onDepartamentoChange(event: SelectChangeEvent): void {
    let codDpto = event.value.value;
    if (event.value.value.length == 2)
     codDpto += "000";

    if (this.selectedBeneficiario.length === 1 && this.selectedBeneficiario[0].label.trim() === "Municipios") {
      // Al cambiar de departamento, los municipios seleccionados dejan de ser válidos:
      // limpiar selección y la comparación previa.
      this.selectedMunicipio = [];
      this.distribucionTotalMultiple = [];
      this.detailChartData = null;
      this.showDetailInfo = false;
      // Cargar municipios usando API
      this.cargarMunicipiosPorDepartamento(event.value.value);
    }else{
      // Llamar a la API para actualizar los datos con los nuevos filtros
      this.cargarDistribucionTotalDesdeAPI();
    }
  }

  async onEntidadCRChange(event: any): Promise<void> {
    // Actualizar la bandera que indica si hay una entidad CR seleccionada
    this.isEntidadCRSelected = this.selectedEntidadCR !== null && this.selectedEntidadCR !== undefined;
    // Llamar a la API para actualizar los datos con los nuevos filtros
    await this.cargarDistribucionTotalDesdeAPI();
    // Actualizar distribucionTotalMultiple con datos de la entidad CR seleccionada
    // para que la sección "Información adicional" muestre el detalle de la entidad, no del beneficiario
    if (this.selectedEntidadCR && this.distribucionTotal && this.distribucionTotal.length > 0) {
      const fuentePrincipal = this.distribucionTotal[0].nombre_fuente ?? (this.selectedFuente.length > 0 ? this.selectedFuente[0].label : 'N/A');
      this.distribucionTotalMultiple = this.distribucionTotal.map((registro: any) => ({
        ...registro,
        beneficiario_seleccionado: this.selectedEntidadCR.nombre_entidad,
        fuente_principal: fuentePrincipal
      }));
      this.actualizarGraficoDetalle();
    }
  }

  /**
   * Cargar municipios por departamento usando API con fallback local
   */
  private async cargarMunicipiosPorDepartamento(codigoDepartamento: string): Promise<void> {
    try {
      // Intentar cargar municipios desde API
      const municipiosAPI = await this.sicodisApiService.getMunicipiosPorDepartamento(codigoDepartamento).toPromise();
      
      if (municipiosAPI && municipiosAPI.length > 0) {
        // Usar municipios del API
        this.municipios = municipiosAPI
          .map((mpio: any) => ({
            value: mpio.codigo_municipio,
            label: mpio.nombre_municipio,
            'cod-sicodis': mpio.codigo_municipio
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));
        
      } else {
        // Fallback a datos locales
        this.usarMunicipiosLocales(codigoDepartamento);
      }
    } catch (error) {
      console.warn('Error cargando municipios desde API, usando datos locales:', error);
      this.usarMunicipiosLocales(codigoDepartamento);
    }
  }

  /**
   * Usar municipios locales como fallback
   */
  private usarMunicipiosLocales(codigoDepartamento: string): void {
    const codDpto = codigoDepartamento + "000";
    this.municipios = this.funcionamientoDataEntities
      .filter((entity: any) => entity["cod-sicodis"].startsWith(codigoDepartamento) && entity["cod-sicodis"] !== codDpto)
      .map((entity: any) => ({
        value: entity["cod-sicodis"],
        label: entity.nombre || entity["nombre-entidad"] || `Municipio ${entity["cod-sicodis"]}`,
        'cod-sicodis': entity["cod-sicodis"]
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    
  }

  async onMunicipioChange(event: MultiSelectChangeEvent): Promise<void> {
    // Salvaguarda: máximo 3 municipios para la comparación
    if (this.selectedMunicipio && this.selectedMunicipio.length > 3) {
      this.selectedMunicipio = this.selectedMunicipio.slice(0, 3);
    }

    // Actualizar las tarjetas superiores con el consolidado de los municipios seleccionados
    await this.cargarDistribucionTotalDesdeAPI();

    // Construir la comparación por municipio en la sección de detalle
    if (this.selectedMunicipio && this.selectedMunicipio.length > 0) {
      await this.cargarDistribucionTotalPorCadaMunicipio();
      this.showDetailInfo = true;
    } else {
      this.distribucionTotalMultiple = [];
      this.detailChartData = null;
      this.showDetailInfo = false;
    }
  }

  /**
   * Cargar la distribución total de cada municipio seleccionado (hasta 3) para poder
   * compararlos en la sección "Detalle del Registro Seleccionado".
   */
  private async cargarDistribucionTotalPorCadaMunicipio(): Promise<void> {
    try {
      this.distribucionTotalMultiple = [];

      for (const municipio of this.selectedMunicipio) {
        const params = this.construirParametrosAPIParaMunicipio(municipio);
        const distribucionMunicipio = await this.sicodisApiService.getDistribucionTotal(params).toPromise();

        if (distribucionMunicipio && distribucionMunicipio.length > 0) {
          const fuentePrincipal = distribucionMunicipio[0].nombre_fuente
            ?? (this.selectedFuente.length > 0 ? this.selectedFuente[0].label : 'N/A');

          const registros = distribucionMunicipio.map((registro: any) => ({
            ...registro,
            beneficiario_seleccionado: municipio.label,
            beneficiario_value: municipio.value,
            beneficiario_info: { label: municipio.label, value: municipio.value },
            fuente_asociada: fuentePrincipal,
            fuente_principal: fuentePrincipal ?? 'N/A'
          }));

          this.distribucionTotalMultiple.push(...registros);
        }
      }

      if (this.distribucionTotalMultiple.length > 0) {
        this.actualizarGraficoDetalle();
      } else {
        this.detailChartData = null;
      }
    } catch (error) {
      console.error('Error cargando distribución total por municipio:', error);
      this.detailChartData = null;
    }
  }

  /**
   * Construir parámetros API para un municipio específico (tipoEntidad = MUNICIPIO).
   */
  private construirParametrosAPIParaMunicipio(municipio: any): any {
    // Reutiliza la lógica de vigencia/fuentes/conceptos del helper de beneficiario
    const params = this.construirParametrosAPIParaBeneficiario({ value: municipio.value, label: 'Municipios' });
    // El helper limpia idsBeneficiario para tipo MUNICIPIO; aquí sí se requiere el código del municipio
    params.idsBeneficiario = municipio.value;
    params.tipoEntidad = this.MUNICIPIO;
    return params;
  }

  /**
   * Evento cuando cambia el beneficiario seleccionado
   */
  async onBeneficiarioChange(event: MultiSelectChangeEvent): Promise<void> {
    
    // --- Si ya estaba TOTAL y el usuario intenta desmarcarlo, no hacer nada ---
    if (
      (!event.value || event.value.length === 0) &&
      event.itemValue?.label === 'TOTAL'
    ) {
      // Restaurar TOTAL y salir sin hacer nada más
      setTimeout(() => {
        const total = this.conceptos.find((f: any) => f.label === 'TOTAL');
        this.selectedBeneficiario = [total];
      });
      return;
    }

    // Si seleccionó TOTAL → dejar solo TOTAL
    if (event.itemValue.label === 'TOTAL') {
      this.selectedBeneficiario = [event.itemValue];
    }
    // Si seleccionó otro y ya estaba TOTAL → quitar TOTAL
    else {
      this.selectedBeneficiario = event.value.filter((f: any) => f.label !== 'TOTAL');
    }

    try {
      // Si no hay asignaciones o conceptos seleccionados, no hacer nada
      if (!this.selectedFuente || this.selectedFuente.length === 0 || 
          !this.selectedConcepto || this.selectedConcepto.length === 0) {
        this.registroActual = null;
        this.limpiarDatos();
        this.showDetailInfo = false;
        return;
      }

      // CASO 1: No hay beneficiarios seleccionados
      // Calcular totales basado solo en asignaciones y conceptos
      if (!event.value || event.value.length === 0) {
        this.selectedBeneficiario = [];
        this.hideOptionalSelect();
        await this.cargarDistribucionTotalDesdeAPI();
        return;
      }

      // CASO 2: Manejo de exclusión mutua con TOTAL
      // this.selectedBeneficiario = this.manejarSeleccionTOTAL(event.value, 'beneficiario');
      
      if (this.selectedBeneficiario.length === 1 && this.selectedBeneficiario[0].label === "TOTAL") {
        // Si solo TOTAL está seleccionado, usar datos totales
        // this.cargarDatosTotalesInicial();
        // return;
      } else {
        // Configurar visibilidad de departamentos y municipios
        this.configurarVisibilidadDepartamentosMunicipios();
      }

      // CASO 3: Múltiples beneficiarios seleccionados (sin TOTAL)
      
      if (this.selectedBeneficiario.length > 0) {
        // Si hay más de un beneficiario seleccionado, llamar getDistribucionTotal por cada uno
        await this.cargarDistribucionTotalPorCadaBeneficiario();
      } 
      await this.cargarDistribucionTotalDesdeAPI();
      this.showDetailInfo = true;

    } catch (error) {
      console.error('Error al cambiar beneficiario:', error);
      this.limpiarDatos();
    }
  }


  /**
   * Evento cuando cambia la vigencia seleccionada
   */
  onVigenciaChange(event: SelectChangeEvent): void {
    this.clearFilters();
    this.selectedVigencia = event.value;
    
    this.showDetailInfo=false;

    this.hideOptionalSelect();
    
    const config = this.vigenciasConfig[this.selectedVigencia.id];

    if (!config) {
      // Si la vigencia no existe, deja vacío o pon valores por defecto
      this.fechaActualizacion = '';
      this.fechaCorteRecaudo = '';
      return;
    }

    this.fechaActualizacion = config.actualizacion;
    this.fechaCorteRecaudo = config.corte;

    // Cargar datos de distribución total desde API basado en la vigencia seleccionada
    this.cargarDatosAPIIniciales();    
    this.cargarDistribucionTotalDesdeAPI();    
  }

  /**
   * Cargar distribución total por cada beneficiario seleccionado
   */
  private async cargarDistribucionTotalPorCadaBeneficiario(): Promise<void> {
    try {
      this.distribucionTotalMultiple = [];

      // Deduplicar beneficiarios por su código (value) para no repetir tarjetas en el detalle
      const beneficiariosUnicos = this.selectedBeneficiario.filter(
        (beneficiario: any, indice: number, lista: any[]) =>
          lista.findIndex((b: any) => b.value === beneficiario.value) === indice
      );

      // Iterar por cada beneficiario seleccionado
      for (const beneficiario of beneficiariosUnicos) {
        if (beneficiario.value !== "TOTAL") {
          // Construir parámetros específicos para este beneficiario
          const params = this.construirParametrosAPIParaBeneficiario(beneficiario);
          
          
          // Llamar al API para este beneficiario específico
          const distribucionBeneficiario = await this.sicodisApiService.getDistribucionTotal(params).toPromise();
          
          if (distribucionBeneficiario && distribucionBeneficiario.length > 0) {
            // Obtener la fuente específica para este beneficiario
            //const fuenteDelBeneficiario = this.obtenerFuenteParaBeneficiario(beneficiario);
            const fuenteDelBeneficiario = distribucionBeneficiario[0].nombre_fuente ?? this.selectedFuente[0].label;
            
            // Agregar identificador del beneficiario y fuente correcta a cada registro
            const distribucionConBeneficiario = distribucionBeneficiario.map((registro: any) => ({
              ...registro,
              beneficiario_seleccionado: beneficiario.label,
              beneficiario_value: beneficiario.value,
              beneficiario_info: {
                label: beneficiario.label,
                value: beneficiario.value
              },
              fuente_asociada: fuenteDelBeneficiario,
              fuente_principal: fuenteDelBeneficiario ??  'N/A'
            }));
            
            this.distribucionTotalMultiple.push(...distribucionConBeneficiario);
          }
        }
      }
      
      if (this.distribucionTotalMultiple.length > 0) {
        // Usar el primer registro para actualizar la interfaz (comportamiento original)
        // this.actualizarInterfazConDatosAPI([this.distribucionTotalMultiple[0]]);
        // Actualizar gráfico de detalle con los datos Múltiples
        this.actualizarGraficoDetalle();
      } else {
        this.limpiarDatos();
        this.detailChartData = null;
      }
      
    } catch (error) {
      console.error('Error cargando distribución total por beneficiario:', error);
      this.limpiarDatos();
    }
  }

  /**
   * Obtener información de fuentes para un beneficiario específico
   * Usa los mapas de relación para determinar la fuente correcta
   */
  private obtenerFuenteParaBeneficiario(beneficiario: any): any {
    try {
      // Buscar la fuente asociada al beneficiario en el mapa
      const fuenteId = this.beneficiarioFuenteMap.get(beneficiario.value.toString());
      
      if (fuenteId) {
        // Encontrar la información completa de la fuente
        const fuenteCompleta = this.selectedFuente.find(f => f.value.toString() === fuenteId);
        if (fuenteCompleta) {
          return fuenteCompleta;
        }
      }
      
      // Si no se encuentra en el mapa, usar fallback
      if (this.selectedFuente && this.selectedFuente.length > 0) {
        return this.selectedFuente.find(f => f.value !== "TOTAL") || this.selectedFuente[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo fuente para beneficiario:', error);
      return this.selectedFuente ? this.selectedFuente.find(f => f.value !== "TOTAL") : null;
    }
  }

  /**
   * Construir parámetros API para un beneficiario específico
   */
  private construirParametrosAPIParaBeneficiario(beneficiario: any): any {
    const params: any = {};
    
    // 1. Vigencia (requerida)
    if (this.selectedVigencia && this.selectedVigencia.id) {
      params.idVigencia = this.selectedVigencia.id;
    } else {
      params.idVigencia = 0;
    }
    
    // 2. Fuentes (idsFuente separadas por comas)
    if (this.selectedFuente && this.selectedFuente.length > 0 && !this.selectedFuente.some(f => f.value === "TOTAL")) {
      const idsFuentes: (string | number)[] = [];
      this.selectedFuente.forEach((fuenteSeleccionada: any) => {
        if (fuenteSeleccionada.value !== "TOTAL") {
          idsFuentes.push(fuenteSeleccionada.value);
        }
      });
      
      if (idsFuentes.length > 0) {
        params.idsFuente = idsFuentes.join(',');
      } else {
        params.idsFuente = "0";
      }
    } else {
      params.idsFuente = "0";
    }
    
    // 3. Conceptos (idsConcepto separados por comas)
    if (this.selectedConcepto && this.selectedConcepto.length > 0 && !this.selectedConcepto.some(c => c.value === "TOTAL")) {
      const idsConceptos: (string | number)[] = [];
      this.selectedConcepto.forEach((conceptoSeleccionado: any) => {
        if (conceptoSeleccionado.value !== "TOTAL") {
          idsConceptos.push(conceptoSeleccionado.value);
        }
      });
      
      if (idsConceptos.length > 0) {
        params.idsConcepto = idsConceptos.join(',');
      } else {
        params.idsConcepto = "0";
      }
    } else {
      params.idsConcepto = "0";
    }
    
    // 4. Beneficiario específico (solo este beneficiario)
    if (beneficiario.value !== "TOTAL") {
      params.idsBeneficiario = beneficiario.value;
    } else {
      params.idsBeneficiario = "0";
    }
    
    // 5. Tipo de entidad
    params.tipoEntidad = this.determinarTipoEntidadParaBeneficiario(beneficiario);
    if (params.tipoEntidad === this.DEPARTAMENTO || params.tipoEntidad === this.MUNICIPIO) {
      params.idsBeneficiario = ""; 
    }
    return params;
  }

  /**
   * Determinar el tipo de entidad para un beneficiario específico
   */
  private determinarTipoEntidadParaBeneficiario(beneficiario: any): string {
    // Si beneficiario es "Departamentos"
    if (beneficiario.label.trim() === "Departamentos") {
      return this.DEPARTAMENTO;
    }
    
    // Si beneficiario es "Municipios"
    if (beneficiario.label.trim() === "Municipios") {
      return this.MUNICIPIO;
    }
    
    // En cualquier otro caso, vacío
    return "";
  }

  /**
   * Cargar distribución total desde API basado en los filtros seleccionados
   */
  private async cargarDistribucionTotalDesdeAPI(): Promise<void> {
    this.isLoadingData = true;
    
    try {
      // Construir parámetros para la API
      const params = this.construirParametrosAPI();      
      
      // Llamar al API
      this.distribucionTotal = await this.sicodisApiService.getDistribucionTotal(params).toPromise();
      
      if (this.distribucionTotal && this.distribucionTotal.length > 0) {
        // Usar datos del API para actualizar la interfaz
        this.actualizarInterfazConDatosAPI(this.distribucionTotal);
      } else {
        // Limpiar datos si no hay resultados
        this.limpiarDatos();
      }
      
    } catch (error) {
      console.error('Error cargando distribución total desde API:', error);
      // En caso de error, limpiar datos
      this.limpiarDatos();
    } finally {
      this.isLoadingData = false;
    }
  }

  /**
   * Construir parámetros para la API getDistribucionTotal basado en filtros seleccionados
   */
  private construirParametrosAPI(): any {
    const params: any = {};
    
    // 1. Vigencia (requerida)
    if (this.selectedVigencia && this.selectedVigencia.id) {
      params.idVigencia = this.selectedVigencia.id;
    } else {
      // Si no hay vigencia seleccionada, usar 0 como se especifica
      params.idVigencia = 0;
    }
    
    // 2. Fuentes (idsFuente separadas por comas)
    if (this.selectedFuente && this.selectedFuente.length > 0 && !this.selectedFuente.some(f => f.value === "TOTAL")) {
      // Obtener IDs de fuentes seleccionadas usando los values
      const idsFuentes: (string | number)[] = [];
      this.selectedFuente.forEach((fuenteSeleccionada: any) => {
        if (fuenteSeleccionada.value !== "TOTAL") {
          idsFuentes.push(fuenteSeleccionada.value);
        }
      });
      
      if (idsFuentes.length > 0) {
        params.idsFuente = idsFuentes.join(',');
      } else {
        params.idsFuente = "0";
      }
    } else {
      params.idsFuente = "0";
    }
    
    // 3. Conceptos (idsConcepto separados por comas)
    if (this.selectedConcepto && this.selectedConcepto.length > 0 && !this.selectedConcepto.some(c => c.value === "TOTAL")) {
      // Obtener IDs de conceptos seleccionados usando los values
      const idsConceptos: (string | number)[] = [];
      this.selectedConcepto.forEach((conceptoSeleccionado: any) => {
        if (conceptoSeleccionado.value !== "TOTAL") {
          idsConceptos.push(conceptoSeleccionado.value);
        }
      });
      
      if (idsConceptos.length > 0) {
        params.idsConcepto = idsConceptos.join(',');
      } else {
        params.idsConcepto = "0";
      }
    } else {
      params.idsConcepto = "0";
    }
    
    // 4. Beneficiarios (idsBeneficiario)
    // lógica especial para Municipios y Departamentos
    if (this.selectedBeneficiario && this.selectedBeneficiario.length === 1 &&
        this.selectedBeneficiario[0].label.trim() === "Municipios" &&
        this.selectedMunicipio && this.selectedMunicipio.length > 0) {
      // Si beneficiario es "Municipios" y hay municipios seleccionados (hasta 3),
      // usar los códigos de los municipios separados por comas
      params.idsBeneficiario = this.selectedMunicipio.map((m: any) => m.value).join(',');

    } else if (this.selectedBeneficiario && this.selectedBeneficiario.length === 1 &&
               this.selectedBeneficiario[0].label.trim() === "Departamentos" &&
               this.selectedDepartamento) {
      // Si beneficiario es "Departamentos" y hay departamento seleccionado, usar ID del departamento
      params.idsBeneficiario = this.selectedDepartamento.value;
      
    } else if (this.selectedBeneficiario && this.selectedBeneficiario.length === 1 && 
               this.selectedBeneficiario[0].label.trim() === this.DNP_CR &&
               this.selectedEntidadCR) {
      // Si beneficiario es DNP_CR y hay entidad CR seleccionada, usar ID de la entidad CR
      params.idsBeneficiario = this.selectedEntidadCR.codigo_entidad;
      
    }else if (this.selectedBeneficiario && this.selectedBeneficiario.length > 0 && !this.selectedBeneficiario.some(b => b.value === "TOTAL")) {
      // Para otros beneficiarios, usar los IDs de beneficiarios seleccionados
      const idsBeneficiarios: (string | number)[] = [];
      this.selectedBeneficiario.forEach((beneficiarioSeleccionado: any) => {
        if (beneficiarioSeleccionado.value !== "TOTAL") {
          idsBeneficiarios.push(beneficiarioSeleccionado.value);
        }
      });
      
      if (idsBeneficiarios.length > 0) {
        params.idsBeneficiario = idsBeneficiarios.join(',');
      } else {
        params.idsBeneficiario = "0";
      }
    } else {
      params.idsBeneficiario = "0";
    }
    
    // 5. Tipo de entidad
    params.tipoEntidad = this.determinarTipoEntidad();

    // 6. Si tipo de entidad es "", forzar idsBeneficiario a "" y validar si selectedBeneficiario es DEPARTAMENTO o MUNICIPIO

    if (this.selectedBeneficiario && this.selectedBeneficiario.length === 1 && this.selectedDepartamento == null &&
       (this.selectedMunicipio == null || this.selectedMunicipio.length === 0) &&
       (this.selectedBeneficiario[0].label.trim() === "Departamentos" || this.selectedBeneficiario[0].label.trim() === "Municipios")) {
       params.idsBeneficiario = "";
    }
    return params;
  }

  /**
   * Determinar el tipo de entidad basado en las selecciones actuales
   */
  private determinarTipoEntidad(): string {
    // Si beneficiario es "Departamentos" y se seleccionó un departamento
    if (this.selectedBeneficiario && this.selectedBeneficiario.length === 1 && 
        this.selectedBeneficiario[0].label.trim() === "Departamentos") {
      return this.DEPARTAMENTO;
    }
    
    // Si beneficiario es "Municipios" y se seleccionó un municipio
    if (this.selectedBeneficiario && this.selectedBeneficiario.length === 1 && 
        this.selectedBeneficiario[0].label.trim() === "Municipios") {
      return this.MUNICIPIO;
    }

    // Si beneficiario es DNP CR y se seleccionó al menos una entidad CR
   if (this.selectedBeneficiario && this.selectedBeneficiario.length === 1 && 
        this.selectedBeneficiario[0].label.trim() === this.DNP_CR &&
        this.selectedEntidadCR) {
      return "CR";
    }
    
    // En cualquier otro caso, vacío
    return "";
  }

  /**
   * Actualizar la interfaz con los datos recibidos del API
   */
  private actualizarInterfazConDatosAPI(datosAPI: any[]): void {
    try {
      // Si hay Múltiples registros, calcular totales
      let datosConsolidados: any = {};
      
      if (datosAPI.length === 1) {
        // Un solo registro
        datosConsolidados = datosAPI[0];
      } else {
        // Múltiples registros, consolidar
        datosConsolidados = this.consolidarDatosAPI(datosAPI);
      }
      
      // Establecer como registro actual
      this.registroActual = datosConsolidados;
      
      // Actualizar todos los componentes de la interfaz
      this.actualizarDatosDelRegistro();
      
      
    } catch (error) {
      console.error('Error actualizando interfaz con datos del API:', error);
    }
  }

  /**
   * Consolidar Múltiples registros del API en un solo objeto de totales
   */
  private consolidarDatosAPI(registros: any[]): any {
    const consolidado: any = {
      id: "API_CONSOLIDADO",
      vigencia: this.selectedVigencia?.label || "Vigencia Seleccionada"
    };
    
    // Campos numéricos que se suman
    const camposNumericos = [
      'distribucion_presupuesto_corriente',
      'distribucion_otros', 
      'total_asignado_bienio',
      'disponibilidad_inicial',
      'apropiacion_vigente',
      'recursos_bloqueados',
      'apropiacion_vigente_disponible',
      'iac_mr_saldos_reintegros',
      'iac_corriente',
      'iac_informadas',
      'caja_total',
      'cdp',
      'compromisos',
      'pagos',
      'saldo_por_comprometer',
      'caja_disponible',
      'saldo_disponible_a_pagos',
      'saldo_sin_afectacion'
    ];
    
    // Campos porcentuales que se promedian
    const camposPorcentuales = [
      'avance_iac_corriente',
      'pct_ejecucion_a_compromisos'
    ];
    
    // Sumar campos numéricos
    camposNumericos.forEach(campo => {
      consolidado[campo] = registros.reduce((total, registro) => {
        return total + (registro[campo] || 0);
      }, 0);
    });
    
    // Promediar campos porcentuales
    camposPorcentuales.forEach(campo => {
      const valoresValidos = registros
        .map(registro => registro[campo] || 0)
        .filter(valor => valor > 0);
      
      consolidado[campo] = valoresValidos.length > 0 
        ? valoresValidos.reduce((sum, val) => sum + val, 0) / valoresValidos.length 
        : 0;
    });
    
    return consolidado;
  }


  /**
   * Limpiar filtros
   */
  clearFilters(): void {

    // Limpiar todas las selecciones
    this.selectedVigencia = this.vigencias.length > 0 ? this.vigencias[0] : null;
    this.selectedFuente = [];
    this.selectedConcepto = [];
    this.selectedBeneficiario = [];
    this.municipios = [];
    this.registroActual = null;
    this.isEntidadCRSelected = false;
    this.hideOptionalSelect();    
    // Limpiar datos iniciales
    this.limpiarDatos();
    // Reinicializar las listas con TOTAL como opción
    this.inicializarFuentesVacio();    
    // Cargar datos desde API con filtros limpios
    this.cargarDistribucionTotalDesdeAPI();
  }

  onChartHover(metric: string): void {
    this.highlightedMetric = metric;
  }

  clearChartHighlight(): void {
    this.highlightedMetric = null;
  }

  /**
   * Actualizar los datos de las tarjetas con el registro seleccionado
   */
  private actualizarDatosDelRegistro(): void {
    if (!this.registroActual) return;

    try {
      // Convertir strings a números eliminando puntos y comas
      const convertirANumero = (valor: any): number => {
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
          return parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0;
        }
        return 0;
      };

      // Actualizar datos de presupuesto
      this.presupuestoData = {
        presupuestoAsignado: this.registroActual['total_asignado_bienio'] , // Full peso values
        disponibilidadInicial: convertirANumero(this.registroActual['disponibilidad_inicial']) ,
        recursosBloquedos: convertirANumero(this.registroActual['recursos_bloqueados']) ,
        presupuestoVigenteDisponible: convertirANumero(this.registroActual['apropiacion_vigente_disponible'])  // Full peso values
      };

      // Actualizar datos de ejecución
      this.ejecucionData = {
        cdp: convertirANumero(this.registroActual['cdp']) ,
        compromiso: convertirANumero(this.registroActual['compromisos']) ,
        pagos: convertirANumero(this.registroActual['pagos']) ,
        saldo_sin_afectacion: convertirANumero(this.registroActual['saldo_sin_afectacion'])  ,
        saldo_por_comprometer: convertirANumero(this.registroActual['saldo_por_comprometer'])     };

      // Actualizar datos de situación de caja
      this.situacionCajaData = {
        disponibilidadInicial: convertirANumero(this.registroActual['disponibilidad_inicial']) ,
        recaudo: convertirANumero(this.registroActual['iac_informadas']) ,
        cajaTotal: convertirANumero(this.registroActual['caja_total']) ,
        cajaDisponible: convertirANumero(this.registroActual['caja_disponible'])       };

      // Actualizar datos de avance de recaudo
      this.avanceRecaudoData = {
        presupuestoCorriente: convertirANumero(this.registroActual['distribucion_presupuesto_corriente']) ,
        iacCorriente: convertirANumero(this.registroActual['iac_corriente']) ,
        avance: convertirANumero(this.registroActual['avance_iac_corriente'] / 100),
        avanceIacPbc: convertirANumero(this.registroActual['avance_iac_pbc'] / 100),
      };


      // Actualizar gráficos con datos reales
      this.actualizarGraficos();
      this.actualizarGraficoDetalle();

    } catch (error) {
      console.error('Error actualizando datos del registro:', error);
    }
  }

  /**
   * Actualizar gráfico de detalle con datos de distribución
   */
  /**
   * Divide una etiqueta larga en varias líneas para que Chart.js la muestre en el eje
   * sin consumir demasiado ancho (lo que contraía la barra). Limita a un máximo de líneas
   * y agrega elipsis si el texto excede ese máximo.
   */
  private envolverEtiqueta(texto: string, maxCaracteres: number = 24, maxLineas: number = 3): string[] {
    const palabras = (texto ?? '').trim().split(/\s+/);
    const lineas: string[] = [];
    let actual = '';

    for (const palabra of palabras) {
      if (actual && (actual.length + 1 + palabra.length) > maxCaracteres) {
        lineas.push(actual);
        actual = palabra;
      } else {
        actual = actual ? `${actual} ${palabra}` : palabra;
      }
    }
    if (actual) {
      lineas.push(actual);
    }

    if (lineas.length > maxLineas) {
      const recortadas = lineas.slice(0, maxLineas);
      recortadas[maxLineas - 1] = recortadas[maxLineas - 1].replace(/\s*\S*$/, '') + '…';
      return recortadas;
    }
    return lineas.length > 0 ? lineas : [texto];
  }

  private actualizarGraficoDetalle(): void {
    try {
      // Determinar qué datos usar
      const datosParaGrafico = this.selectedBeneficiario.length > 0
        ? this.distribucionTotalMultiple
        : this.distribucionTotal;

      // Validar que haya datos
      if (!datosParaGrafico || datosParaGrafico.length === 0) {
        this.detailChartData = null;
        return;
      }

      // Convertir strings a números
      const convertirANumero = (valor: any): number => {
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
          return parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0;
        }
        return 0;
      };

      // Generar un chart data por cada registro
      this.detailChartData = datosParaGrafico.map((registro: any) => ({
        // El nombre del beneficiario ya se muestra en el detalle; se omite del eje Y
        // para que todas las gráficas compartan el mismo origen horizontal.
        labels: [''],
        datasets: [
          {
            label: 'Compromisos',
            data: [convertirANumero(registro.compromisos)],
            backgroundColor: '#E07800',
            borderColor: '#eb8006',
            borderWidth: 2,
            barThickness: 33,
            order: 1
          },
          {
            label: 'Presupuesto disponible',
            data: [convertirANumero(registro.apropiacion_vigente_disponible)],
            backgroundColor: '#fff',
            borderColor: '#eee',
            borderWidth: 2,
            barThickness: 35,
            order: 2
          }
        ]
      }));


    } catch (error) {
      console.error('Error actualizando gráfico de detalle:', error);
      this.detailChartData = null;
    }
  }

  private limpiarDatos(): void {
    this.presupuestoData = {
      presupuestoAsignado: 0,
      disponibilidadInicial: 0,
      recursosBloquedos: 0,
      presupuestoVigenteDisponible: 0
    };

    this.ejecucionData = {
      cdp: 0,
      compromiso: 0,
      pagos: 0,
      saldo_sin_afectacion: 0,
      saldo_por_comprometer: 0
    };

    this.situacionCajaData = {
      disponibilidadInicial: 0,
      recaudo: 0,
      cajaTotal: 0,
      cajaDisponible: 0
    };

    this.avanceRecaudoData = {
      presupuestoCorriente: 0,
      iacCorriente: 0,
      avance: 0,
      avanceIacPbc: 0
    };

    this.detailChartData = null;
  }

  private limpiarTodosDatos(): void {
    this.limpiarDatos();
    this.fuentes = [];
    this.conceptos = [];
    this.beneficiarios = [];
    
  }

  /**
 * Formats a large number in billions (thousands of millions) with Colombian notation
 * @param {number|string} number - The number to be formatted
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.includeSymbol=true] - Include currency symbol
 * @param {number} [options.decimalPlaces=1] - Decimal places to display
 * @returns {string} Formatted number string
 */
  formatMillions2(
    num: number,
    options: {
      includeSymbol?: boolean;
      decimalPlaces?: number;      
    } = {}
  ) {
    // Default options
    const {
      includeSymbol = false,
      decimalPlaces = 0,      
    } = options;

    // Convert to miles of millions
    const valueInMilesOfMillions = num ? num : 0;

    // Format the number
    const formattedValue = valueInMilesOfMillions.toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).replaceAll(',', 'temp').replaceAll('.', ',').replaceAll('temp', '.');

    // Build the result string
    let result = '';
    if (includeSymbol) result += '$ ';
    result += formattedValue;
    
    return result;
  }

  // Resto de métodos para gráficos y eventos de botones...
  private actualizarGraficos(): void {
    if (!this.registroActual) return;

    try {
      // Convertir valores a números
      const convertirANumero = (valor: any): number => {
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
          return parseFloat(valor.replace(/\./g, '').replace(',', '.')) || 0;
        }
        return 0;
      };

      // Actualizar gráfico de barras horizontales (Disponibilidad vs Ejecutado)
      const cdp = convertirANumero(this.registroActual['cdp']) ; // Full peso values
      let pagos = convertirANumero(this.registroActual['pagos']) ; // Full peso values
      const compromisoSinAfectacion = (convertirANumero(this.registroActual['compromisos']) ) - pagos;
      const saldoSinAfectacion = convertirANumero(this.registroActual['saldo_sin_afectacion']) ; // Full peso values
      const cdpSinAfectacion = (cdp-compromisoSinAfectacion-pagos) < 0 ? cdp - compromisoSinAfectacion : cdp - compromisoSinAfectacion - pagos;
      this.horizontalBarAfectacionData = {
        labels: [''],
        datasets: [
          {
            label: 'Pagos',
            backgroundColor: '#D9520A',
            borderColor: '#eae1e1',
            borderWidth: 1,
            data: [pagos],
            barThickness: 35
          },
          {
            label: ['Compromisos', 'por pagar'],
            backgroundColor: '#E07800',
            borderColor: '#eae1e1',
            borderWidth: 1,
            data: [compromisoSinAfectacion],
            barThickness: 35
          },
          {
            label: ['CDP por', 'comprometer'],
            backgroundColor: '#F0A500',
            borderColor: '#eae1e1',
            borderWidth: 1,
            data: [cdpSinAfectacion],
            barThickness: 35
          },
          {
            label: ['Saldo sin', 'afectación'],
            backgroundColor: '#eae1e1',
            borderColor: '#eae1e1',
            borderWidth: 1,
            data: [saldoSinAfectacion],
            barThickness: 35
          }          
        ]
      };

      // Actualizar gráfico de dona (Avance de ejecución)
      let compromiso = convertirANumero(this.registroActual['compromisos']) ; // Full peso values
      let presupuestoDisponible = convertirANumero(this.registroActual['apropiacion_vigente_disponible']) ; // Full peso values
            
      let compromisoPorcentaje = compromiso > 0 ? (compromiso / (presupuestoDisponible)) * 100 : 0;
      this.compromisoPorcentaje = compromisoPorcentaje.toFixed(1).replace('.', ',');
      this.donutAvanceEjecucionData = {
        labels: ['Compromiso', ['Presupuesto restante']],
        datasets: [
          {
            data: [compromiso, presupuestoDisponible - compromiso],
            backgroundColor: ['#E07800', '#eae1e1'],
            hoverBackgroundColor: ['#d77607', '#dfc4c4'],
            borderColor: '#eae6e1',
            borderWidth: 1,
          }
        ]
      };

      let cajaDisponible = convertirANumero(this.registroActual['caja_total']) ; // Full peso values
      this.hBarSituacionCajaData = {
        labels: [''],
        datasets: [
          {
            label: 'Pagos',
            data: [pagos],
            backgroundColor: '#D9520A',
            borderColor: '#eae1e1',
            borderWidth: 1,
            barThickness: 35
          },
          {
            label: 'Caja Disponible',
            data: [cajaDisponible - pagos],
            backgroundColor: '#eae1e1',
            borderColor: '#eae1e1',
            borderWidth: 1,
            barThickness: 35       
          }
        ]
      };

      const pbcValor = this.avanceRecaudoData.presupuestoCorriente * this.avanceRecaudoData.avanceIacPbc;

      this.hBarAvanceRecaudoData = {
        labels: [['Presupuesto' , 'Corriente'], 'PBC'],
        datasets: [
          {
            label: 'Recaudo Corriente',
            data: [this.avanceRecaudoData.iacCorriente, 0],
            backgroundColor: '#D74641',
            borderColor: '#eae1e1',
            borderWidth: 1,
            barThickness: 27
          },
          {
            label: 'PBC',
            data: [0, pbcValor],
            backgroundColor: '#8F2B2B',
            borderColor: '#eae1e1',
            borderWidth: 1,
            barThickness: 27
          },
          {
            label: 'Presupuesto Restante',
            data: [this.avanceRecaudoData.presupuestoCorriente - this.avanceRecaudoData.iacCorriente, this.avanceRecaudoData.presupuestoCorriente - pbcValor],
            backgroundColor: '#eae1e1',
            borderColor: '#eae1e1',
            borderWidth: 1,
            barThickness: 27
          }
        ],
      };
    } catch (error) {
      console.error('Error actualizando gráficos:', error);
    }
  }

  private initializeCharts(): void {
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
          ctx.fillStyle = ' #2c2d2f';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const text = chart.config.options.plugins.centerText.text();
          ctx.fillText(text, centerX, centerY);
          ctx.restore();
        }
      }
    };

    // Plugin para rotular el porcentaje de ejecución al final de la barra
    // en las gráficas del detalle del registro seleccionado.
    const barValueLabelsPlugin = {
      id: 'barValueLabels',
      afterDatasetsDraw: (chart: any) => {
        if (!chart.config.options.plugins?.barValueLabels?.display) {
          return;
        }
        const bar = chart.getDatasetMeta(0)?.data?.[0]; // dataset 0 = Compromisos
        if (!bar) {
          return;
        }
        const compromisos = Number(chart.data.datasets[0]?.data?.[0]) || 0;
        const disponible = Number(chart.data.datasets[1]?.data?.[0]) || 0;
        if (disponible <= 0) {
          return;
        }
        const porcentaje = (compromisos / disponible * 100).toFixed(1).replace('.', ',');
        const ctx = chart.ctx;
        ctx.save();
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#303135';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(porcentaje + '%', bar.x + 8, bar.y);
        ctx.restore();
      }
    };

    // Register the plugins globally
    if (typeof Chart !== 'undefined') {
      Chart.register(centerTextPlugin);
      Chart.register(barValueLabelsPlugin);
    }

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = '#303135';
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color') || '#dee2e6';

    // Opciones para gráfico de barras horizontales
    this.horizontalBarAfectacionOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: window.devicePixelRatio || 2,
      layout: {
        padding: {
          top: 4,
          bottom: 25,
          left: 4,
          right: 4
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            font: { size: 11 },
            boxWidth: 8,
            boxHeight: 25,
            padding: 5,
            textAlign: 'center',
            usePointStyle: false,
          }
        },
        title: {
          display: true,
          text: 'Afectación Presupuestal',
          color: '#262826',
          font: { size: 14, weight: 'bold' }
        },
        datalabels: {
          display: false
        },
        tooltip: {
          enabled: true,
          mode: 'point',
          intersect: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: textColor,
          borderWidth: 1,
          callbacks: {
            title: function(tooltipItems: any) {
              const label = tooltipItems[0].dataset.label;
              // Si el label es un array, unirlo con espacio en lugar de coma
              if (Array.isArray(label)) {
                return label.join(' ');
              }
              return label.replace(',', ' '); // Reemplazar coma por espacio para mejor legibilidad
            },
            label: function(tooltipItem: any) {
              const label = tooltipItem.dataset.label || '';
              const value = Math.ceil(tooltipItem.raw).toLocaleString('es-CO');
              return `${label}: ${value}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { 
            maxTicksLimit: 4,
            color: textColor, font: { size: 11 } 
          },
          grid: { color: surfaceBorder },
          stacked: true
        },
        y: {
          ticks: { color: textColor, font: { size: 11 } },
          grid: { color: surfaceBorder },
          stacked: true
        }
      },
      elements: {
        arc: {
          borderWidth: 2,
          borderColor: '#BBBBBB',
          hoverBorderWidth: 2,
          hoverBorderColor: '#BBBBBB'
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 2000,
        easing: 'easeOutQuart'
      },
      interaction: {
        mode: 'nearest',
        intersect: false,
        axis: 'r'
      }
    };
    const afectacionMetrics = ['pagos', null, null, 'saldo_sin_afectacion'];
    this.horizontalBarAfectacionOptions.onHover = (event: any, _activeElements: any[], chart: any) => {
      const elements = event.native
        ? chart.getElementsAtEventForMode(event.native, 'nearest', { intersect: true }, false)
        : [];
      if (elements.length > 0) {
        const metric = afectacionMetrics[elements[0].datasetIndex] ?? null;
        this.ngZone.run(() => metric ? this.onChartHover(metric) : this.clearChartHighlight());
      } else {
        this.ngZone.run(() => this.clearChartHighlight());
      }
    };

    this.hBarSituacionCajaOpts = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: window.devicePixelRatio || 2,
      layout: {
        padding: {
          top: 5,
          bottom: 5,
          left: 5,
          right: 5
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            font: { size: 11 },
            boxWidth: 20,
            padding: 8
          },
          maxWidth: 100,

        },
        title: {
          display: true,
          text: 'Situación de Caja',
          color: '#262826 ',
          font: { size: 14, weight: 'bold' }
        },
        datalabels: {
          display: false
        },        
        tooltip: {
          enabled: true,
          mode: 'index',
          position: 'nearest',
          intersect: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: textColor,
          borderWidth: 1,
          callbacks: {
            label: function(tooltipItem: any) {
              const label = tooltipItem.dataset.label || '';
              const value = Math.ceil(tooltipItem.raw).toLocaleString('es-CO');
              return `${label}: ${value}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { 
            maxTicksLimit: 6,
            color: textColor, font: { size: 11 }, 
            count: 3
          },
          grid: { color: surfaceBorder },
          stacked: true
        },
        y: {
          ticks: { color: textColor, font: { size: 11 } },
          grid: { color: surfaceBorder },
          stacked: true
        }
      },
      elements: {
        arc: {
          borderWidth: 2,
          borderColor: '#BBBBBB',
          hoverBorderWidth: 2,
          hoverBorderColor: '#BBBBBB'
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 2000,
        easing: 'easeOutQuart'
      },
      interaction: {
        mode: 'nearest',
        intersect: false,
        axis: 'r'
      }
    };
    const cajaMetrics = ['pagos', 'caja_disponible'];
    this.hBarSituacionCajaOpts.onHover = (event: any, _activeElements: any[], chart: any) => {
      const elements = event.native
        ? chart.getElementsAtEventForMode(event.native, 'nearest', { intersect: true }, false)
        : [];
      if (elements.length > 0) {
        const metric = cajaMetrics[elements[0].datasetIndex] ?? null;
        this.ngZone.run(() => metric ? this.onChartHover(metric) : this.clearChartHighlight());
      } else {
        this.ngZone.run(() => this.clearChartHighlight());
      }
    };

    // Opciones para gráficos de dona
    this.donutAvanceEjecucionOptions = {
      /*cutout: '60%',*/
      rotation: -90,
      circumference: 180,
      maintainAspectRatio: false,
      aspectRatio: 1.65,
      responsive: true,
      devicePixelRatio: window.devicePixelRatio || 2,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: textColor,
            font: { size: 11 }
          }
        },
        title: {
          display: true,
          text: 'Avance de Ejecución',
          color: '#262826',
          font: { size: 14, weight: 'bold' }
        },
        datalabels: {
          display: false
        },        
        tooltip: {
          mode: 'index',
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
            if (this.isLoadingData) return 'Cargando...';
            const value = this.compromisoPorcentaje;
            if (!value || value === 'Infinity' || value === 'NaN' || isNaN(parseFloat(value))) {
              return '0.0%';
            }
            return value + '%';
          }
        }
      },
      elements: {
        arc: {
          borderWidth: 2,
          borderColor: '#BBBBBB',
          hoverBorderWidth: 2,
          hoverBorderColor: '#BBBBBB'
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 2000,
        easing: 'easeOutQuart'
      },
      interaction: {
        mode: 'nearest',
        intersect: false,
        axis: 'r'
      }
    };
    const donutMetrics = ['compromiso', 'saldo_por_comprometer'];
    this.donutAvanceEjecucionOptions.onHover = (event: any, activeElements: any[]) => {
      if (activeElements.length > 0) {
        const metric = donutMetrics[activeElements[0].index] ?? null;
        this.ngZone.run(() => this.onChartHover(metric));
      } else {
        this.ngZone.run(() => this.clearChartHighlight());
      }
    };

    this.hBarAvanceRecaudoOptions = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 1.25,
      responsive: true,
      devicePixelRatio: window.devicePixelRatio || 2,
      scales: {
        x: {
          beginAtZero: true,
          stacked: true,
          ticks: {
            color: textColor,
            font: { size: 10 },
            callback: function(value: any) {
              return Math.round(value).toLocaleString('es-CO');
            },
            count: 4
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          stacked: true,
          ticks: {
            color: textColor,
            font: { size: 11 }
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: textColor,
            font: { size: 11 },
            boxWidth: 14,
            padding: 8
          }
        },
        title: {
          display: true,
          text: 'Avance de Recaudo',
          color: '#262826',
          font: { size: 14, weight: 'bold' }
        },
        datalabels: { 
          display: true,
          anchor: 'end',     // Se ancla al final de la barra
          align: 'right',    // Se posiciona hacia la derecha
          offset: 6,         // Separación del borde
          color: textColor,
          font: {
            weight: 'bold',
            size: 11
          },
          formatter: function(value : any, context: any) {
            // Mostrar solo en el último dataset del stack
            if (context.datasetIndex !== context.chart.data.datasets.length - 1) {
              return null;
            }

            const dataIndex = context.dataIndex;
            const datasets = context.chart.data.datasets;

            // Calcular el total de la barra sumando todos los datasets
            let total = 0;
            for (let i = 0; i < datasets.length; i++) {
              total += datasets[i].data[dataIndex] || 0;
            }

            // Calcular la suma de los valores comprometidos (todos excepto el último que es "Presupuesto Restante")
            let valorCompromiso = 0;
            for (let i = 0; i < datasets.length - 1; i++) {
              valorCompromiso += datasets[i].data[dataIndex] || 0;
            }

            // Calcular porcentaje
            const porcentaje = total > 0 ? (valorCompromiso / total) * 100 : 0;
            return porcentaje.toFixed(1) + '%';
          }
        },
        tooltip: {
          mode: 'index',
          position: 'nearest',      
          callbacks: {
            title: function(tooltipItems: any) {
              const label = tooltipItems[0].label;
              // Si el label es un array, unirlo con espacio en lugar de coma
              if (Array.isArray(label)) {
                return label.join(' ');
              }
              return label.replace(',', ' '); // Reemplazar coma por espacio para mejor legibilidad
            },
            label: function(tooltipItem: any) {
              const label = tooltipItem.dataset.label || '';
              if (tooltipItem.raw != 0){
                const value = Math.ceil(tooltipItem.raw).toLocaleString('es-CO');
                return `${label}: ${value}`;
              }else{
                return null;
              }
            }
          }
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart'
      }
    };
    const recaudoMetrics = ['iac_corriente', null];
    this.hBarAvanceRecaudoOptions.onHover = (event: any, _activeElements: any[], chart: any) => {
      const elements = event.native
        ? chart.getElementsAtEventForMode(event.native, 'nearest', { intersect: true }, false)
        : [];
      if (elements.length > 0) {
        const metric = recaudoMetrics[elements[0].datasetIndex] ?? null;
        this.ngZone.run(() => metric ? this.onChartHover(metric) : this.clearChartHighlight());
      } else {
        this.ngZone.run(() => this.clearChartHighlight());
      }
    };

    // Configurar opciones para el gráfico de detalle
    this.detailChartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: window.devicePixelRatio || 2,
      layout: {
        padding: {
          top: 6,
          bottom: 0,
          left: 8,
          right: 56
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            font: { size: 11 },
            boxWidth: 20,
            padding: 8
          }
        },
        title: {
          display: false
        },
        datalabels: {
          display: false
        },
        barValueLabels: {
          display: true
        },
        tooltip: {          
          mode: 'index',          
          callbacks: {
            // Sin título: la etiqueta del eje Y se eliminó porque el nombre del
            // beneficiario ya aparece en el detalle del registro.
            title: function() {
              return [];
            },
            label: function(tooltipItem: any) {
              const label = tooltipItem.dataset.label || '';
              const value = Math.ceil(tooltipItem.raw).toLocaleString('es-CO');
              return `${label}: ${value}`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: false,
          beginAtZero: true,
          ticks: {
            color: textColor,
            font: { size: 11 },
            callback: function(value: any) {
              return value.toLocaleString('es-CO');
            },
            count: 5
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          stacked: true,
          ticks: {
            display: false
          },
          border: {
            display: false
          },
          grid: {
            display: false
          }
        }
      }
    };

    // Inicializar gráficos con datos por defecto si hay registro actual
    if (this.registroActual) {
      this.actualizarGraficos();
    }
  }

  /**
 * Opens a URL in a new browser tab/window
 * @param url The URL to open (must include http/https protocol)
 * @param options Configuration options for the new window
 */
  openInNewTab(
    url: string,
    options: {
      /** Window target name */
      name?: string;
      /** Window features (like size, position, etc.) */
      features?: string;
      /** Whether to noopener for security (recommended true for external links) */
      noopener?: boolean;
      /** Whether to noreferrer for security */
      noreferrer?: boolean;
    } = {}
  ): Window | null {
    // Validate URL format
    if (!/^https?:\/\//i.test(url)) {
      console.error('Invalid URL format. Must include http:// or https:// protocol.');
      return null;
    }

    // Set default options
    const {
      name = '_blank',
      features = '',
      noopener = true,
      noreferrer = true
    } = options;

    // Build rel attribute for security
    const relParts = [];
    if (noopener) relParts.push('noopener');
    if (noreferrer) relParts.push('noreferrer');
    const rel = relParts.join(' ');

    // Create temporary anchor element for best practices
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = name;
    anchor.rel = rel;

    if (features) {
      anchor.setAttribute('data-features', features);
    }

    // Open the window
    const newWindow = window.open(url, name, features);

    // Security: Blank the original link
    anchor.href = 'about:blank';
    document.body.appendChild(anchor);
    document.body.removeChild(anchor);

    return newWindow;
  }

  /**
 * Downloads a file from the /assets/data/ directory
 * @param filename - Name of the file to download (including extension)
 * @param downloadName - Optional custom name for the downloaded file
 * @returns Promise that resolves when download is complete
 */
  async downloadAssetFile(
    filename: string,
    downloadName?: string
  ): Promise<void> {
    try {
      // Validate filename
      if (!filename || !filename.trim()) {
        throw new Error('Filename is required');
      }

      // Clean filename to prevent directory traversal
      const cleanFilename = filename.replace(/\.\.\//g, '').replace(/^\//, '');
      
      // Construct the full path (adjust if your assets are served differently)
      const filePath = `/assets/data/${cleanFilename}`;
      
      // Fetch the file
      const response = await fetch(filePath);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set download attribute with custom name or original filename
      link.setAttribute('download', downloadName || cleanFilename);
      
      // Append to DOM, trigger click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up by revoking the blob URL
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error; // Re-throw to allow error handling by caller
    }
  }


  // métodos de eventos de botones
  onDetalleGestionClick(): void {
    this.downloadAssetFile(this.managementReportXlsFile);
  }

  onDetalleRecaudoClick(): void {
    this.downloadAssetFile(this.detailReportXlsFile);
  }

  onInformeTrimestraClick(): void {
    this.openInNewTab(this.urlTrimestralReport);
  }

  /**
   * Ocultar select de departamentos, municipios y entidades CR al cambiar beneficiario 
   * a una opción diferente de DNP CR, o al limpiar beneficiario
   */
  hideOptionalSelect(): void {
    this.showDptos = false;
    this.showMpios = false;
    this.showEntidadesCR = false;
    this.selectedDepartamento = null;
    this.selectedMunicipio = [];
    this.selectedEntidadCR = null;
    this.isEntidadCRSelected = false;
  }
}
