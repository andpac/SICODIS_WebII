import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SicodisApiService } from '../../services/sicodis-api.service';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { Select, SelectChangeEvent } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';

import { departamentos } from '../../data/departamentos';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-pgn-regionalizacion-presupuesto-seguimiento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    ButtonModule,
    Select,
    FloatLabel,
    ProgressSpinnerModule,
    TableModule,
    Breadcrumb
  ],
  templateUrl: './pgn-regionalizacion-presupuesto-seguimiento.component.html',
  styleUrl: './pgn-regionalizacion-presupuesto-seguimiento.component.scss'
})
export class PgnRegionalizacionPresupuestoSeguimientoComponent implements OnInit {

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  // Filter properties
  selectedVigencia: any;
  selectedPeriodo: any;
  selectedRegion: any;
  selectedDepartamento: any;
  selectedFuente: any;

  // Loading state
  isLoading = false;

  // Data arrays
  vigencias: any[] = [];
  periodos: any[] = [];
  regiones: any[] = [];
  departamentos: any[] = [];
  fuentes: any[] = [];
  // Arreglos para el resultado
  resumen: any[] = [];
  detalle: any[] = [];

  // Summary data
  resumenData = {
    totalPresupuesto: 84464235000000,
    totalPorcentaje: 100,
    regionalizado: 63426071000000,
    regionalizadoPorcentaje: 76.9,
    nacional: 17962351000000,
    nacionalPorcentaje: 21.8,
    porRegionalizar: 1075813000000,
    porRegionalizarPorcentaje: 1.3
  };

  // Table data
  departamentosData: any[] = [];


  constructor(
    private sicodisApiService: SicodisApiService
  ) {}

  get resumenDataRegionalizacionSeguimiento() : any {
    return this.resumen.length > 0 ? this.resumen[0] : null;
  }


  async ngOnInit(): Promise<void> {
    this.items = [
        { label: 'PGN', routerLink: '/pgn-inicio' },
        { label: 'Regionalización Presupuesto Seguimiento' }
    ];

    this.home = { icon: 'pi pi-home', routerLink: '/' };

      // Cargar datos necesarios desde API para los filtros del formularios
    await this.cargarVigencias();
    await this.cargarPeriodos();
    await this.cargarRegiones();
    await this.cargarDepartamentos();
    await this.cargarFuentes();
    await this.cargarDatosSeguimiento();

  }


  /**
   * Cargar datos desde la API para inicializar el formulario
   */
  private async cargarVigencias(): Promise<void> {
    try {
      const vigencias = await this.sicodisApiService.getPgnVigencias().toPromise();
      this.vigencias = vigencias?.map((vigencia: any) => ({
        id: vigencia.id_vigencia,
        label: vigencia.vigencia
      })) || [];
      
      // Seleccionar la primera vigencia por defecto
      if (this.vigencias.length > 0) {
        this.selectedVigencia = this.vigencias[0];
        console.log('Vigencia seleccionada por defecto:', this.selectedVigencia);
      }
      
      console.log('Vigencias cargadas desde API:', this.vigencias);
    } catch (error) {
      console.warn('Error cargando vigencias desde API, se usarán datos locales como fallback:', error);
      this.vigencias = [];
    }
  }

  /**
   * Cargar datos desde la API para inicializar el formulario
   */
  private async cargarPeriodos(): Promise<void> {
    try {
      console.log('Vigencia seleccionado por defecto:', this.selectedVigencia);
      const periodos = await this.sicodisApiService.getPgnPeriodoPorVigencia(this.selectedVigencia.id).toPromise();
      this.periodos = periodos?.map((periodo: any) => ({
        id: periodo.id_periodo,
        label: periodo.periodo
      })) || [];
      
      // Seleccionar el primer periodo por defecto
      if (this.periodos.length > 0) {
        this.selectedPeriodo = this.periodos[0];
        console.log('Periodo seleccionado por defecto:', this.selectedPeriodo);
      }
      
      console.log('Periodos cargadas desde API:', this.periodos);
    } catch (error) {
      console.warn('Error cargando periodos desde API, se usarán datos locales como fallback:', error);
      this.periodos = [];
    }
  }


  /**
   * Cargar datos de las regiones desde la API para inicializar el formulario
   */
  private async cargarRegiones(): Promise<void> {
    try {
      console.log('Vigencia seleccionada por defecto:', this.selectedVigencia);
      console.log('Periodo seleccionado por defecto:', this.selectedPeriodo);

      const regiones = await this.sicodisApiService.getPgnRegionesPorVigenciaPeriodo(this.selectedVigencia.id, this.selectedPeriodo.id).toPromise();

      // Mapeamos los resultados
      this.regiones = regiones?.map((region: any) => ({
        id: region.codigo_region,
        label: region.region
      })) || [];

      // Se agrega la opción "0 - Todos" al inicio
      this.regiones.unshift({ id: '0', label: 'Todas' });

      // Seleccionamos "Todas" por defecto
      this.selectedRegion = this.regiones[0];

      console.log('Regiones cargados desde API:', this.regiones);
      console.log('Regiones seleccionado por defecto:', this.selectedRegion);

    } catch (error) {
      console.warn('Error cargando regiones desde API, se usarán datos locales como fallback:', error);
      this.regiones = [{ id: '0', label: 'Todos' }];
      this.selectedRegion = this.regiones[0];
    }
  }
  


  /**
   * Cargar datos de los departamentos desde la API para inicializar el formulario
   */
  private async cargarDepartamentos(): Promise<void> {
    try {
      console.log('Vigencia seleccionada por defecto:', this.selectedVigencia);
      console.log('Periodo seleccionado por defecto:', this.selectedPeriodo);
      console.log('Región seleccionada por defecto:', this.selectedRegion);

      const departamentos = await this.sicodisApiService.getPgnDepartamentosPorVigenciaPeriodoRegion(this.selectedVigencia.id, this.selectedPeriodo.id, this.selectedRegion.id).toPromise();

      // Mapeamos los resultados
      this.departamentos = departamentos?.map((departamento: any) => ({
        id: departamento.codigo_dane_depto,
        label: departamento.departamento
      })) || [];

      // Se agrega la opción "0 - Todos" al inicio
      this.departamentos.unshift({ id: '0', label: 'Todos' });

      // Seleccionamos "Todos" por defecto
      this.selectedDepartamento = this.departamentos[0];

      console.log('Departamentos cargados desde API:', this.departamentos);
      console.log('Departamento seleccionado por defecto:', this.selectedDepartamento);

    } catch (error) {
      console.warn('Error cargando departamentos desde API, se usarán datos locales como fallback:', error);
      this.departamentos = [{ id: '0', label: 'Todos' }];
      this.selectedDepartamento = this.departamentos[0];
    }
  }



  /**
   * Cargar datos de las fuentes desde la API para inicializar el formulario
   */
  private async cargarFuentes(): Promise<void> {
    try {
      console.log('Vigencia seleccionada por defecto:', this.selectedVigencia);
      console.log('Periodo seleccionado por defecto:', this.selectedPeriodo);

      const fuentes = await this.sicodisApiService.getPgnFuentesPorVigenciaPeriodo(this.selectedVigencia.id, this.selectedPeriodo.id).toPromise();

      // Mapeamos los resultados
      this.fuentes = fuentes?.map((fuente: any) => ({
        id: fuente.id_fuente,
        label: fuente.fuente
      })) || [];

      // Se agrega la opción "0 - Todos" al inicio
      this.fuentes.unshift({ id: '0', label: 'Todas' });

      // Seleccionamos "Todos" por defecto
      this.selectedFuente = this.fuentes[0];

      console.log('Fuentes cargados desde API:', this.fuentes);
      console.log('Fuentes seleccionado por defecto:', this.selectedFuente);

    } catch (error) {
      console.warn('Error cargando fuentes desde API, se usarán datos locales como fallback:', error);
      this.fuentes = [{ id: '0', label: 'Todos' }];
      this.selectedFuente = this.fuentes[0];
    }
  }



  /**
   * Cargar datos de resumen y detalle de los departamentos de regionalización PGN a partir de los filtros seleccionados
   */
  private async cargarDatosSeguimiento(): Promise<void> {
    try {
      console.log('Vigencia seleccionada por defecto:', this.selectedVigencia);
      console.log('Periodo seleccionado por defecto:', this.selectedPeriodo);
      console.log('Region seleccionado por defecto:', this.selectedRegion);
      console.log('Código Departamento  seleccionado por defecto:', this.selectedDepartamento);
      console.log('Fuente seleccionada por defecto:', this.selectedFuente);


    // const response = await this.sicodisApiService.getPgnDatosRegionalizacionPorVigenciaPeriodo( this.selectedVigencia.id,
    //                                                                                             this.selectedPeriodo.id,
    //                                                                                             this.selectedDepartamento.id,
    //                                                                                             this.selectedFuente.id
    //                                                                                           )
    //                                                                                           .toPromise();

    const response = await this.sicodisApiService.getPgnDatosSeguimientoPorVigenciaPeriodo( this.selectedVigencia.id,
                                                                                                this.selectedPeriodo.id,
                                                                                                this.selectedRegion.id,
                                                                                                this.selectedDepartamento.id,
                                                                                                this.selectedFuente.id
                                                                                              )
                                                                                              .toPromise();

      // Mapeamos los resultados
    this.resumen = response?.resumen || [];
    this.detalle = response?.detalle || [];
    

    console.log('Resumen recibido:', this.resumen);
    console.log('Detalle recibido:', this.detalle);


    } catch (error) {
      console.warn('Error cargando fuentes desde API, se usarán datos locales como fallback:', error);
    }
  }


  /**
   * Cargar datos de resumen y detalle de los departamentos de regionalización PGN a partir de los filtros seleccionados
   */
  private async descargarDatosSeguimiento(): Promise<void> {
    try {
      console.log('Vigencia seleccionada por defecto:', this.selectedVigencia);
      console.log('Periodo seleccionado por defecto:', this.selectedPeriodo);
      console.log('Region seleccionado por defecto:', this.selectedRegion);
      console.log('Código Departamento  seleccionado por defecto:', this.selectedDepartamento);
      console.log('Fuente seleccionada por defecto:', this.selectedFuente);



    const archivo: Blob | undefined = await this.sicodisApiService
                                            .getPgnDescargaDatoSeguimientoPorVigenciaPeriodoRegionDeptoFuente( this.selectedVigencia.id,
                                                                                                              this.selectedPeriodo.id,
                                                                                                              this.selectedRegion.id,
                                                                                                              this.selectedDepartamento.id,
                                                                                                              this.selectedFuente.id
                                                                                                              )
                                                                                                              .toPromise();

      // Verificamos que sí tengamos archivo
      if (!archivo) {
        console.warn('No se recibió ningún archivo desde el servicio');
        return;
      }


      // Forzar tipo MIME correcto para Excel
      const excelBlob = new Blob([archivo], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const arrayBuffer = await excelBlob.arrayBuffer();
      console.log('Tamaño de archivo:', arrayBuffer.byteLength);

      // Crear enlace temporal para descargar
      const url = window.URL.createObjectURL(excelBlob);
      const a = document.createElement('a');
      a.href = url;

      const nombreArchivo = `seguimiento_${this.selectedVigencia.id}_${this.selectedPeriodo.id}.xlsx`;
      a.download = nombreArchivo;
      a.click();

      window.URL.revokeObjectURL(url);

      console.log('Archivo descargado exitosamente');



    } catch (error) {
      console.warn('Error cargando fuentes desde API, se usarán datos locales como fallback:', error);
    }
  }


  /**
   * Descarga los datos de resumen y detalle de los departamentos de regionalización PGN a partir de los filtros seleccionados en un archivo
   */
  private async descargarDatosRegionalizados(): Promise<void> {
    try {
      console.log('Vigencia seleccionada:', this.selectedVigencia);
      console.log('Periodo seleccionado:', this.selectedPeriodo);
      console.log('Código Departamento:', this.selectedDepartamento);
      console.log('Fuente:', this.selectedFuente);

      // Puede ser Blob o undefined
      const archivo: Blob | undefined = await this.sicodisApiService.getPgnDescargaDatosRegionalizacionPorVigenciaPeriodo(this.selectedVigencia.id,
                                                                                                                          this.selectedPeriodo.id,
                                                                                                                          this.selectedDepartamento.id,
                                                                                                                          this.selectedFuente.id
                                                                                                                        )
                                                                                                                        .toPromise();

      // Verificamos que sí tengamos archivo
      if (!archivo) {
        console.warn('No se recibió ningún archivo desde el servicio');
        return;
      }


      // Forzar tipo MIME correcto para Excel
      const excelBlob = new Blob([archivo], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const arrayBuffer = await excelBlob.arrayBuffer();
      console.log('Tamaño de archivo:', arrayBuffer.byteLength);

      // Crear enlace temporal para descargar
      const url = window.URL.createObjectURL(excelBlob);
      const a = document.createElement('a');
      a.href = url;

      const nombreArchivo = `regionalizacion_${this.selectedVigencia.id}_${this.selectedPeriodo.id}.xlsx`;
      a.download = nombreArchivo;
      a.click();

      window.URL.revokeObjectURL(url);

      console.log('Archivo descargado exitosamente');

    } catch (error) {
      console.warn('Error descargando el archivo:', error);
    }
  }

  onVigenciaChange(event: SelectChangeEvent): void {
    console.log('Vigencia seleccionada:', event.value);
    this.selectedVigencia = event.value;

    this.cargarPeriodos();
    this.cargarDepartamentos();
    this.cargarFuentes();

  }

  onPeriodoChange(event: SelectChangeEvent): void {
    console.log('Periodo seleccionado:', event.value);
    this.selectedPeriodo = event.value;
    this.cargarDepartamentos();
    this.cargarFuentes();    
  }

  onRegionChange(event: SelectChangeEvent): void {
    console.log('Región seleccionada:', event.value);
    this.selectedRegion = event.value;
    this.cargarDepartamentos();
    this.cargarFuentes();    
  }

  onDepartamentoChange(event: SelectChangeEvent): void {
    console.log('Departamento seleccionado:', event.value);
    this.selectedDepartamento = event.value;   
  }

  onFuenteChange(event: SelectChangeEvent): void {
    console.log('Fuente seleccionada:', event.value);
    this.selectedFuente = event.value;
  }

  onActualizar(): void {
    console.log('Actualizando datos...');
    console.log('Vigencia:', this.selectedVigencia);
    console.log('Periodo:', this.selectedPeriodo);
    console.log('Departamento:', this.selectedDepartamento);
    console.log('Fuente:', this.selectedFuente);
    this.cargarDatosSeguimiento();

    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      console.log('Datos actualizados');
    }, 2000);
  }

  clearFilters(): void {
    this.selectedVigencia = this.vigencias[0];
    this.selectedPeriodo = this.periodos[0];
    this.selectedDepartamento = null;
    this.selectedFuente = null;
    console.log('Filtros limpiados');
  }

  private initializeDepartamentosData(): void {
    this.departamentosData = [
      { departamento: 'Antioquia', vigencia: 5234567000000, perCapita: 8.5 },
      { departamento: 'Cundinamarca', vigencia: 4567890000000, perCapita: 7.2 },
      { departamento: 'Valle del Cauca', vigencia: 3456789000000, perCapita: 7.8 },
      { departamento: 'Atlántico', vigencia: 2987654000000, perCapita: 8.9 },
      { departamento: 'Santander', vigencia: 2876543000000, perCapita: 6.5 },
      { departamento: 'Bolívar', vigencia: 2345678000000, perCapita: 7.6 },
      { departamento: 'Córdoba', vigencia: 1987654000000, perCapita: 5.4 },
      { departamento: 'Huila', vigencia: 1876543000000, perCapita: 7.2 },
      { departamento: 'Tolima', vigencia: 1765432000000, perCapita: 6.8 },
      { departamento: 'Nariño', vigencia: 1654321000000, perCapita: 5.9 },
      { departamento: 'Meta', vigencia: 1543210000000, perCapita: 8.3 },
      { departamento: 'Boyacá', vigencia: 1432109000000, perCapita: 6.2 },
      { departamento: 'Cauca', vigencia: 1321098000000, perCapita: 5.8 },
      { departamento: 'Norte de Santander', vigencia: 1210987000000, perCapita: 6.7 },
      { departamento: 'Cesar', vigencia: 1109876000000, perCapita: 7.1 },
      { departamento: 'Magdalena', vigencia: 998765000000, perCapita: 5.6 },
      { departamento: 'La Guajira', vigencia: 887654000000, perCapita: 6.3 },
      { departamento: 'Sucre', vigencia: 776543000000, perCapita: 5.2 },
      { departamento: 'Casanare', vigencia: 665432000000, perCapita: 9.8 },
      { departamento: 'Chocó', vigencia: 554321000000, perCapita: 4.5 },
      { departamento: 'Caquetá', vigencia: 443210000000, perCapita: 6.4 },
      { departamento: 'Putumayo', vigencia: 332109000000, perCapita: 6.9 },
      { departamento: 'Quindío', vigencia: 221098000000, perCapita: 7.5 },
      { departamento: 'Risaralda', vigencia: 210987000000, perCapita: 7.8 },
      { departamento: 'Caldas', vigencia: 209876000000, perCapita: 7.2 },
      { departamento: 'Arauca', vigencia: 198765000000, perCapita: 6.0 },
      { departamento: 'San Andrés y Providencia', vigencia: 87654000000, perCapita: 8.9 },
      { departamento: 'Amazonas', vigencia: 76543000000, perCapita: 5.5 },
      { departamento: 'Guainía', vigencia: 65432000000, perCapita: 4.8 },
      { departamento: 'Guaviare', vigencia: 54321000000, perCapita: 5.2 },
      { departamento: 'Vaupés', vigencia: 43210000000, perCapita: 4.6 },
      { departamento: 'Vichada', vigencia: 32109000000, perCapita: 3.8 }
    ];
  }


  getTotalApropiacionVigente(): number {
    return this.detalle.reduce((sum, item) => sum + item.total_apropiacion_vigente, 0);
  }


  getTotalCompromisos(): number {
    return this.detalle.reduce((sum, item) => sum + item.total_compromisos, 0);
  }


  getTotalObligaciones(): number {
    return this.detalle.reduce((sum, item) => sum + item.total_obligaciones, 0);
  }

  getTotalPagos(): number {
    return this.detalle.reduce((sum, item) => sum + item.total_pagos, 0);
  }

  getTotalVigencia(): number {
    return this.detalle.reduce((sum, item) => sum + item.total_presupuesto_pgn_inversion, 0);
  }

  getAveragePerCapita(): number {
    const total = this.detalle.reduce((sum, item) => sum + item.per_capita, 0);
    return Math.round((total / this.detalle.length) * 10) / 10;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  exportToExcel(): void {
    console.log('Exportando a Excel...');
    console.log('Actualizando datos...');
    console.log('Vigencia:', this.selectedVigencia);
    console.log('Periodo:', this.selectedPeriodo);
    console.log('Departamento:', this.selectedDepartamento);
    console.log('Fuente:', this.selectedFuente);
    this.descargarDatosSeguimiento();
  }
}