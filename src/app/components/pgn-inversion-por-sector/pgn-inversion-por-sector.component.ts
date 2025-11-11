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
  selector: 'app-pgn-regionalizacion-presupuesto-programacion',
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
  templateUrl: './pgn-inversion-por-sector.component.html',
  styleUrl: './pgn-inversion-por-sector.component.scss'
})
export class PgnInversionPorSectorComponent implements OnInit {

  items: MenuItem[] | undefined;
  home: MenuItem | undefined;

  // Filter properties
  selectedVigencia: any;
  selectedPeriodo: any;
  selectedSector: any;
  selectedEntidad: any;
  selectedProyecto: any;
  selectedFuente: any;

  // Loading state
  isLoading = false;

  // Data arrays
  vigencias: any[] = [];
  periodos: any[] = [];
  sectores: any[] = [];
  entidades: any[] = [];
  proyectos: any[] = [];
  fuentes: any[] = [];
  
  // Arreglos para el resultado
  resumen: any[] = [];
  detalle: any[] = [];

 

  // Table data
  departamentosData: any[] = [];


  constructor(
    private sicodisApiService: SicodisApiService
  ) {}

  get resumenDataInversion() : any {
    return this.resumen.length > 0 ? this.resumen[0] : null;
  }


  async ngOnInit(): Promise<void> {
    this.items = [
        { label: 'PGN', routerLink: '/pgn-inicio' },
        { label: 'Inversión por Sector, entidad y proyecto' }
    ];

    this.home = { icon: 'pi pi-home', routerLink: '/' };

      // Cargar datos necesarios desde API para los filtros del formularios
    await this.cargarVigencias();
    await this.cargarPeriodos();
    await this.cargarSectores();
    await this.cargarEntidades();
    await this.cargarProyectos();
    await this.cargarFuentes();
    await this.cargarDatosInversion();

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
   * Cargar datos de los sectores desde la API para inicializar el formulario
   */
  private async cargarSectores(): Promise<void> {
    try {
      console.log('Vigencia seleccionada por defecto:', this.selectedVigencia);
      console.log('Periodo seleccionado por defecto:', this.selectedPeriodo);

      const sectores = await this.sicodisApiService.getPgnSectoresPorVigenciaPeriodo(this.selectedVigencia.id, this.selectedPeriodo.id).toPromise();

      // Mapeamos los resultados
      this.sectores = sectores?.map((sector: any) => ({
        id: sector.id_sector,
        label: sector.sector
      })) || [];

      // Se agrega la opción "0 - Todos" al inicio
      this.sectores.unshift({ id: '0', label: 'Todos' });

      // Seleccionamos "Todos" por defecto
      this.selectedSector = this.sectores[0];

      console.log('Sectores cargados desde API:', this.sectores);
      console.log('Sectores seleccionado por defecto:', this.selectedSector);

    } catch (error) {
      console.warn('Error sectores  desde API, se usarán datos locales como fallback:', error);
      this.sectores = [{ id: '0', label: 'Todos' }];
      this.selectedSector= this.fuentes[0];
    }
  }

  

  /**
   * Cargar datos de los entidades desde la API para inicializar el formulario
   */
  private async cargarEntidades(): Promise<void> {
    try {
      console.log('Vigencia seleccionada por defecto:', this.selectedVigencia);
      console.log('Periodo seleccionado por defecto:', this.selectedPeriodo);
      console.log('Sector seleccionado por defecto:', this.selectedSector);

      const entidades = await this.sicodisApiService.getPgnEntidadesPorVigenciaPeriodoSector(this.selectedVigencia.id
                                                                                             , this.selectedPeriodo.id
                                                                                             , this.selectedSector.id).toPromise();

      // Mapeamos los resultados
      this.entidades = entidades?.map((entidad: any) => ({
        id: entidad.codigo_entidad,
        label: entidad.entidad
      })) || [];

      // Se agrega la opción "0 - Todos" al inicio
      this.entidades.unshift({ id: '0', label: 'Todas' });

      // Seleccionamos "Todos" por defecto
      this.selectedEntidad = this.entidades[0];

      console.log('Entidades cargados desde API:', this.entidades);
      console.log('Entidad seleccionado por defecto:', this.selectedEntidad);

    } catch (error) {
      console.warn('Error cargando entidades desde API, se usarán datos locales como fallback:', error);
      this.entidades = [{ id: '0', label: 'Todos' }];
      this.selectedEntidad = this.entidades[0];
    }
  }


  /**
   * Cargar datos de los proyectos desde la API para inicializar el formulario
   */
  private async cargarProyectos(): Promise<void> {
    try {
      console.log('Vigencia seleccionada por defecto:', this.selectedVigencia);
      console.log('Periodo seleccionado por defecto:', this.selectedPeriodo);
      console.log('Sector seleccionado por defecto:', this.selectedSector);
      console.log('Entidad seleccionada por defecto:', this.selectedEntidad);

      const proyectos = await this.sicodisApiService.getPgnProyectosEntidadPorVigenciaPeriodoSector(this.selectedVigencia.id
                                                                                                    , this.selectedPeriodo.id
                                                                                                    , this.selectedSector.id
                                                                                                    , this.selectedEntidad.id).toPromise();

      // Mapeamos los resultados
      this.proyectos = proyectos?.map((proyecto: any) => ({
        id: proyecto.bpin,
        label: proyecto.proyecto
      })) || [];

      // Se agrega la opción "0 - Todos" al inicio
      this.proyectos.unshift({ id: '0', label: 'Todos' });

      // Seleccionamos "Todos" por defecto
      this.selectedProyecto = this.proyectos[0];

      console.log('Proyectos cargados desde API:', this.proyectos);
      console.log('Proyectos seleccionado por defecto:', this.selectedProyecto);

    } catch (error) {
      console.warn('Error cargando proyectos desde API, se usarán datos locales como fallback:', error);
      this.proyectos = [{ id: '0', label: 'Todos' }];
      this.selectedProyecto = this.proyectos[0];
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
  private async cargarDatosInversion(): Promise<void> {
    try {
      console.log('Vigencia seleccionada por defecto:', this.selectedVigencia);
      console.log('Periodo seleccionado por defecto:', this.selectedPeriodo);
      console.log('Sector seleccionado por defecto:', this.selectedSector);
      console.log('Entidad seleccionada por defecto:', this.selectedEntidad);
      console.log('Proyecto seleccionado por defecto:', this.selectedProyecto);
      console.log('Fuente seleccionada por defecto:', this.selectedFuente);


    const response = await this.sicodisApiService.getPgnDatosInversionFuenteProyectosEntidadPorVigenciaPeriodoSector( this.selectedVigencia.id,
                                                                                                                      this.selectedPeriodo.id,
                                                                                                                      this.selectedSector.id,
                                                                                                                      this.selectedEntidad.id,
                                                                                                                      this.selectedProyecto.id,
                                                                                                                      this.selectedFuente.id
                                                                                                                    )
                                                                                                                    .toPromise();

      // Mapeamos los resultados
    this.resumen = response?.resumen || [];
    this.detalle = response?.detalle || [];
    

    console.log('Resumen recibido:', this.resumen);
    console.log('Detalle recibido:', this.detalle);


    } catch (error) {
      console.warn('Error cargando datos desde API, se usarán datos locales como fallback:', error);
    }
  }


  /**
   * Descarga los datos de resumen y detalle de los departamentos de regionalización PGN a partir de los filtros seleccionados en un archivo
   */
  private async descargarDatosInversion(): Promise<void> {
    try {
      console.log('Vigencia seleccionada por defecto:', this.selectedVigencia);
      console.log('Periodo seleccionado por defecto:', this.selectedPeriodo);
      console.log('Sector seleccionado por defecto:', this.selectedSector);
      console.log('Entidad seleccionada por defecto:', this.selectedEntidad);
      console.log('Proyecto seleccionado por defecto:', this.selectedProyecto);
      console.log('Fuente seleccionada por defecto:', this.selectedFuente);


          // Puede ser Blob o undefined
      const archivo: Blob | undefined = await this.sicodisApiService.getPgnDescargaDatosInversionFuenteProyectosEntidadPorVigenciaPeriodoSector( this.selectedVigencia.id,
                                                                                                                      this.selectedPeriodo.id,
                                                                                                                      this.selectedSector.id,
                                                                                                                      this.selectedEntidad.id,
                                                                                                                      this.selectedProyecto.id,
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

      const nombreArchivo = `inversion_${this.selectedVigencia.id}_${this.selectedPeriodo.id}.xlsx`;
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
    this.cargarEntidades();
    this.cargarFuentes();

  }

  onPeriodoChange(event: SelectChangeEvent): void {
    console.log('Periodo seleccionado:', event.value);
    this.selectedPeriodo = event.value;
    this.cargarEntidades();
    this.cargarFuentes();    
  }

  onEntidadChange(event: SelectChangeEvent): void {
    console.log('Entidad seleccionada:', event.value);
    this.selectedEntidad = event.value;   
    this.cargarProyectos();
  }

  onProyectoChange(event: SelectChangeEvent): void {
    console.log('Proyecto seleccionado:', event.value);
    this.selectedProyecto = event.value;   
  }
  

  onFuenteChange(event: SelectChangeEvent): void {
    console.log('Fuente seleccionada:', event.value);
    this.selectedFuente = event.value;
  }

  onSectorChange(event: SelectChangeEvent): void {
    console.log('Sector seleccionado:', event.value);
    this.selectedSector = event.value;
    this.cargarEntidades();
  }

  onActualizar(): void {
    console.log('Actualizando datos...');
    console.log('Vigencia:', this.selectedVigencia);
    console.log('Periodo:', this.selectedPeriodo);
    console.log('Entidad:', this.selectedEntidad);
    console.log('Fuente:', this.selectedFuente);
    this.cargarDatosInversion();

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
    this.selectedSector = this.sectores[0];
    this.selectedEntidad = this.entidades[0];
    this.selectedProyecto = this.proyectos[0];
    this.selectedFuente = this.fuentes[0];
    //this.cargarDatosInversion();    

    console.log('Filtros limpiados');
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
    console.log('Entidad:', this.selectedEntidad);
    console.log('Fuente:', this.selectedFuente);
    this.descargarDatosInversion();
  }
}