import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { FormsModule } from '@angular/forms';
import { InfoPopupComponent } from '../info-popup/info-popup.component';
import { NumberFormatPipe } from '../../utils/numberFormatPipe';
import { SicodisApiService, SgrResumenPtoRecaudoComparador, SgrPtoRecaudoItem, DepartamentoSgr, MunicipioSgp, SGRFechaActualizacionCorte, Vigencia } from '../../services/sicodis-api.service';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem, TreeNode } from 'primeng/api';
import { organizeCategoryData } from '../../utils/hierarchicalDataStructureV2';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-sgr-comparativo',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ChartModule,
    Select,
    FloatLabel,
    TableModule,
    TreeTableModule,
    FormsModule,
    InfoPopupComponent,
    NumberFormatPipe,
    Breadcrumb,
    TooltipModule,
    ProgressSpinner
  ],
  templateUrl: './sgr-comparativo.component.html',
  styleUrl: './sgr-comparativo.component.scss'
})
export class SgrComparativoComponent implements OnInit {

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  // Popups
  showDiccionarioPopup: boolean = false;
  showSiglasPopup: boolean = false;
  diccionarioContent: string = '';
  siglasContent: string = '';


  // Fechas de actualización y corte de recaudo (tomadas del API por vigencia)
  fechaActualizacion: string = '';
  fechaCorteRecaudo: string = '';

  // Filtros
  selectedBienio: any = null;
  selectedDepartamento: any = null;
  selectedMunicipio: any = null;
  selectedDepartamento2: any = null;
  selectedMunicipio2: any = null;

  // Opciones de filtros (bienios cargados desde el API, como en presupuesto-y-recaudo)
  bienios: any[] = [];

  departamentos: DepartamentoSgr[] = [];
  municipios: MunicipioSgp[] = [];
  municipios2: MunicipioSgp[] = [];

  // Chart data
  planBienalMunicipio1ChartData: any = {};
  planBienalMunicipio1ChartOptions: any = {};
  planBienalMunicipio2ChartData: any = {};
  planBienalMunicipio2ChartOptions: any = {};

  // Donut chart data for Plan Bienal view
  planBienalMunicipio1DirectasDonutData: any = {};
  planBienalMunicipio1LocalDonutData: any = {};
  planBienalMunicipio2DirectasDonutData: any = {};
  planBienalMunicipio2LocalDonutData: any = {};

  // Título del primer donut de "Detalle ingresos corrientes". Para gobernaciones
  // se suprime el sufijo "25%" (que solo aplica a las asignaciones directas de
  // municipios).
  municipio1PrimerDonutTitle: string = 'A. Directas 25%';
  municipio2PrimerDonutTitle: string = 'A. Directas 25%';

  // Título del segundo donut de "Detalle ingresos corrientes". Varía según el
  // tipo de entidad: "A. Directas anticipadas" (municipios) o "A. para la
  // Inversión Regional" (gobernaciones).
  municipio1SegundoDonutTitle: string = 'A. Directas anticipadas';
  municipio2SegundoDonutTitle: string = 'A. Directas anticipadas';
  donutChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 10,
          usePointStyle: true,
          font: { size: 10 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            const formatted = new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatted} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        display: false
      }
    }
  };

  // Table data
  municipality1TableData: TreeNode[] = [];
  municipality2TableData: TreeNode[] = [];
  consolidatedTableData: TreeNode[] = [];

  // Table columns
  tableCols: any[] = [];
  consolidatedTableCols: any[] = [];

  // Table view toggle
  showConsolidatedTable: boolean = false;

  // Indicador de carga mientras se consulta el comparativo (mejora la percepción
  // de "el filtro se demora" en bienios anteriores, cuyo endpoint es más lento).
  isLoading: boolean = false;

  // Paleta de colores para las barras de "fuentes" cuando se construye la gráfica
  // de forma genérica (bienios anteriores a 2017, con categorías distintas). El
  // orden respeta el aspecto de los bienios nuevos: naranja (A. Directas), verde
  // (Inversión), morado (FAE), magenta (FONPET) y colores adicionales de reserva.
  private readonly paletaFuentes = [
    { presColor: '#f38135ff', presBorder: '#be480eff', recColor: '#edb87cff', recBorder: '#8c5516' },
    { presColor: '#2f9e6f', presBorder: '#1c6647', recColor: '#8ed6bd', recBorder: '#4f9c81' },
    { presColor: '#6d28d9', presBorder: '#4c1d95', recColor: '#c4b5fd', recBorder: '#7c3aed' },
    { presColor: '#f33aafff', presBorder: '#b11049ff', recColor: '#7991e8ff', recBorder: '#3d4d7a' },
    { presColor: '#0ea5e9', presBorder: '#0369a1', recColor: '#7dd3fc', recBorder: '#0284c7' },
    { presColor: '#eab308', presBorder: '#a16207', recColor: '#fde047', recBorder: '#ca8a04' }
  ];

  constructor(private sicodisApiService: SicodisApiService) { }

  ngOnInit(): void {
    this.items = [
        { label: 'SGR', routerLink: '/sgr-inicio' },
        { label: 'Comparativo' }
    ];

    this.home = { icon: 'pi pi-home', routerLink: '/' };

    // Cargar bienios (vigencias) desde el API (misma fuente que presupuesto-y-recaudo)
    this.cargarBienios();

    // Cargar departamentos desde el API (misma fuente que presupuesto-y-recaudo)
    this.cargarDepartamentos();

    // Inicializar columnas de la tabla
    this.tableCols = [
      { field: 'concepto', header: 'Concepto', width: '30%', color: '#e4e6e8', class: 'col-standar', tooltip: 'Descripción de la categoría presupuestal' },
      { field: 'presupuesto_total_vigente', header: 'Presupuesto Total', width: '10%', color: '#e4e6e8', class: 'col-standar', tooltip: 'Suma total del presupuesto vigente (corriente + otros)' },
      { field: 'presupuesto_corriente', header: 'Presupuesto Corriente', width: '10%', color: '#e4e6e8', class: 'col-standar', tooltip: 'Monto presupuestado para ingresos corrientes' },
      { field: 'presupuesto_otros', header: 'Presupuesto Otros', width: '10%', color: '#e4e6e8', class: 'col-standar', tooltip: 'Montos presupuestados para otras fuentes de ingreso' },
      { field: 'caja_corriente_informada', header: 'Recaudo<br>Corriente', width: '10%', color: '#e4e6e8', class: 'col-standar', tooltip: 'Valores de recaudo reportados para los ingresos corrientes' },
      { field: 'caja_otros', header: 'Recaudo<br>Otros', width: '10%', color: '#e4e6e8', class: 'col-standar', tooltip: 'Valores de recaudo reportados para otros ingresos' },
      { field: 'caja_total', header: 'Recaudo<br>Total', width: '10%', color: '#e4e6e8', class: 'col-standar', tooltip: 'Valores de recaudo reportados para todos los ingresos' },
      { field: 'avance_iac_presupuesto', header: 'Avance IAC frente a Presupuesto', width: '10%', color: '#e4e6e8', class: 'col-standar', tooltip: 'Porcentaje de ejecución: (Recaudo Total / Presupuesto Corriente) * 100' }
    ];

    // Inicializar columnas de la tabla consolidada (se actualizarán con nombres de municipios)
    this.initializeConsolidatedTableColumns();
  }

  /**
   * Inicializar columnas para la tabla consolidada
   */
  private initializeConsolidatedTableColumns(): void {
    this.consolidatedTableCols = [
      {
        field: 'concepto',
        header: 'Concepto',
        colspan: 1,
        rowspan: 2,
        width: '20%',
        color: '#e4e6e8',
        class: 'col-concepto',
        tooltip: 'Descripción de la categoría presupuestal',
        isGroup: false
      },
      // Grupo: Presupuesto Total
      {
        field: 'presupuesto_total_group',
        header: 'Presupuesto Total',
        colspan: 2,
        rowspan: 1,
        color: '#d1e7dd',
        isGroup: true,
        subCols: [
          { field: 'presupuesto_total_vigente_m1', header: 'Municipio 1', width: '8%', color: '#e8f5e8', municipio: 1 },
          { field: 'presupuesto_total_vigente_m2', header: 'Municipio 2', width: '8%', color: '#e8f5e8', municipio: 2 }
        ]
      },
      // Grupo: Presupuesto Corriente
      {
        field: 'presupuesto_corriente_group',
        header: 'Presupuesto Corriente',
        colspan: 2,
        rowspan: 1,
        color: '#d1e7dd',
        isGroup: true,
        subCols: [
          { field: 'presupuesto_corriente_m1', header: 'Municipio 1', width: '8%', color: '#e8f5e8', municipio: 1 },
          { field: 'presupuesto_corriente_m2', header: 'Municipio 2', width: '8%', color: '#e8f5e8', municipio: 2 }
        ]
      },
      // Grupo: Presupuesto Otros
      {
        field: 'presupuesto_otros_group',
        header: 'Presupuesto Otros',
        colspan: 2,
        rowspan: 1,
        color: '#d1e7dd',
        isGroup: true,
        subCols: [
          { field: 'presupuesto_otros_m1', header: 'Municipio 1', width: '8%', color: '#e8f5e8', municipio: 1 },
          { field: 'presupuesto_otros_m2', header: 'Municipio 2', width: '8%', color: '#e8f5e8', municipio: 2 }
        ]
      },
      // Grupo: Recaudo Corriente
      {
        field: 'caja_corriente_group',
        header: 'Recaudo Corriente',
        colspan: 2,
        rowspan: 1,
        color: '#cfe2ff',
        isGroup: true,
        subCols: [
          { field: 'caja_corriente_informada_m1', header: 'Municipio 1', width: '8%', color: '#e3f2fd', municipio: 1 },
          { field: 'caja_corriente_informada_m2', header: 'Municipio 2', width: '8%', color: '#e3f2fd', municipio: 2 }
        ]
      },
      // Grupo: Recaudo Otros
      {
        field: 'caja_otros_group',
        header: 'Recaudo Otros',
        colspan: 2,
        rowspan: 1,
        color: '#cfe2ff',
        isGroup: true,
        subCols: [
          { field: 'caja_otros_m1', header: 'Municipio 1', width: '8%', color: '#e3f2fd', municipio: 1 },
          { field: 'caja_otros_m2', header: 'Municipio 2', width: '8%', color: '#e3f2fd', municipio: 2 }
        ]
      },
      // Grupo: Recaudo Total
      {
        field: 'caja_total_group',
        header: 'Recaudo Total',
        colspan: 2,
        rowspan: 1,
        color: '#cfe2ff',
        isGroup: true,
        subCols: [
          { field: 'caja_total_m1', header: 'Municipio 1', width: '8%', color: '#e3f2fd', municipio: 1 },
          { field: 'caja_total_m2', header: 'Municipio 2', width: '8%', color: '#e3f2fd', municipio: 2 }
        ]
      },
      // Grupo: Avance IAC
      {
        field: 'avance_iac_group',
        header: 'Avance IAC frente a Presupuesto',
        colspan: 2,
        rowspan: 1,
        color: '#fff3cd',
        isGroup: true,
        subCols: [
          { field: 'avance_iac_presupuesto_m1', header: 'Municipio 1', width: '8%', color: '#fff9e6', municipio: 1 },
          { field: 'avance_iac_presupuesto_m2', header: 'Municipio 2', width: '8%', color: '#fff9e6', municipio: 2 }
        ]
      }
    ];
  }

  /**
   * Obtener nombre del municipio seleccionado
   */
  getSelectedMunicipalityName(municipioNumber: number): string {
    if (municipioNumber === 1 && this.selectedMunicipio) {
      return this.selectedMunicipio.nombre;
    } else if (municipioNumber === 2 && this.selectedMunicipio2) {
      return this.selectedMunicipio2.nombre;
    }
    return `Municipio ${municipioNumber}`;
  }

  /**
   * Cargar la lista de bienios (vigencias) desde el API (misma fuente que
   * presupuesto-y-recaudo). Selecciona el primero por defecto y carga sus fechas.
   */
  private cargarBienios(): void {
    this.sicodisApiService.getSgrVigenciasQa().subscribe({
      next: (vigencias: Vigencia[]) => {
        this.bienios = (vigencias || []).map(vigencia => ({
          id: vigencia.id_vigencia,
          label: vigencia.vigencia
        }));

        if (this.bienios.length > 0) {
          this.selectedBienio = this.bienios[0];
          this.cargarFechasActualizacionCorte();
        }
      },
      error: (error) => {
        console.error('Error cargando bienios (vigencias):', error);
        this.bienios = [];
      }
    });
  }

  /**
   * Cargar las fechas de actualización y corte de recaudo del bienio seleccionado
   * (misma fuente que presupuesto-y-recaudo)
   */
  private cargarFechasActualizacionCorte(): void {
    const idVigencia = this.selectedBienio?.id;
    if (idVigencia === null || idVigencia === undefined) {
      return;
    }

    this.sicodisApiService.getSGRFechasActualizacionCorteRecaudoIACVigencia(idVigencia).subscribe({
      next: (data: SGRFechaActualizacionCorte[]) => {
        if (data && data.length > 0) {
          this.fechaActualizacion = data[0].fecha_actualizacion;
          this.fechaCorteRecaudo = data[0].fecha_corte_recaudo;
        }
      },
      error: (error) => {
        console.error('Error cargando fechas de actualización y corte:', error);
      }
    });
  }

  /**
   * Cargar los departamentos desde el API (misma fuente que presupuesto-y-recaudo)
   */
  private cargarDepartamentos(): void {
    this.sicodisApiService.getSgrDepartamentos().subscribe({
      next: (departamentos) => {
        console.log('Departamentos cargados:', departamentos);
        this.departamentos = departamentos || [];
      },
      error: (error) => {
        console.error('Error cargando departamentos:', error);
        this.departamentos = [];
      }
    });
  }

  /**
   * Alternar entre vista individual y consolidada
   */
  toggleTableView(): void {
    this.showConsolidatedTable = !this.showConsolidatedTable;

    if (this.showConsolidatedTable) {
      this.buildConsolidatedTable();
      this.updateConsolidatedHeaders();
    }
  }

  /**
   * Actualizar headers de la tabla consolidada con nombres reales de municipios
   */
  private updateConsolidatedHeaders(): void {
    const municipio1Name = this.getSelectedMunicipalityName(1);
    const municipio2Name = this.getSelectedMunicipalityName(2);

    this.consolidatedTableCols.forEach(col => {
      if (col.isGroup && col.subCols) {
        col.subCols.forEach((subCol: any) => {
          if (subCol.municipio === 1) {
            subCol.header = municipio1Name;
          } else if (subCol.municipio === 2) {
            subCol.header = municipio2Name;
          }
        });
      }
    });
  }

  /**
   * Construir tabla consolidada combinando datos de ambos municipios
   */
  private buildConsolidatedTable(): void {
    if (!this.municipality1TableData.length || !this.municipality2TableData.length) {
      console.warn('No hay datos para consolidar');
      return;
    }

    this.consolidatedTableData = this.mergeTableData(
      this.municipality1TableData,
      this.municipality2TableData
    );
  }

  /**
   * Combinar datos de dos tablas en una estructura consolidada
   */
  private mergeTableData(data1: TreeNode[], data2: TreeNode[]): TreeNode[] {
    const consolidated: TreeNode[] = [];

    // Iterar sobre los datos del municipio 1 (asumiendo que ambas tienen la misma estructura)
    data1.forEach((node1, index) => {
      const node2 = data2[index];

      if (!node2) return;

      const mergedNode: TreeNode = {
        data: {
          concepto: node1.data['concepto'],
          // Presupuesto Total
          presupuesto_total_vigente_m1: node1.data['presupuesto_total_vigente'],
          presupuesto_total_vigente_m2: node2.data['presupuesto_total_vigente'],
          // Presupuesto Corriente
          presupuesto_corriente_m1: node1.data['presupuesto_corriente'],
          presupuesto_corriente_m2: node2.data['presupuesto_corriente'],
          // Presupuesto Otros
          presupuesto_otros_m1: node1.data['presupuesto_otros'],
          presupuesto_otros_m2: node2.data['presupuesto_otros'],
          // Recaudo Corriente
          caja_corriente_informada_m1: node1.data['caja_corriente_informada'],
          caja_corriente_informada_m2: node2.data['caja_corriente_informada'],
          // Recaudo Otros
          caja_otros_m1: node1.data['caja_otros'],
          caja_otros_m2: node2.data['caja_otros'],
          // Recaudo Total
          caja_total_m1: node1.data['caja_total'],
          caja_total_m2: node2.data['caja_total'],
          // Avance IAC
          avance_iac_presupuesto_m1: node1.data['avance_iac_presupuesto'],
          avance_iac_presupuesto_m2: node2.data['avance_iac_presupuesto']
        },
        children: [],
        expanded: node1.expanded,
        leaf: node1.leaf
      };

      // Recursivamente procesar hijos si existen
      if (node1.children && node1.children.length > 0 && node2.children && node2.children.length > 0) {
        mergedNode.children = this.mergeTableData(node1.children, node2.children);
      }

      consolidated.push(mergedNode);
    });

    return consolidated;
  }

  /**
   * Al cambiar de vigencia (bienio) se aplican los filtros limpios, conservando
   * el bienio recién seleccionado y recargando sus fechas de actualización/corte.
   */
  onBienioChange(event: any): void {
    const bienioSeleccionado = this.selectedBienio;
    this.clearFilters();
    this.selectedBienio = bienioSeleccionado;
    this.cargarFechasActualizacionCorte();
    console.log('Bienio seleccionado:', bienioSeleccionado);
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this.selectedBienio = this.bienios.length > 0 ? this.bienios[0] : null;
    this.selectedDepartamento = null;
    this.selectedMunicipio = null;
    this.selectedDepartamento2 = null;
    this.selectedMunicipio2 = null;
    console.log('Filtros limpiados');
  }

  /**
   * Manejar cambio de departamento 1
   */
  onDepartmentChange(event: any): void {
    this.selectedMunicipio = null; // Limpiar municipio seleccionado
    this.loadTownsForDepartment(); // Cargar municipios del departamento seleccionado
    console.log('Departamento 1 seleccionado:', event.value);
  }

  /**
   * Manejar cambio de municipio 1
   */
  onMunicipioChange(event: any): void {
    console.log('Municipio 1 seleccionado:', event.value);
    this.updateMunicipios2List(); // Actualizar lista de municipios 2
    this.loadComparativeData();
  }

  /**
   * Manejar cambio de departamento 2
   */
  onDepartment2Change(event: any): void {
    this.selectedMunicipio2 = null; // Limpiar municipio seleccionado
    this.loadTownsForDepartment2(); // Cargar municipios del departamento seleccionado
    console.log('Departamento 2 seleccionado:', event.value);
  }

  /**
   * Manejar cambio de municipio 2
   */
  onMunicipio2Change(event: any): void {
    console.log('Municipio 2 seleccionado:', event.value);
    this.loadComparativeData();
  }

  /**
   * Cargar datos comparativos desde el API
   */
  private loadComparativeData(): void {
    if (!this.selectedBienio || !this.selectedMunicipio || !this.selectedMunicipio2) {
      console.log('Filtros incompletos, no se puede cargar datos comparativos');
      return;
    }

    const idVigencia = this.selectedBienio.id;
    const tipoConsulta1 = 7;
    const codigoEntidad1 = this.selectedMunicipio.codigo;
    const tipoConsulta2 = 7;
    const codigoEntidad2 = this.selectedMunicipio2.codigo;

    console.log('Cargando datos comparativos:', {
      idVigencia,
      tipoConsulta1,
      codigoEntidad1,
      tipoConsulta2,
      codigoEntidad2
    });

    // Limpiar la visualización previa antes de consultar. Evita que queden datos
    // obsoletos en pantalla cuando la nueva entidad/bienio no puede renderizarse
    // (causa reportada de "no se actualizan los datos").
    this.resetVisualizations();
    this.isLoading = true;

    this.sicodisApiService.getSgrResumenPtoRecaudoComparador(
      idVigencia,
      tipoConsulta1,
      codigoEntidad1,
      tipoConsulta2,
      codigoEntidad2
    ).subscribe({
      next: (data) => {
        console.log('Datos comparativos recibidos:', data);
        this.processComparativeData(data);
        // Si la vista consolidada está activa, reconstruirla con los datos nuevos.
        if (this.showConsolidatedTable) {
          this.buildConsolidatedTable();
          this.updateConsolidatedHeaders();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando datos comparativos:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Restablece las gráficas y tablas de ambas entidades a un estado vacío. Se
   * invoca antes de cada consulta para que nunca queden datos obsoletos cuando la
   * nueva selección no produce resultados o falla la petición.
   */
  private resetVisualizations(): void {
    this.planBienalMunicipio1ChartData = {};
    this.planBienalMunicipio2ChartData = {};
    this.planBienalMunicipio1DirectasDonutData = {};
    this.planBienalMunicipio1LocalDonutData = {};
    this.planBienalMunicipio2DirectasDonutData = {};
    this.planBienalMunicipio2LocalDonutData = {};
    this.municipality1TableData = [];
    this.municipality2TableData = [];
    this.consolidatedTableData = [];
  }

  /**
   * Descarga el archivo Excel de resumen presupuesto vs recaudo para las dos
   * entidades seleccionadas en la consulta comparativa (un archivo por entidad).
   */
  descargarComparativo(): void {
    if (!this.selectedBienio || !this.selectedMunicipio || !this.selectedMunicipio2) {
      console.warn('Filtros incompletos, no se puede descargar el comparativo');
      return;
    }

    this.descargarEntidad(this.selectedDepartamento, this.selectedMunicipio);
    this.descargarEntidad(this.selectedDepartamento2, this.selectedMunicipio2);
  }

  /**
   * Descarga el Excel de resumen presupuesto vs recaudo de una entidad. Reutiliza
   * el mismo endpoint de presupuesto-y-recaudo (tipoConsulta 7 para entidad).
   */
  private descargarEntidad(departamento: any, entidad: any): void {
    const idVigencia = this.selectedBienio.id;
    const tipoConsulta = '7';
    const codigoEntidad = entidad.codigo;
    const nombreDepartamento = departamento?.nombre ?? '';
    const nombreEntidad = entidad?.nombre ?? '';

    this.sicodisApiService.getSgrDescargaResumenPtoRecaudoQA(
      idVigencia,
      tipoConsulta,
      codigoEntidad,
      this.selectedBienio.label,
      nombreDepartamento,
      nombreEntidad,
      this.fechaActualizacion,
      this.fechaCorteRecaudo
    ).subscribe({
      next: (archivo: Blob) => {
        if (!archivo) {
          console.warn('No se recibió archivo para', nombreEntidad);
          return;
        }

        const excelBlob = new Blob([archivo], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const url = window.URL.createObjectURL(excelBlob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `ResumenPresupuestovsRecaudo_${nombreEntidad}.xlsx`;
        enlace.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error descargando el resumen de', nombreEntidad, error);
      }
    });
  }

  /**
   * Procesar datos comparativos del API
   */
  private processComparativeData(data: SgrResumenPtoRecaudoComparador): void {
    this.processEntityData(data.entidad1, 1);
    this.processEntityData(data.entidad2, 2);
  }

  /**
   * Procesar datos de una entidad
   */
  private processEntityData(entityData: SgrPtoRecaudoItem[], entityNumber: number): void {
    // La tabla usa una estructura genérica (organizeCategoryData) y sirve para
    // cualquier bienio, incluidos los anteriores a la reforma de 2017. Se construye
    // siempre, con independencia de que las gráficas puedan renderizarse o no.
    const tableData = this.buildTableData(entityData);
    if (entityNumber === 1) {
      this.municipality1TableData = tableData;
    } else {
      this.municipality2TableData = tableData;
    }

    const asignacionesDirectas = entityData.find(item =>
      item.categoria === '1.1'
    );

    const directas20 = entityData.find(item =>
      item.categoria === '1.1.1'
    );

    // Asignaciones Directas anticipadas (categoría 1.1.3). Las gobernaciones no
    // reciben este concepto, por lo que su presencia solo se exige a las demás
    // entidades (municipios, etc.).
    const directasAnticipadas = entityData.find(item =>
      item.categoria === '1.1.3'
    );

    // Asignación para la Inversión Local (categoría 1.3). Es opcional: algunas
    // entidades (p. ej. Medellín) no la reciben, por lo que no se exige su presencia.
    const inversionLocal = entityData.find(item =>
      item.categoria === '1.3'
    );

    // Asignación para la Inversión Regional (categoría 1.2). La reciben las
    // gobernaciones (no los municipios) y sustituye a la Inversión Local en sus
    // gráficas.
    const inversionRegional = entityData.find(item =>
      item.categoria === '1.2'
    );

    // FONPET (categoría 2.2): lo reciben todas las entidades.
    const ahorro = entityData.find(item =>
      item.categoria === '2.2'
    );

    // FAE - Fondo de Ahorro y Estabilización (categoría 2.1). Solo lo reciben las
    // gobernaciones, por lo que su presencia es opcional y solo se grafica cuando existe.
    const fae = entityData.find(item =>
      item.categoria === '2.1'
    );

    // Identifica si la entidad seleccionada es una gobernación siguiendo la
    // convención del proyecto (código termina en '000' y nombre "Gobernación de ").
    const entidadSeleccionada = entityNumber === 1 ? this.selectedMunicipio : this.selectedMunicipio2;
    const esGobernacion =
      !!entidadSeleccionada?.codigo?.endsWith('000') &&
      !!entidadSeleccionada?.nombre?.startsWith('Gobernación de ');

    // Los bienios anteriores a la reforma de 2017 tienen una estructura de
    // categorías distinta (no existen los desgloses 1.1.1 / 1.1.3 ni las
    // asignaciones para inversión local/regional). Cuando la estructura post-2017
    // no está completa se construyen las gráficas de forma genérica a partir de
    // las fuentes realmente disponibles, en lugar de dejar la vista en blanco.
    const estructuraNuevaCompleta =
      !!asignacionesDirectas && !!directas20 && (!!directasAnticipadas || esGobernacion) && !!ahorro;
    if (!estructuraNuevaCompleta) {
      this.buildGenericEntityCharts(entityData, entityNumber);
      return;
    }

    // Las gobernaciones muestran "A. para la Inversión Regional" (1.2) en lugar
    // de "A. para la Inversión Local" (1.3), tanto en la barra intermedia como en
    // el segundo donut de detalle de ingresos corrientes.
    const inversionLabel = esGobernacion ? 'A. para la Inversión Regional' : 'A. para la Inversión Local';
    const inversionItem = esGobernacion ? inversionRegional : inversionLocal;

    // Segundo donut de "Detalle ingresos corrientes":
    //  - Municipios: "A. para la Inversión Local" (1.3)
    //  - Gobernaciones: "A. para la Inversión Regional" (1.2)
    const segundoDonutItem = esGobernacion ? inversionRegional : inversionLocal;
    const segundoDonutTitle = esGobernacion ? 'A. para la Inversión Regional' : 'A. para la Inversión Local';

    // Primer donut: para gobernaciones se suprime el "25%" (aplica solo a las
    // asignaciones directas de municipios).
    const primerDonutTitle = esGobernacion ? 'A. Directas' : 'A. Directas 25%';

    // Grupos que conforman la gráfica de barras horizontal. Cada grupo aporta un par
    // de barras (Presupuesto y Recaudo) con su propio color. El FAE (2.1) solo se
    // incluye cuando la entidad lo recibe (gobernaciones). El ahorro se rotula
    // únicamente como "FONPET" (sin el prefijo "Ahorro").
    const gruposBarras: {
      label: string;
      item: SgrPtoRecaudoItem | undefined;
      presColor: string;
      presBorder: string;
      recColor: string;
      recBorder: string;
    }[] = [
      {
        label: 'A. Directas',
        item: asignacionesDirectas,
        presColor: '#f38135ff', presBorder: '#be480eff',
        recColor: '#edb87cff', recBorder: '#8c5516'
      },
      {
        label: inversionLabel,
        item: inversionItem,
        presColor: '#2f9e6f', presBorder: '#1c6647',
        recColor: '#8ed6bd', recBorder: '#4f9c81'
      }
    ];

    // FAE (solo gobernaciones que lo reciben)
    if (fae) {
      gruposBarras.push({
        label: 'FAE',
        item: fae,
        presColor: '#6d28d9', presBorder: '#4c1d95',
        recColor: '#c4b5fd', recBorder: '#7c3aed'
      });
    }

    // FONPET (siempre presente)
    gruposBarras.push({
      label: 'FONPET',
      item: ahorro,
      presColor: '#f33aafff', presBorder: '#b11049ff',
      recColor: '#7991e8ff', recBorder: '#3d4d7a'
    });

    const totalGrupos = gruposBarras.length;
    const chartLabels = gruposBarras.map(g => g.label);
    const chartDatasets: any[] = [];
    gruposBarras.forEach((grupo, indice) => {
      const dataPresupuesto = new Array(totalGrupos).fill(null);
      const dataRecaudo = new Array(totalGrupos).fill(null);
      dataPresupuesto[indice] = grupo.item ? grupo.item.presupuesto_total_vigente : null;
      dataRecaudo[indice] = grupo.item ? grupo.item.caja_total : null;

      chartDatasets.push({
        label: `Presupuesto - ${grupo.label}`,
        data: dataPresupuesto,
        backgroundColor: grupo.presColor,
        borderColor: grupo.presBorder,
        borderWidth: 1
      });
      chartDatasets.push({
        label: `Recaudo - ${grupo.label}`,
        data: dataRecaudo,
        backgroundColor: grupo.recColor,
        borderColor: grupo.recBorder,
        borderWidth: 1
      });
    });

    const chartData = {
      labels: chartLabels,
      datasets: chartDatasets
    };

    const chartOptions = this.buildBarChartOptions();

    if (entityNumber === 1) {
      this.planBienalMunicipio1ChartData = chartData;
      this.planBienalMunicipio1ChartOptions = chartOptions;

      this.planBienalMunicipio1DirectasDonutData = {
        labels: ['Presupuesto', 'Recaudo'],
        datasets: [{
          data: [asignacionesDirectas.presupuesto_corriente, asignacionesDirectas.caja_corriente_informada],
          backgroundColor: ['#f33aafff', '#7991e8ff'],
          borderColor: ['#b11049ff', '#3d4d7a'],
          borderWidth: 1
        }]
      };

      this.planBienalMunicipio1LocalDonutData = {
        labels: ['Presupuesto', 'Recaudo'],
        datasets: [{
          data: [segundoDonutItem?.presupuesto_corriente ?? null, segundoDonutItem?.caja_corriente_informada ?? null],
          backgroundColor: ['#f38135ff', '#edb87cff'],
          borderColor: ['#be480eff', '#8c5516'],
          borderWidth: 1
        }]
      };
      this.municipio1PrimerDonutTitle = primerDonutTitle;
      this.municipio1SegundoDonutTitle = segundoDonutTitle;
    } else {
      this.planBienalMunicipio2ChartData = chartData;
      this.planBienalMunicipio2ChartOptions = chartOptions;

      this.planBienalMunicipio2DirectasDonutData = {
        labels: ['Presupuesto', 'Recaudo'],
        datasets: [{
          data: [asignacionesDirectas.presupuesto_corriente, asignacionesDirectas.caja_corriente_informada],
          backgroundColor: ['#f33aafff', '#7991e8ff'],
          borderColor: ['#b11049ff', '#3d4d7a'],
          borderWidth: 1
        }]
      };

      this.planBienalMunicipio2LocalDonutData = {
        labels: ['Presupuesto', 'Recaudo'],
        datasets: [{
          data: [segundoDonutItem?.presupuesto_corriente ?? null, segundoDonutItem?.caja_corriente_informada ?? null],
          backgroundColor: ['#f38135ff', '#edb87cff'],
          borderColor: ['#be480eff', '#8c5516'],
          borderWidth: 1
        }]
      };
      this.municipio2PrimerDonutTitle = primerDonutTitle;
      this.municipio2SegundoDonutTitle = segundoDonutTitle;
    }
  }

  /**
   * Opciones de la gráfica de barras horizontal (Presupuesto vs Recaudo por
   * fuente). Compartidas por la ruta post-2017 y la ruta genérica de bienios
   * anteriores para mantener un aspecto idéntico.
   */
  private buildBarChartOptions(): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            padding: 15,
            usePointStyle: true,
            font: {
              size: 11
            }
          }
        },
        title: {
          display: false
        },
        datalabels: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || '';
              const value = context.parsed.x;
              const formatted = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value);
              return `${label}: ${formatted}`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            maxTicksLimit: 4,
            callback: (value: any) => {
              return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(value).replace('$', '');
            }
          }
        }
      }
    };
  }

  /**
   * Acorta los conceptos largos del API a las etiquetas usadas en la UF
   * ("Asignaciones Directas" → "A. Directas", "Asignación para la Inversión ..."
   * → "A. para la Inversión ..."). El resto de conceptos (FCR 40%, FONPET, etc.)
   * se conservan tal cual.
   */
  private acortarConcepto(concepto: string | undefined): string {
    return (concepto || '')
      .trim()
      .replace(/^Asignaciones\s+Directas/i, 'A. Directas')
      .replace(/^Asignación\s+para\s+la\s+Inversión/i, 'A. para la Inversión');
  }

  /**
   * Construye la gráfica de barras y las donas de "Detalle inversión ingresos
   * corrientes" de forma genérica, a partir de las fuentes realmente presentes en
   * los datos (categorías de un solo nivel de detalle: "1.1", "1.15", "2.2", ...).
   * Se usa para los bienios anteriores a 2017, cuya estructura de categorías no
   * coincide con la codificada para los bienios recientes.
   */
  private buildGenericEntityCharts(entityData: SgrPtoRecaudoItem[], entityNumber: number): void {
    // Fuentes: categorías con exactamente un punto bajo INVERSIÓN (1.x) o AHORRO
    // (2.x): "1.1", "1.15", "2.1", "2.2". Se excluyen los agregados sin punto
    // ("1", "2"), los totales ("-2", "-1"), los sub-desgloses de dos puntos
    // ("1.1.1") y la ADMINISTRACIÓN (3.x, p. ej. Funcionamiento), en línea con la
    // ruta curada de los bienios recientes, que tampoco grafica esos rubros.
    const fuentes = entityData.filter(item => /^[12]\.\d+$/.test((item.categoria || '').trim()));

    const gruposBarras = fuentes.map((item, idx) => {
      const color = this.paletaFuentes[idx % this.paletaFuentes.length];
      return { label: this.acortarConcepto(item.concepto), item, ...color };
    });

    const totalGrupos = gruposBarras.length;
    const chartLabels = gruposBarras.map(g => g.label);
    const chartDatasets: any[] = [];
    gruposBarras.forEach((grupo, indice) => {
      const dataPresupuesto = new Array(totalGrupos).fill(null);
      const dataRecaudo = new Array(totalGrupos).fill(null);
      dataPresupuesto[indice] = grupo.item ? grupo.item.presupuesto_total_vigente : null;
      dataRecaudo[indice] = grupo.item ? grupo.item.caja_total : null;

      chartDatasets.push({
        label: `Presupuesto - ${grupo.label}`,
        data: dataPresupuesto,
        backgroundColor: grupo.presColor,
        borderColor: grupo.presBorder,
        borderWidth: 1
      });
      chartDatasets.push({
        label: `Recaudo - ${grupo.label}`,
        data: dataRecaudo,
        backgroundColor: grupo.recColor,
        borderColor: grupo.recBorder,
        borderWidth: 1
      });
    });

    const chartData = { labels: chartLabels, datasets: chartDatasets };
    const chartOptions = this.buildBarChartOptions();

    // Donas de "Detalle inversión ingresos corrientes": las dos primeras fuentes
    // de INVERSIÓN (categorías que empiezan por "1.").
    const fuentesInversion = fuentes.filter(item => (item.categoria || '').trim().startsWith('1.'));
    const donut1 = fuentesInversion[0];
    const donut2 = fuentesInversion[1];

    const donut1Data = donut1 ? {
      labels: ['Presupuesto', 'Recaudo'],
      datasets: [{
        data: [donut1.presupuesto_corriente, donut1.caja_corriente_informada],
        backgroundColor: ['#f33aafff', '#7991e8ff'],
        borderColor: ['#b11049ff', '#3d4d7a'],
        borderWidth: 1
      }]
    } : {};

    const donut2Data = donut2 ? {
      labels: ['Presupuesto', 'Recaudo'],
      datasets: [{
        data: [donut2.presupuesto_corriente, donut2.caja_corriente_informada],
        backgroundColor: ['#f38135ff', '#edb87cff'],
        borderColor: ['#be480eff', '#8c5516'],
        borderWidth: 1
      }]
    } : {};

    const donut1Title = donut1 ? this.acortarConcepto(donut1.concepto) : '';
    const donut2Title = donut2 ? this.acortarConcepto(donut2.concepto) : '';

    if (entityNumber === 1) {
      this.planBienalMunicipio1ChartData = chartData;
      this.planBienalMunicipio1ChartOptions = chartOptions;
      this.planBienalMunicipio1DirectasDonutData = donut1Data;
      this.planBienalMunicipio1LocalDonutData = donut2Data;
      this.municipio1PrimerDonutTitle = donut1Title;
      this.municipio1SegundoDonutTitle = donut2Title;
    } else {
      this.planBienalMunicipio2ChartData = chartData;
      this.planBienalMunicipio2ChartOptions = chartOptions;
      this.planBienalMunicipio2DirectasDonutData = donut1Data;
      this.planBienalMunicipio2LocalDonutData = donut2Data;
      this.municipio2PrimerDonutTitle = donut1Title;
      this.municipio2SegundoDonutTitle = donut2Title;
    }
  }

  /**
   * Construir datos de tabla a partir de los datos de la entidad
   */
  private buildTableData(entityData: SgrPtoRecaudoItem[]): TreeNode[] {
    // Excluir la fila de concepto "TOTAL SGR (incluye aforado y no aforado)"
    const datosFiltrados = entityData.filter(
      item => item.concepto?.trim() !== 'TOTAL SGR (incluye aforado y no aforado)'
    );
    return organizeCategoryData(datosFiltrados);
  }

  /**
   * Carga los municipios para el departamento seleccionado
   */
  private loadTownsForDepartment(): void {
    if (!this.selectedDepartamento) {
      this.municipios = [];
      this.selectedMunicipio = null;
      return;
    }

    console.log('Cargando municipios para departamento:', this.selectedDepartamento.codigo);
    
    this.sicodisApiService.getMunicipiosDepartamentosSgr(this.selectedDepartamento.codigo).subscribe({
      next: (municipios) => {
        console.log('Municipios cargados:', municipios);
        this.municipios = this.aplicarFallbackBogota(this.selectedDepartamento, municipios);
        this.updateMunicipios2List();
      },
      error: (error) => {
        console.error('Error cargando municipios:', error);
        this.municipios = [];
      }
    });
  }

  /**
   * Carga los municipios para el segundo departamento seleccionado
   */
  private loadTownsForDepartment2(): void {
    if (!this.selectedDepartamento2) {
      this.municipios2 = [];
      this.selectedMunicipio2 = null;
      return;
    }

    console.log('Cargando municipios para departamento 2:', this.selectedDepartamento2.codigo);
    
    this.sicodisApiService.getMunicipiosDepartamentosSgr(this.selectedDepartamento2.codigo).subscribe({
      next: (municipios) => {
        console.log('Municipios 2 cargados:', municipios);
        this.municipios2 = this.aplicarFallbackBogota(this.selectedDepartamento2, municipios);
        this.updateMunicipios2List();
      },
      error: (error) => {
        console.error('Error cargando municipios 2:', error);
        this.municipios2 = [];
      }
    });
  }

  /**
   * Si el departamento es Bogotá D.C. (código 11) y el backend no retorna
   * municipios, se crea un único municipio con código "11001" y nombre "Bogotá D.C."
   */
  private aplicarFallbackBogota(departamento: any, municipios: MunicipioSgp[]): MunicipioSgp[] {
    if (departamento?.codigo === '11' && (!municipios || municipios.length === 0)) {
      return [{
        codigo: '11001',
        nombre: 'Bogotá D.C.'
      }];
    }
    return municipios || [];
  }

  /**
   * Actualiza la lista de municipios 2 para evitar duplicados
   */
  private updateMunicipios2List(): void {
    if (this.selectedMunicipio && this.selectedDepartamento?.codigo === this.selectedDepartamento2?.codigo) {
      // Si ambos departamentos son iguales, filtrar el municipio seleccionado en la lista 1
      this.municipios2 = this.municipios2.filter(municipio => municipio.codigo !== this.selectedMunicipio.codigo);
    }
  }

  /**
   * Mostrar popup del diccionario
   */
  showPopupDiccionario(): void {
    console.log('Mostrando diccionario de datos');
    this.diccionarioContent = this.generarContenidoDiccionario();
    this.showDiccionarioPopup = true;
  }

  /**
   * Mostrar popup de siglas
   */
  showPopupSiglas(): void {
    console.log('Mostrando siglas');
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
   * Generar contenido del diccionario
   */
  private generarContenidoDiccionario(): string {
    return `
      <div style="font-size: 11px; line-height: 1.6;">
        <h4 style="margin-bottom: 1rem; color: #333;">Diccionario de Conceptos - SGR Comparativo</h4>
        <ul style="list-style-type: none; padding: 0;">
          <li style="margin-bottom: 0.5rem;"><strong>Comparativo SGR:</strong> Análisis comparativo entre diferentes entidades territoriales</li>
          <li style="margin-bottom: 0.5rem;"><strong>Presupuesto y Recaudo:</strong> Comparación entre presupuestado y ejecutado</li>
          <li style="margin-bottom: 0.5rem;"><strong>Plan Bienal de Caja:</strong> Planificación financiera para el bienio</li>
          <li style="margin-bottom: 0.5rem;"><strong>Bienio:</strong> Período de dos años consecutivos para análisis</li>
          <li style="margin-bottom: 0.5rem;"><strong>Entidad Territorial:</strong> Departamento, distrito o municipio beneficiario</li>
          <li style="margin-bottom: 0.5rem;"><strong>Recaudo:</strong> Monto efectivamente recaudado de regalías</li>
        </ul>
      </div>
    `;
  }

  /**
   * Generar contenido de siglas
   */
  private generarContenidoSiglas(): string {
    return `
      <div style="font-size: 11px; line-height: 1.6;">
        <h4 style="margin-bottom: 1rem; color: #333;">Siglas y Abreviaciones</h4>
        <ul style="list-style-type: none; padding: 0;">
          <li style="margin-bottom: 0.5rem;"><strong>SGR:</strong> Sistema General de Regalías</li>
          <li style="margin-bottom: 0.5rem;"><strong>DNP:</strong> Departamento Nacional de Planeación</li>
          <li style="margin-bottom: 0.5rem;"><strong>PBC:</strong> Plan Bienal de Caja</li>
          <li style="margin-bottom: 0.5rem;"><strong>FAEP:</strong> Fondo de Ahorro y Estabilización Petrolera</li>
          <li style="margin-bottom: 0.5rem;"><strong>FONPET:</strong> Fondo Nacional de Pensiones de las Entidades Territoriales</li>
          <li style="margin-bottom: 0.5rem;"><strong>ANH:</strong> Agencia Nacional de Hidrocarburos</li>
          <li style="margin-bottom: 0.5rem;"><strong>ANM:</strong> Agencia Nacional de Minería</li>
          <li style="margin-bottom: 0.5rem;"><strong>SICODIS:</strong> Sistema de Consulta y Distribución</li>
        </ul>
      </div>
    `;
  }
}