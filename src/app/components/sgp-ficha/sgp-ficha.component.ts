import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { Select, SelectChangeEvent } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import {
  SicodisApiService, FichaSgp, FichaSgpDatosGenerales, FichaSgpRecurso,
  FichaSgpCriterio, FichaSgpComparativo
} from '../../services/sicodis-api.service';
import { generarFichaPdf } from './sgp-ficha-pdf';

@Component({
  selector: 'app-sgp-ficha',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    ButtonModule,
    Select,
    FloatLabel,
    ProgressSpinnerModule
  ],
  templateUrl: './sgp-ficha.component.html',
  styleUrl: './sgp-ficha.component.scss'
})
export class SgpFichaComponent implements OnInit {

  // Mientras se genera el PDF, el botón muestra "Procesando..." y se ve el aviso de carga
  exportando = false;

  // Combos
  departments: { id: string; label: string }[] = [];
  towns: { id: string; label: string }[] = [];
  departmentSelected: string | null = null;
  townSelected: string | null = null;

  // Errores de campos obligatorios, se calculan solo al dar Aplicar
  departamentoInvalido = false;
  municipioInvalido = false;

  // Estado de la página
  isLoading = false;
  errorMessage: string | null = null;

  // Ficha consultada (sgp/ficha/{codigoDane})
  ficha: FichaSgp | null = null;

  // Secciones expandibles de la ficha, todas arrancan abiertas
  seccionesAbiertas: Record<string, boolean> = {
    datosGenerales: true,
    educacion: true,
    salud: true,
    agua: true,
    proposito: true,
    alimentacion: true,
    riberenos: true,
    resguardos: true,
    fonpet: true
  };

  // Nombres cortos de los conceptos para la gráfica de variación, igual que en el Excel
  private readonly nombresCortos: Record<string, string> = {
    EDUCACION: 'Educación',
    SALUD: 'Salud',
    AGUA: 'Agua',
    PROPOSITO: 'Propósito',
    ALIMENTACION: 'Alimentación',
    RIBERENOS: 'Ribereños',
    RESGUARDOS: 'Resguardos',
    FONPET: 'FONPET',
    TOTAL: 'Total'
  };

  fechaActual = (() => {
    const fecha = new Date();
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${meses[fecha.getMonth()]} ${fecha.getDate()} de ${fecha.getFullYear()}`;
  })();

  constructor(private sicodisApiService: SicodisApiService) {}

  async ngOnInit(): Promise<void> {
    await this.cargarDepartamentos();
  }

  /**
   * Departamentos desde la API, sin la opción "Todos" porque la ficha es de un solo municipio
   */
  private async cargarDepartamentos(): Promise<void> {
    try {
      const lista = await firstValueFrom(this.sicodisApiService.getSgpDepartamentos());
      this.departments = (lista ?? [])
        .filter((dept: any) => !this.esTodos(dept.nombre))
        .map((dept: any) => ({
          id: dept.codigo,
          label: dept.nombre
        }));
    } catch (error) {
      console.error('Error cargando departamentos desde la API:', error);
      this.departments = [];
    }
  }

  /**
   * Municipios del departamento elegido desde la API, también sin la opción "Todos"
   */
  private async cargarMunicipios(codigoDepto: string): Promise<void> {
    try {
      const lista = await firstValueFrom(this.sicodisApiService.getMunicipiosDepartamentosSgp(codigoDepto));
      this.towns = (lista ?? [])
        .filter((town: any) => !this.esTodos(town.nombre))
        .map((town: any) => ({
          id: town.codigo,
          label: town.nombre
        }));
    } catch (error) {
      console.error('Error cargando municipios desde la API:', error);
      this.towns = [];
    }
  }

  /**
   * Al cambiar el departamento se recargan sus municipios y se limpia el municipio elegido
   */
  onDepartmentChange(event: SelectChangeEvent): void {
    this.departamentoInvalido = false;
    this.municipioInvalido = false;
    this.townSelected = null;
    this.towns = [];

    if (this.departmentSelected) {
      this.cargarMunicipios(this.departmentSelected);
    }
  }

  onTownChange(event: SelectChangeEvent): void {
    this.municipioInvalido = false;
  }

  /**
   * Valida los combos obligatorios y consulta la ficha del municipio elegido
   */
  onAplicar(): void {
    // Departamento y municipio son obligatorios. Si falta el departamento solo se marca ese,
    // y si ya hay departamento pero falta el municipio se marca el municipio
    this.departamentoInvalido = !this.departmentSelected;
    this.municipioInvalido = !!this.departmentSelected && !this.townSelected;

    if (this.departamentoInvalido || this.municipioInvalido) {
      return;
    }

    this.cargarFicha(this.getCodigoDane());
  }

  /**
   * Llama el servicio de la ficha municipal y guarda la respuesta
   */
  private cargarFicha(codigoDane: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.ficha = null;

    this.sicodisApiService.getSgpFichaMunicipio(codigoDane).subscribe({
      next: (data) => {
        this.ficha = this.limpiarNulosFicha(data) as FichaSgp;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando la ficha municipal:', err);
        this.errorMessage = 'No fue posible cargar la ficha del municipio. Intente nuevamente.';
        this.isLoading = false;
      }
    });
  }

  // ============================================================================
  // DESCARGA DE LA FICHA EN PDF
  // ============================================================================

  /**
   * Descarga la ficha en PDF. El documento lo arma sgp-ficha-pdf.ts con pdfmake,
   * usando los mismos datos y textos que se ven en pantalla
   */
  async descargarFicha(): Promise<void> {
    if (!this.ficha || this.exportando) return;
    this.exportando = true;
    try {
      await generarFichaPdf(this);
    } catch (error) {
      console.error('Error generando el PDF de la ficha:', error);
      this.errorMessage = 'No fue posible generar el PDF de la ficha. Intente nuevamente.';
    } finally {
      this.exportando = false;
    }
  }

  // ============================================================================
  // SECCIÓN 1 ENCABEZADO DEL MUNICIPIO (población, NBI y recursos SGP)
  // ============================================================================

  get datosGenerales(): FichaSgpDatosGenerales | null {
    return this.ficha?.datosGenerales ?? null;
  }

  /** Fila TOTAL de recursos (total SGP de las dos vigencias, en millones) */
  get recursoTotal(): FichaSgpRecurso | null {
    return this.ficha?.recursos?.find(r => r.codigo === 'TOTAL') ?? null;
  }

  /** NBI acotado entre 0 y 100 para el ancho de la barra */
  get nbiAncho(): number {
    const nbi = this.datosGenerales?.nbiActual ?? 0;
    return Math.max(0, Math.min(100, nbi));
  }

  /** Texto de la diferencia de población, por ejemplo "974 habitantes menos" */
  get textoDiferenciaPoblacion(): string {
    const dg = this.datosGenerales;
    if (!dg) return '';
    const diferencia = dg.poblacionActual - dg.poblacionAnterior;
    if (diferencia === 0) return 'Sin cambio en habitantes';
    return `${this.formatNumero(Math.abs(diferencia))} habitantes ${diferencia < 0 ? 'menos' : 'más'}`;
  }

  /** Texto de la diferencia de recursos, por ejemplo "$2.049 millones más" */
  get textoDiferenciaRecursos(): string {
    const total = this.recursoTotal;
    if (!total) return '';
    if (total.diferencia === 0) return 'Sin cambio en recursos';
    return `$${this.formatNumero(Math.abs(total.diferencia))} millones ${total.diferencia < 0 ? 'menos' : 'más'}`;
  }

  /**
   * Los valores NULL de la base de datos llegan en el JSON como {} (objeto vacío).
   * Este método los convierte en null en toda la respuesta para que la ficha los trate como "sin dato"
   */
  private limpiarNulosFicha(valor: any): any {
    if (Array.isArray(valor)) {
      return valor.map(item => this.limpiarNulosFicha(item));
    }
    if (valor !== null && typeof valor === 'object') {
      const llaves = Object.keys(valor);
      if (llaves.length === 0) {
        return null;
      }
      const resultado: any = {};
      llaves.forEach(llave => resultado[llave] = this.limpiarNulosFicha(valor[llave]));
      return resultado;
    }
    return valor;
  }

  // ============================================================================
  // SECCIÓN 2 DATOS GENERALES SOBRE LA ASIGNACIÓN (variación del SGP por concepto)
  // ============================================================================

  toggleSeccion(seccion: string): void {
    this.seccionesAbiertas[seccion] = !this.seccionesAbiertas[seccion];
  }

  /**
   * Filas de la gráfica de variación, una por concepto más el Total.
   * Cada barra ocupa todo el ancho y se reparte entre la vigencia anterior y la actual
   * según el peso de cada valor, como la barra apilada al 100% del Excel
   */
  get filasVariacion(): {
    etiqueta: string;
    anterior: number;
    actual: number;
    variacion: number | null;
    anchoAnterior: number;
    anchoActual: number;
    sinRecursos: boolean;
    esTotal: boolean;
  }[] {
    return (this.ficha?.recursos ?? [])
      .filter(r => r.codigo === 'TOTAL' || this.tieneAsignacion(r.codigo))
      .slice()
      .sort((x, y) => x.orden - y.orden)
      .map(r => {
        const anterior = r.valorAnterior ?? 0;
        const actual = r.valorActual ?? 0;
        const suma = anterior + actual;
        return {
          etiqueta: this.nombresCortos[r.codigo] ?? r.concepto,
          anterior,
          actual,
          variacion: r.variacion,
          anchoAnterior: suma > 0 ? (anterior / suma) * 100 : 0,
          anchoActual: suma > 0 ? (actual / suma) * 100 : 0,
          sinRecursos: suma === 0,
          esTotal: r.codigo === 'TOTAL'
        };
      });
  }

  // ============================================================================
  // SECCIONES POR CONCEPTO (bloques reutilizables para Educación, Salud, Agua, etc.)
  // ============================================================================

  /** Criterio de una lista por su orden, para armar los textos de cada concepto */
  criterio(lista: FichaSgpCriterio[] | null | undefined, orden: number): FichaSgpCriterio | null {
    return lista?.find(c => c.orden === orden) ?? null;
  }

  /**
   * Columnas apiladas al 100% de la gráfica de criterios, como en el Excel.
   * Todas las columnas tienen la misma altura y se reparten entre la vigencia anterior (abajo)
   * y la actual (arriba) según el peso de cada valor
   */
  barrasCriterios(lista: FichaSgpCriterio[] | null | undefined): {
    criterio: string;
    anterior: number;
    actual: number;
    altoAnterior: number;
    altoActual: number;
    sinRecursos: boolean;
  }[] {
    return (lista ?? [])
      .slice()
      .sort((x, y) => x.orden - y.orden)
      .map(c => {
        const anterior = c.valorAnterior ?? 0;
        const actual = c.valorActual ?? 0;
        const suma = anterior + actual;
        return {
          criterio: c.criterio,
          anterior,
          actual,
          altoAnterior: suma > 0 ? (anterior / suma) * 100 : 0,
          altoActual: suma > 0 ? (actual / suma) * 100 : 0,
          sinRecursos: suma === 0
        };
      });
  }

  /**
   * Dos columnas, vigencia anterior y actual, para los criterios de un solo valor
   * (Régimen Subsidiado, Subsidio a la Oferta). La más alta ocupa todo el alto
   */
  barrasAnios(c: { valorAnterior: number; valorActual: number } | null): { anio: number | undefined; valor: number; alto: number; actual: boolean }[] {
    if (!c) return [];
    const anterior = c.valorAnterior ?? 0;
    const actual = c.valorActual ?? 0;
    const maximo = Math.max(anterior, actual);
    return [
      { anio: this.datosGenerales?.anioAnterior, valor: anterior, alto: maximo > 0 ? (anterior / maximo) * 100 : 0, actual: false },
      { anio: this.datosGenerales?.anioActual, valor: actual, alto: maximo > 0 ? (actual / maximo) * 100 : 0, actual: true }
    ];
  }

  /** Columnas del per cápita: municipio y los cuatro promedios */
  barrasPerCapita(comp: FichaSgpComparativo | null | undefined): {
    etiqueta: string;
    valor: number;
    alto: number;
    esMunicipio: boolean;
  }[] {
    if (!comp) return [];
    const columnas = [
      { etiqueta: 'Municipio', valor: comp.perCapitaMunicipio ?? 0, esMunicipio: true },
      { etiqueta: 'Promedio departamental', valor: comp.promedioDepartamental ?? 0, esMunicipio: false },
      { etiqueta: 'Promedio población', valor: comp.promedioPoblacion ?? 0, esMunicipio: false },
      { etiqueta: 'Promedio NBI', valor: comp.promedioNBI ?? 0, esMunicipio: false },
      { etiqueta: 'Promedio población y NBI', valor: comp.promedioPoblacionNBI ?? 0, esMunicipio: false }
    ];
    const maximo = Math.max(0, ...columnas.map(c => c.valor));
    return columnas.map(c => ({ ...c, alto: maximo > 0 ? (c.valor / maximo) * 100 : 0 }));
  }

  /** Las cuatro cajas de brecha del municipio frente a cada promedio */
  brechas(comp: FichaSgpComparativo | null | undefined): {
    titulo: string;
    brecha: number | null;
    diferencia: number | null;
  }[] {
    if (!comp) return [];
    return [
      { titulo: 'Departamento', brecha: comp.brechaDepartamental, diferencia: comp.diferenciaDepartamental },
      { titulo: 'Población', brecha: comp.brechaPoblacion, diferencia: comp.diferenciaPoblacion },
      { titulo: 'NBI', brecha: comp.brechaNBI, diferencia: comp.diferenciaNBI },
      { titulo: 'Población y NBI', brecha: comp.brechaPoblacionNBI, diferencia: comp.diferenciaPoblacionNBI }
    ];
  }

  /** Texto de certificación en salud según la vigencia anterior y la actual */
  textoCertificadoSalud(ind: Record<string, any> | null): string {
    if (!ind) return '';
    if (ind['certificadoActual']) {
      return 'Municipio certificado en salud, si es monopolio, los recursos van para el municipio';
    }
    if (ind['certificadoAnterior']) {
      return 'El municipio ya no es certificado en salud, si es monopolio, los recursos van para el departamento';
    }
    return 'Municipio no certificado en salud, si es monopolio, los recursos van para el departamento';
  }

  /** Texto de monopolio en servicios trazadores según la vigencia anterior y la actual */
  textoMonopolioSalud(ind: Record<string, any> | null): string {
    if (!ind) return '';
    if (ind['monopolioActual']) {
      return ind['monopolioAnterior']
        ? 'Municipio con monopolio en servicios trazadores'
        : 'El municipio ahora es monopolio en servicios trazadores';
    }
    return ind['monopolioAnterior']
      ? 'El municipio ya no es monopolio en servicios trazadores, por lo cual dejó de ser beneficiario de estos recursos'
      : 'El municipio no es monopolio en servicios trazadores, por lo cual no es beneficiario de estos recursos';
  }

  /**
   * Propósito General, texto de población. Si el municipio superó los 25.000 habitantes
   * entre una vigencia y otra, se informa que dejó de recibir la bolsa del 17%
   */
  textoPoblacionPG(ind: Record<string, any> | null): string {
    const dg = this.datosGenerales;
    if (!dg) return '';
    const inicio = ind?.['pierdeBeneficioPG17']
      ? `El municipio dejó de ser beneficiario de los recursos del 17% de PG, al superar el umbral de ${this.formatNumero(ind['umbralPoblacionPG17'])} habitantes`
      : `La variación de la población es de ${this.formatPorcentaje(dg.variacionPoblacion)}`;
    return `${inicio}, pasando de ${this.formatNumero(dg.poblacionAnterior)} en ${dg.anioAnterior} a ${this.formatNumero(dg.poblacionActual)} en ${dg.anioActual}`;
  }

  /** Propósito General, texto de eficiencia fiscal según refrendación y signo del indicador */
  textoEficienciaFiscal(ind: Record<string, any> | null): string {
    if (!ind) return '';
    if (ind['estadoEFActual'] === 'NO REFRENDADO') {
      return 'El municipio no fue beneficiario de los recursos por eficiencia fiscal dado que no fue refrendado por la Contaduría General de la Nación';
    }
    if ((ind['indicadorEFActual'] ?? 0) < 0) {
      return `El municipio no fue beneficiario de los recursos por eficiencia fiscal, dado que el crecimiento per cápita de ingresos tributarios fue negativo, ${this.formatPorcentaje(ind['indicadorEFActual'])}`;
    }
    const anterior = ind['estadoEFAnterior'] === 'NO REFRENDADO'
      ? 'no fue refrendado'
      : `fue ${this.formatPorcentaje(ind['indicadorEFAnterior'])}`;
    return `El indicador de eficiencia fiscal es ${this.formatPorcentaje(ind['indicadorEFActual'])} mientras que el año anterior ${anterior}`;
  }

  /** Propósito General, texto de eficiencia administrativa según la certificación de la Ley 617 */
  textoEficienciaAdministrativa(ind: Record<string, any> | null): string {
    if (!ind) return '';
    if (ind['estadoEAActual'] === 'NO CUMPLE') {
      return 'El municipio no fue beneficiario de los recursos por eficiencia administrativa dado que la Contaduría General de la Nación no certificó el cumplimiento de los límites de gastos de funcionamiento, Ley 617 de 2000';
    }
    const anterior = ind['estadoEAAnterior'] === 'NO CUMPLE'
      ? 'no fue certificado'
      : `fue ${this.formatPorcentaje(ind['indicadorEAAnterior'])}`;
    return `El indicador de eficiencia administrativa es ${this.formatPorcentaje(ind['indicadorEAActual'])} mientras que el año anterior ${anterior}`;
  }

  /** Alimentación Escolar, texto de deserción escolar y recursos por eficiencia */
  textoEficienciaPAE(ind: Record<string, any> | null): string {
    if (!ind) return '';
    return ind['recibeEficiencia']
      ? 'No aumentó la deserción escolar, recibió recursos por eficiencia'
      : 'Aumentó la deserción escolar, no recibió recursos por eficiencia';
  }

  /** Fila de recursos de un concepto (valores de las dos vigencias y su variación) */
  recurso(codigo: string): FichaSgpRecurso | null {
    return this.ficha?.recursos?.find(r => r.codigo === codigo) ?? null;
  }

  /**
   * Indica si el municipio recibe recursos del concepto en alguna de las dos vigencias.
   * Si no recibe nada en ninguna (por ejemplo Ribereños o Resguardos), la sección y su fila no se muestran
   */
  tieneAsignacion(codigo: string): boolean {
    const r = this.recurso(codigo);
    return !!r && ((r.valorAnterior ?? 0) > 0 || (r.valorActual ?? 0) > 0);
  }

  /** Texto de variación del total de un concepto, con el mismo formato que la de un criterio */
  textoVariacionRecurso(codigo: string): string {
    const r = this.recurso(codigo);
    if (!r || r.variacion === null || r.variacion === undefined) return 'No Aplica';
    return `${this.formatPorcentaje(r.variacion)} correspondiente a ${this.formatPesos(r.diferencia)} millones`;
  }

  /** Texto de variación de un criterio, por ejemplo "-28,3% correspondiente a -$409 millones" */
  textoVariacionCriterio(c: FichaSgpCriterio | null): string {
    if (!c || c.variacion === null || c.variacion === undefined) return 'No Aplica';
    return `${this.formatPorcentaje(c.variacion)} correspondiente a ${this.formatPesos(c.diferencia)} millones`;
  }

  /** Pesos con signo adelante, por ejemplo -409 queda -$409 */
  formatPesos(valor: number | null | undefined, decimales = 0): string {
    if (valor === null || valor === undefined) return 'N/A';
    return `${valor < 0 ? '-' : ''}$${this.formatNumero(Math.abs(valor), decimales)}`;
  }

  // ============================================================================
  // FORMATOS
  // ============================================================================

  /** Número con separador de miles de Colombia */
  formatNumero(valor: number | null | undefined, decimales = 0): string {
    if (valor === null || valor === undefined) return 'N/A';
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    }).format(valor);
  }

  /** Fracción como porcentaje con signo, por ejemplo 0.0622 queda +6,2% */
  formatVariacion(valor: number | null | undefined): string {
    if (valor === null || valor === undefined) return 'No aplica';
    const signo = valor > 0 ? '+' : '';
    return `${signo}${this.formatNumero(valor * 100, 1)}%`;
  }

  /** Fracción como porcentaje sin signo, por ejemplo 0.12 queda 12,0% (formato de la gráfica del Excel) */
  formatPorcentaje(valor: number | null | undefined, decimales = 1): string {
    if (valor === null || valor === undefined) return 'No aplica';
    return `${this.formatNumero(valor * 100, decimales)}%`;
  }

  /** Clase de color según la variación sube, baja o no aplica */
  claseVariacion(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || valor === 0) return 'neutral';
    return valor > 0 ? 'pos' : 'neg';
  }

  /** Ícono de Material para la gráfica de variación */
  iconoVariacion(valor: number | null | undefined): string {
    return (valor ?? 0) < 0 ? 'arrow_downward' : 'arrow_upward';
  }

  flechaVariacion(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || valor === 0) return '';
    return valor > 0 ? '▲' : '▼';
  }

  clearFilters(): void {
    this.ficha = null;
    this.errorMessage = null;
    this.departamentoInvalido = false;
    this.municipioInvalido = false;
    this.departmentSelected = null;
    this.townSelected = null;
    this.towns = [];
  }

  /**
   * Código DANE de 5 dígitos del municipio elegido.
   * Si la API entrega solo los 3 dígitos del municipio, se les antepone el código del departamento
   */
  private getCodigoDane(): string {
    const codigo = (this.townSelected ?? '').toString().trim();
    if (codigo.length === 5) {
      return codigo;
    }
    const depto = (this.departmentSelected ?? '').toString().trim().substring(0, 2);
    return depto + codigo.padStart(3, '0');
  }

  private esTodos(nombre: any): boolean {
    return (nombre ?? '').toString().trim().toLowerCase() === 'todos';
  }
}