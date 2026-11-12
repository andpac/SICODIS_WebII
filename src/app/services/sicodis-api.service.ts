import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { EficienciasMockService } from './eficiencias-mock.service';

// ========== EFICIENCIAS FISCALES Y ADMINISTRATIVAS Interfaces ==========

export interface MunicipioEficiencia {
  codigo_dane: string;
  departamento: string;
  municipio: string;
}

export interface IngresoTributario {
  id: number;
  codigo_dane: string;
  anio: number;
  valor: number;
  observacion: string;
}

export interface PoblacionMunicipio {
  id: number;
  codigo_dane: string;
  anio: number;
  poblacion: number;
  fuente_censo: string;
}

export interface RecursoPropositoGeneral {
  id: number;
  codigo_dane: string;
  anio: number;
  poblacion_m: number;
  pobreza_m: number;
  poblacion: number;
  pobreza: number;
  eficiencia_fiscal: number;
  eficiencia_administrativa: number;
  sisben: number;
}

export interface Ley617ICLD {
  id: number;
  codigo_dane: string;
  anio: number;
  valor: number;
}

export interface Ley617GastosFuncionamiento {
  id: number;
  codigo_dane: string;
  anio: number;
  valor: number;
}

export interface Ley617Razon {
  id: number;
  codigo_dane: string;
  anio: number;
  valor: number;
}

export interface Ley617Holgura {
  id: number;
  codigo_dane: string;
  anio: number;
  valor: number;
}

export interface Ley617LimiteGasto {
  codigo_dane: string;
  limite_gasto: number;
}

export interface Ley617Vigencia2026 {
  codigo_dane: string;
  icld: number;
  gf: number;
  lg: number;
  razon: number;
  holgura: number;
}

export interface IndicadorEficienciaFiscal {
  id: number;
  codigo_dane: string;
  anio: number;
  valor: number | null;
}

export interface IndicadorEficienciaAdministrativa {
  id: number;
  codigo_dane: string;
  anio: number;
  valor: number | null;
}

export interface NBI {
  id: number;
  codigo_dane: string;
  anio: number;
  valor: number | null;
}

export interface ResumenMunicipioEficiencia {
  municipio: MunicipioEficiencia;
  ingresos_tributarios: IngresoTributario[];
  poblacion: PoblacionMunicipio[];
  recursos_proposito_general: RecursoPropositoGeneral[];
  eficiencia_fiscal: IndicadorEficienciaFiscal[];
  eficiencia_administrativa: IndicadorEficienciaAdministrativa[];
  vigencia_2026: Ley617Vigencia2026 | null;
  ley_617_icld: Ley617ICLD[];
  ley_617_gastos_funcionamiento: Ley617GastosFuncionamiento[];
  ley_617_razon: Ley617Razon[];
  ley_617_holgura: Ley617Holgura[];
  nbi: NBI[];
  /**
   * Indica si la entidad territorial cuenta con concepto favorable del MHCP sobre el
   * cumplimiento de un Acuerdo de Reestructuración de Pasivos (Ley 550 de 1999) y/o
   * Programa de Saneamiento Fiscal y Financiero. En ese caso, para la distribución se le
   * asigna el promedio nacional del respectivo indicador (por eso puede recibir recursos
   * de eficiencia aun con indicadores propios negativos). Campos opcionales: el backend
   * los debe calcular/exponer (ver docs/backend-eficiencias-ley-550.md).
   */
  ley_550_eficiencia_fiscal?: boolean;
  ley_550_eficiencia_administrativa?: boolean;
}

export interface ComparacionMunicipios {
  municipios: MunicipioEficiencia[];
  anio: number;
  ingresos_tributarios: IngresoTributario[];
  poblacion: PoblacionMunicipio[];
  eficiencia_fiscal: IndicadorEficienciaFiscal[];
}

export interface RankingEficienciaItem {
  codigo_dane: string;
  departamento: string;
  municipio: string;
  anio: number;
  valor: number;
}

// ========== SGR Funcionamiento Interfaces ==========
export interface DiccionarioItem {
  id_concepto: number;
  concepto: string;
  descripcion: string;
}

export interface SiglasItem {
  sigla: string;
  descripcion: string;
}

export interface FuenteAsignacion {
  id_fuente: number;
  fuente: string  
}

export interface ConceptoFuente {
  id_concepto: number;
  concepto: string;
  id_fuente: number;
  fuente: string;
}

export interface EntidadConcepto {
  codigo_entidad: string;
  beneficiario: string;  
}

export interface DepartamentoFuncionamiento {
  codigo_departamento: string;
  nombre_departamento: string;
}

export interface MunicipioFuncionamiento {
  codigo_municipio: string;
  nombre_municipio: string;
  nombre_departamento: string;
}

export interface DistribucionTotal {
  id_vigencia: number;
  vigencia: string,
  nombre_fuente: string,
  distribucion_presupuesto_corriente: number;
  distribucion_otros: number;
  total_asignado_bienio: number;
  disponibilidad_inicial: number;
  apropiacion_vigente: number;
  recursos_bloqueados: number;
  apropiacion_vigente_disponible: number;
  iac_mr_saldos_reintegros: number;
  iac_corriente: number;
  iac_informadas: number;
  avance_iac_corriente: number;
  caja_total: number;
  cdp: number;
  compromisos: number;
  pagos: number;
  saldo_por_comprometer: number;
  pct_ejecucion_a_compromisos: number;
  caja_disponible: number;
  saldo_disponible_a_pagos: number;
  saldo_sin_afectacion: number;
}

export interface FuncionamientoSiglasDiccionario {
  diccionario: {
    data: DiccionarioItem[];
  };
  siglas: {
    data: SiglasItem[];
  };
}

// ========== SGR General Interfaces ==========
export interface SGRFechaActualizacionCorte {
  fecha_actualizacion: string;
  fecha_corte_recaudo: string;
}

export interface Vigencia {
  id_vigencia: number;
  vigencia: string;  
}

export interface DepartamentoSgr {
  codigo: string;
  nombre: string;
}


export interface MunicipioSgr {
  codigo: string;
  nombre: string;
}

// ========== SGR Plan Bienal Interfaces ==========
export interface VigenciaPlanBienal {
  id_vigencia: number;
  vigencia: string;
}

export interface DepartamentoPlanBienal {
  codigo: string;
  nombre: string;
  orden: number;
}

export interface MunicipioPlanBienal {
  codigo: string;
  nombre: string;
  orden: number;
}

export interface DetallePlanBienal {
  Orden: number;
  IdConcepto: string;
  Concepto: string;
  '2025-01'?: number;
  '2025-02'?: number;
  '2025-03'?: number;
  '2025-04'?: number;
  '2025-05'?: number;
  '2025-06'?: number;
  '2025-07'?: number;
  '2025-08'?: number;
  '2025-09'?: number;
  '2025-10'?: number;
  '2025-11'?: number;
  '2025-12'?: number;
  '2026-01'?: number;
  '2026-02'?: number;
  '2026-03'?: number;
  '2026-04'?: number;
  '2026-05'?: number;
  '2026-06'?: number;
  '2026-07'?: number;
  '2026-08'?: number;
  '2026-09'?: number;
  '2026-10'?: number;
  '2026-11'?: number;
  '2026-12'?: number;
  [key: string]: any; // Para soportar períodos dinámicos
}

export interface DetallePlanRecursos {
  // Hasta la vigencia 2023-2032 el backend envía `Orden` como número (esquema
  // plano: 1, 2, 3, 3.1, 14.1 ...). Desde la vigencia 2025-2034 lo envía como
  // string con la ruta jerárquica completa ("1", "1.1", "1.4.2.1.1" ...).
  Orden: number | string;
  IdConcepto: string;
  Concepto: string;
  [key: string]: any; // Para soportar claves de año dinámicas ("2025", "2026", ...)
}

/**
 * Parámetros para descargar en Excel el detalle del Plan de Recursos o del
 * Plan Bienal de Caja del SGR. El orden replica el de la ruta del endpoint.
 */
export interface DescargaDetallePlanParams {
  idVigencia: number;
  vigencia: string;
  codigoDepto: string;
  departamento: string;
  codigoMunicipio: string;
  municipio: string;
}

// ========== SGP Interfaces ==========
export interface VigenciaSgp {
  anio: number;
}

export interface DepartamentoSgp {
  codigo: string;
  nombre: string;
}


export interface MunicipioSgp {
  codigo: string;
  nombre: string;
}

export interface ResumenGeneral {
  anio: number;
  total_distribuido: number;
  total_presupuesto: number;
  porcentaje_ejecucion: number;
  porcentaje_avance: number;
  porcentaje_avance_str: string;
  fecha_ultima_actualizacion: Date;
}

export interface ResumenParticipaciones {
  anio: number;
  id_concepto: string;
  concepto: string;  
  total: number;
}

export interface ResumenParticipacionesAvance {
  anio: number;
  codigo_participacion: string;
  concepto: string;  
  presupuesto: number;
  distribuido: number;
  avance: number;
}

export interface ResumenParticipacionesUltimaOnce {
  IdConcepto: string;
  Concepto: string;  
  UltimaDoceava: number;
  OnceDoceavas: number;
  Total: number;
}

export interface ResumenDistribuciones {
  anio: number;
  id_distribucion: number;
  nombre: string;
  fecha_distribucion: string;
  total_distribucion: number;
  descripcion: string;
  tipo_distribucion: string;
  id_DocumentoDistribucion: number;
  id_DocumentoDatos: number;
}

export interface ResumenDistribucionesArchivo {
  id_anexo: number;
  nombre_documento: string;
  tipo: string;
  documento: number;
  descripcion: string;
  extension: string;
}

export interface ResumenHistorico {
  anio: number;
  id_concepto: string,
  concepto: string,
  precios_corrientes: number;
  precios_constantes: number;
  variacion_anual: number;
}

export interface ResumenHistoricoEntidad {
  anio: number;
  id_concepto: string,
  concepto: string,
  precios_corrientes: number;
  precios_constantes: number;  
}

// ========== SGP Request Parameters Interfaces ==========
export interface ResumenHistoricoParams {
  anios?: string;
}

export interface ResumenHistoricoEntidadParams {
  anios?: string;
  codigoDepto?: string;
  codigoMunicipio?: string;
  departamento?: string;
  municipio?: string;
}

export interface VigenciaPresupuesto {
  id_vigencia: number;
  vigencia: string;
}

export interface ResumenUltimaOnce {
  UltimaDoceava: number;
  OnceDoceavas: number;
  Total: number;  
}

export interface FichaComparativaEntidad {
  Concepto: string;
  IdConcepto: string;
  ConceptoDescripcion: string;
  PeriodoAnterior_Entidad1: number;
  PeriodoVigencia_Entidad1: number;
  Diferencias_Entidad1: number;
  Porcentual_Entidad1: number;
  PeriodoAnterior_Entidad2: number;
  PeriodoVigencia_Entidad2: number;
  Diferencias_Entidad2: number;
  Porcentual_Entidad2: number;
  tipo: number;
}


// ========== Ficha Municipal SGP (sgp/ficha/{codigoDane}) ==========
// Valores en pesos llegan en millones; per cápita y promedios en pesos;
// variaciones y brechas como fracción (0.0622 = 6,22%)

export interface FichaSgpDatosGenerales {
  codigoDane: string;
  nombreMunicipio: string;
  codigoDepto: string;
  nombreDepto: string;
  anioAnterior: number;
  anioActual: number;
  poblacionAnterior: number;
  poblacionActual: number;
  variacionPoblacion: number | null;
  nbiAnterior: number | null;
  nbiActual: number | null;
  categoria: string | null;
}

export interface FichaSgpRecurso {
  idConcepto: number | null;
  codigo: string;
  concepto: string;
  colorHex: string | null;
  orden: number;
  valorAnterior: number;
  valorActual: number;
  diferencia: number;
  variacion: number | null;
}

export interface FichaSgpComparativo {
  idConcepto: number;
  codigo: string;
  concepto: string;
  orden: number;
  rango: number;
  perCapitaMunicipio: number | null;
  promedioDepartamental: number | null;
  promedioPoblacion: number | null;
  promedioNBI: number | null;
  promedioPoblacionNBI: number | null;
  brechaDepartamental: number | null;
  brechaPoblacion: number | null;
  brechaNBI: number | null;
  brechaPoblacionNBI: number | null;
  diferenciaDepartamental: number | null;
  diferenciaPoblacion: number | null;
  diferenciaNBI: number | null;
  diferenciaPoblacionNBI: number | null;
}

export interface FichaSgpCriterio {
  orden: number;
  criterio: string;
  valorAnterior: number;
  valorActual: number;
  diferencia: number;
  variacion: number | null;
}

export interface FichaSgpConcepto<TCriterios = FichaSgpCriterio[], TIndicadores = Record<string, any>> {
  comparativo: FichaSgpComparativo | null;
  criterios: TCriterios;
  indicadores: TIndicadores | null;
}

export interface FichaSgpCriteriosSalud {
  regimenSubsidiado: FichaSgpCriterio[];
  saludPublica: FichaSgpCriterio[];
  subsidioOferta: FichaSgpCriterio[];
}

export interface FichaSgp {
  datosGenerales: FichaSgpDatosGenerales | null;
  recursos: FichaSgpRecurso[];
  educacion: FichaSgpConcepto;
  salud: FichaSgpConcepto<FichaSgpCriteriosSalud>;
  agua: FichaSgpConcepto;
  proposito: FichaSgpConcepto;
  alimentacion: FichaSgpConcepto;
  riberenos: FichaSgpConcepto;
  resguardos: FichaSgpConcepto;
  fonpet: { comparativo: FichaSgpComparativo | null };
}

// ========== PGN Request Parameters Interfaces ==========
export interface VigenciaPgn {
  id_vigencia: string;
  vigencia: string;
}

export interface PeriodoPgn {
  id_periodo: string;
  periodo: string;
}

export interface RegionPgn {
  codigo_region: string;
  region: string;
}

export interface DepartamentoPgn {
  codigo_dane_depto: string;
  departamento: string;
}


export interface FuentePgn {
  id_fuente: string;
  fuente: string;
}

export interface SectorPgn {
  id_sector: number;
  sector: string;
}


export interface EntidadPgn {
  codigo_entidad: string;
  entidad: string;
}

export interface ProyectoPgn {
  bpin: string;
  proyecto: string;
}



export interface PgnResumenRegionalizacion {
  vigencia: string;
  periodo: string;
  total_presupuesto_pgn_inversion: number;
  total_regionalizado: number;
  total_nacional: number;
  total_por_regionalizar: number;
  porcentaje_total_presupuesto_pgn_inversion: number;
  porcentaje_regionalizado: number;
  porcentaje_nacional: number;
  porcentaje_por_regionalizar: number;

}

export interface PgnDetalleRegionalizacion {
  vigencia: string;
  periodo: string;
  departamento: string;
  total_presupuesto_pgn_inversion: number;
  per_capita: number;
}

export interface PgnDatosRegionalizacionResponse {
  resumen: PgnResumenRegionalizacion[];
  detalle: PgnDetalleRegionalizacion[];
}


export interface PgnResumenInversion {
  vigencia: string;
  periodo: string;
  total_apropiacion_vigente: number;
  total_compromisos: number;
  total_obligaciones: number;
  total_pagos: number;
  porcentaje_total_apropiacion_vigente: number;
  porcentaje_total_compromisos: number;
  porcentaje_total_obligaciones: number;
  porcentaje_total_pagos: number;

}

export interface PgnDetalleInversion {
  vigencia: string;
  periodo: string;
  total_apropiacion_vigente: string;
  total_compromisos: number;
  total_obligaciones: number;
  total_pagos: number;
}


export interface PgnDatosInversionResponse {
  resumen: PgnResumenInversion[];
  detalle: PgnDetalleInversion[];
}



export interface PgnResumenSeguimiento {
  vigencia: string;
  periodo: string;
  total_apropiacion_vigente: number;
  total_compromisos: number;
  total_obligaciones: number;
  total_pagos: number;
  porcentaje_total_apropiacion_vigente: number;
  porcentaje_total_compromisos: number;
  porcentaje_total_obligaciones: number;
  porcentaje_total_pagos: number;

}

export interface PgnDetalleSeguimiento {
  vigencia: string;
  periodo: string;
  total_apropiacion_vigente: string;
  total_compromisos: number;
  total_obligaciones: number;
  total_pagos: number;
}


export interface PgnDatosSeguimientoResponse {
  resumen: PgnResumenSeguimiento[];
  detalle: PgnDetalleSeguimiento[];
}


export interface SgrRecaudoItem {
  mes: string;
  mineria_pbc: number;
  mineria_recaudo: number; 
  mineria_pbc20: number;
  mineria_recaudo_ad20: number;  
  mineria_pbc5: number;
  mineria_recaudo_ad5: number;  
  
  hidrocarburos_pbc: number;
  hidrocarburos_recaudo: number;
  hidrocarburos_pbc20: number;
  hidrocarburos_recaudo_ad20: number;
  hidrocarburos_pbc5: number;
  hidrocarburos_recaudo_ad5: number;  

}

export interface SgrPtoRecaudoItem {
  categoria: string;
  concepto: string;
  presupuesto_total_vigente: number;
  presupuesto_corriente: number;
  presupuesto_otros: number;
  caja_corriente_informada: number;
  caja_otros: number;
  caja_total: number;
  avance_iac_presupuesto: number;
}

export interface SgrResumenPtoRecaudoComparador {
  entidad1: SgrPtoRecaudoItem[];
  entidad2: SgrPtoRecaudoItem[];
}

export interface SgrRecaudoMensualSectorResumen {
  concepto: string;
  inversion_aforada: number;
  ahorro: number;
  administracion: number;
  no_aforado: number;
  otros: number;
  total: number;
  presupuesto_inversion: number;
  presupuesto_ahorro: number;
  presupuesto_otros: number;
}


export interface SgrRecaudoMensualDetallePeriodo {
  periodo: string;
  rc_inversion_aforada: number;
  rc_ahorro: number;
  rc_administracion: number;
  rc_no_aforado: number;
  rc_total: number;
  total_pbc: number;
  ro_inversion: number;
  ro_ahorro: number;
  ro_administracion: number;
  ro_no_aforado_otros: number;
  ro_total: number;
  observacion: string;
  total_distribuido: number;
}


	export interface SgrRecaudoMensualSectorDetallePeriodo {
  periodo: string;
  pbc_mineria: number;
  pbc_hidrocarburos: number;
  pbc_total: number;
  recaudo_mineria: number;
  recaudo_hidrocarburos: number;
  recaudo_total: number;
  variacion_mineria: number;
  variacion_hidrocarburos: number;
  variacion_total: number;

}

export interface SgrRecaudoMensualResponse {
  resumen: SgrRecaudoMensualSectorResumen[];
  detalle: SgrRecaudoMensualDetallePeriodo[];
  detallesector: SgrRecaudoMensualSectorDetallePeriodo[];
}

// ========== Alertas de Caja SGR Interfaces ==========
export interface AlertasCajaMonto {
  periodo: number;
  periodo_corto: string;
  id_concepto: number;
  presupuesto: number;
  recaudo: number;
  aprobaciones: number;
  recaudo_supera_aprobaciones: number;
}

export interface AlertasCajaEntidad {
  periodo: number;
  periodo_corto: string;
  id_concepto: number;
  codigo_spgr: string;
  entidades_no_caja: number;
  entidades_caja_compromisos_no_total: number;
  entidades_caja: number;
  entidades_total: number;
}

export interface AlertasCajaResponse {
  montos: AlertasCajaMonto[];
  entidades: AlertasCajaEntidad[];
}

// ========== Request Parameters Interfaces ==========
export interface DistribucionTotalParams {
  idVigencia?: number;
  idsFuente?: string;
  idsConcepto?: string;
  idsBeneficiario?: string;
  tipoEntidad?: string;
}

// ========== Geovisor Interfaces ==========
export interface GeovisorSgpItem {
  annio: number;
  id_concepto: string;
  concepto: string;
  total: number;
}

export interface GeovisorPgnItem {
  total_apropiacion_vigente: number;
  total_compromisos: number;
  total_obligaciones: number;
  total_pagos: number;
  porcentaje_total_apropiacion_vigente: number;
  porcentaje_total_compromisos: number;
  porcentaje_total_obligaciones: number;
  porcentaje_total_pagos: number;
}

export interface GeovisorSgrBeneficiados {
  dato_general_regional_depto: string;
  dato_general_adirectas_depto: string;
  dato_general_adirectas_municipio: string;
  dato_general_local_municipio: string;
}

export interface GeovisorBeneficiados {
  dato_general_depto: string;
  dato_general_municipio: string;
}

export interface ResumenGeovisor {
  sgr: SgrPtoRecaudoItem[];
  sgp: GeovisorSgpItem[];
  pgn: GeovisorPgnItem[];
  sgr_beneficiados?: GeovisorSgrBeneficiados[];
  sgp_beneficiados?: GeovisorBeneficiados[];
  pgn_beneficiados?: GeovisorBeneficiados[];
}

// ========== SGP Indígenas Interfaces ==========

export interface VigenciaSgpIndigena {
  id_vigencia: number;
  vigencia: string;
}

/** Elemento genérico de filtro (departamento, municipio o resguardo) de SGP Indígenas */
export interface EntidadSgpIndigena {
  codigo: string;
  nombre: string;
  orden: number;
}

/** Valor puntual (presupuesto o población) con su observación asociada */
export interface ResumenSgpIndigenaValor {
  PresupuestoDistribuido?: number;
  PoblacionCertificada?: number;
  Observacion: string;
}

export interface HistoricoPresupuestoSgpIndigena {
  Vigencia: number;
  PresupuestoDistribuido: number;
}

export interface HistoricoPoblacionSgpIndigena {
  Vigencia: number;
  PoblacionCertificada: number;
}

export interface ComparativoPresupuestoSgpIndigena {
  VigenciaActual: number;
  VigenciaAnterior: number;
  PresupuestoVigenciaActual: number;
  PresupuestoVigenciaAnterior: number;
  VariacionPesos: number;
  VariacionPorcentaje: number;
}

export interface ComparativoPoblacionSgpIndigena {
  VigenciaActual: number;
  VigenciaAnterior: number;
  PoblacionVigenciaActual: number;
  PoblacionVigenciaAnterior: number;
  VariacionPoblacion: number;
  VariacionPorcentaje: number;
}

export interface CantidadResguardosSgpIndigena {
  Vigencia: number;
  CantidadResguardosCertificados: number;
  Observacion: string;
}

export interface PoblacionIndigenaSgpIndigena {
  Vigencia: number;
  PoblacionTotalResguardosCertificados: number;
}

export interface ResumenGeneralSgpIndigenas {
  presupuesto: ResumenSgpIndigenaValor[];
  poblacion: ResumenSgpIndigenaValor[];
  historicoPresupuesto: HistoricoPresupuestoSgpIndigena[];
  historicoPoblacion: HistoricoPoblacionSgpIndigena[];
  comparativoPresupuesto: ComparativoPresupuestoSgpIndigena[];
  comparativoPoblacion: ComparativoPoblacionSgpIndigena[];
  cantidadResguardos: CantidadResguardosSgpIndigena[];
  poblacionIndigena: PoblacionIndigenaSgpIndigena[];
}

export interface DescargaDetalleSgpIndigenasParams {
  vigencias: string;
  codigoDepto?: string;
  departamento?: string;
  codigoMunicipio?: string;
  municipio?: string;
  codigoResguardo?: string;
  resguardo?: string;
}

// ========== SGR Distribución — Carga de insumos Interfaces ==========

export interface CargarInsumoDistribucionParams {
  idBienio: number;
  bienio: string;
  fuente: string;
  insumo: string;
  archivo: File;
}

export interface InsumoCargaResultado {
  fuente: string;
  insumo: string;
  nombreArchivo: string;
  version?: number;
  fechaCarga?: string;
  filas?: number;
  mensaje?: string;
}

export interface InsumoEstado {
  fuente: string;
  insumo: string;
  cargado: boolean;
  nombreArchivo?: string;
  version?: number;
  fechaCarga?: string;
}

// ========== SGR Distribución — Ejecución y corridas Interfaces ==========

export interface ChequeoItem {
  codigo: string;
  descripcion: string;
  resultado: 'ok' | 'advertencia' | 'error';
  detalle?: string;
}

export interface ResumenVerificacion {
  cuadraturaOk: boolean;
  chequeosTotales: number;
  chequeosOk: number;
  chequeos: ChequeoItem[];
}

export interface CorridaDistribucion {
  idCorrida: number;
  version: number;
  idBienio: number;
  bienio: string;
  fechaEjecucion: string;
  usuario: string;
  versionInsumos: string;
  versionParametros: string;
  hashResultados: string;
  estado: 'en_proceso' | 'exitosa' | 'con_diferencias' | 'fallida';
  esOficial: boolean;
  resumenVerificacion?: ResumenVerificacion;
  mensaje?: string;
}

export interface EjecucionEstado {
  idCorrida: number;
  estado: CorridaDistribucion['estado'];
  faseActual?: string;
  progreso?: number;
}

export interface TotalAsignacion {
  concepto: string;
  porcentaje: number;
  valor: number;
  isTotal?: boolean;
  esSubnivel?: boolean;
}

export interface DetalleCorrida {
  idCorrida: number;
  chequeos: ChequeoItem[];
  totales: TotalAsignacion[];
}

export type TipoSalidaCorrida = 'excel' | 'xml' | 'reporte';

// ========== SGR Distribución — Parámetros de cálculo Interfaces ==========

export interface ParametroValor {
  clave: string;
  etiqueta: string;
  valor: number | boolean;
  unidad?: '%' | 'factor' | 'pp' | 'flag';
  referenciaNormativa?: string;
}

export interface ConfigRedondeo {
  tipoSalida: 'PR' | 'PBC' | 'IAC' | 'desahorroFAE' | 'mayorRecaudo' | 'multas' | 'etnicas';
  etiqueta: string;
  decimales: 0 | 2;
  modo: 'redondeo' | 'truncamiento';
}

export interface ConjuntoParametros {
  idVersion: number;
  etiquetaVersion: string;      // p. ej. "P-v2"
  vigencia: string;             // p. ej. "2027-2028"
  fecha: string;
  autor: string;
  motivo?: string;
  porcentajes: ParametroValor[];
  ponderadores: ParametroValor[];
  umbrales: ParametroValor[];
  redondeo: ConfigRedondeo[];
}

@Injectable({
  providedIn: 'root'
})
export class SicodisApiService {
  private readonly baseUrl = 'https://sicodis.dnp.gov.co/apiws/ApiSicodisNew';
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Genera headers para evitar caché del navegador
   * @returns HttpHeaders con configuración anti-caché
   */
  private getNoCacheHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }

  private getAuthHeaders(): HttpHeaders {
  let headers = this.getNoCacheHeaders(); // tus headers anti-caché
  if (this.token) {
    headers = headers.set('Authorization', `Bearer ${this.token}`);
  }
  return headers;
}
  // ========== SGR Funcionamiento Methods ==========

  /**
   * Obtiene las siglas y diccionario de funcionamiento
   * @returns Observable con los datos de siglas y diccionario estructurados
   */
  funcionamientoSiglasDiccionario(): Observable<FuncionamientoSiglasDiccionario> {
    const siglasUrl = `${this.baseUrl}/sgrfun/siglas`;
    const diccionarioUrl = `${this.baseUrl}/sgrfun/diccionario`;

    // Headers para evitar caché del navegador
    const httpOptions = { headers: this.getNoCacheHeaders() };

    return forkJoin({
      siglas: this.http.get<SiglasItem[]>(siglasUrl, httpOptions),
      diccionario: this.http.get<DiccionarioItem[]>(diccionarioUrl, httpOptions)
    }).pipe(
      map(({ siglas, diccionario }) => ({
        diccionario: {
          data: diccionario || []
        },
        siglas: {
          data: siglas || []
        }
      }))
    );
  }

  /**
   * Obtiene solo las siglas de funcionamiento
   * @returns Observable con el array de siglas
   */
  getSiglasFuncionamiento(): Observable<SiglasItem[]> {
    const url = `${this.baseUrl}/sgrfun/siglas`;
    const httpOptions = { headers: this.getNoCacheHeaders() };
    return this.http.get<SiglasItem[]>(url, httpOptions);
  }

  /**
   * Obtiene solo el diccionario de funcionamiento
   * @returns Observable con el array de diccionario
   */
  getDiccionarioFuncionamiento(): Observable<DiccionarioItem[]> {
    const url = `${this.baseUrl}/sgrfun/diccionario`;
    const httpOptions = { headers: this.getNoCacheHeaders() };
    return this.http.get<DiccionarioItem[]>(url, httpOptions);
  }


  /**
   * Obtiene las vigencias registradas del SGR para funcionamiento
   * @returns Observable con el array de vigencias
   * @note Este endpoint puede tener restricciones CORS en desarrollo local
   */
  getSgrFunVigencias(): Observable<Vigencia[]> {
    const url = `${this.baseUrl}/sgrfun/vigencias`;
    return this.http.get<Vigencia[]>(url);
  }

  /**
   * Obtiene las fuentes de asignaciones del SGR Funcionamiento
   * @param id_vigencia - ID vigencia
   * @returns Observable con el array de fuentes de asignación
   */
  getFuentesAsignaciones(id_vigencia: number): Observable<FuenteAsignacion[]> {
    const url = `${this.baseUrl}/sgrfun/fuentes_asignaciones/${id_vigencia}`;
    return this.http.get<FuenteAsignacion[]>(url);
  }

  /**
   * Obtiene conceptos de funcionamiento para fuentes específicas
   * @param idsFuentes - IDs de fuentes separados por comas
   * @returns Observable con el array de conceptos
   */
  getConceptosFuentes(idsFuentes: string): Observable<ConceptoFuente[]> {
    const url = `${this.baseUrl}/sgrfun/conceptos_fuentes/${idsFuentes}`;
    return this.http.get<ConceptoFuente[]>(url);
  }

/**
   * Obtiene conceptos de funcionamiento para fuentes específicas
   * @param idsFuentes - IDs de fuentes separados por comas
   * @param idVigencia - ID de la vigencia
   * @returns Observable con el array de conceptos
   */
  getConceptosFuentesVigencia(idsFuentes: string, idVigencia: number): Observable<ConceptoFuente[]> {
    const url = `${this.baseUrl}/sgrfun/conceptos_fuentes_vigencia/${idsFuentes}/${idVigencia}`;
    return this.http.get<ConceptoFuente[]>(url);
  }

  /**
   * Obtiene las entidades asociadas a un concepto específico
   * @param idConcepto - ID del concepto
   * @returns Observable con el array de entidades
   */
  getEntidadesConceptos(idConcepto: number): Observable<EntidadConcepto[]> {
    const url = `${this.baseUrl}/sgrfun/entidades_conceptos/${idConcepto}`;
    return this.http.get<EntidadConcepto[]>(url);
  }

  /**
   * Obtiene las entidades asociadas a un concepto específico por Vigencia
   * @param idConcepto - ID del concepto
   * @param idVigencia - ID de la vigencia
   * @returns Observable con el array de entidades
   */
  getEntidadesConceptosVigencia(idConcepto: number, idVigencia: number): Observable<EntidadConcepto[]> {
    const url = `${this.baseUrl}/sgrfun/entidades_conceptos_vigencia/${idConcepto}/${idVigencia}`;
    return this.http.get<EntidadConcepto[]>(url);
  }

  /**
   * Obtiene las entidades de la comisión rectora del SGR
   * @returns Observable con el array de entidades de la comisión rectora del SGR
   */
  getEntidadesComisionRectora(): Observable<EntidadConcepto[]> {
    const url = `${this.baseUrl}/sgrfun/entidades_comisioncr`;
    return this.http.get<EntidadConcepto[]>(url);
  }


  /**
   * Obtiene los departamentos para fortalecimiento de funcionamiento
   * @returns Observable con el array de departamentos
   */
  getDepartamentosFuncionamiento(): Observable<DepartamentoFuncionamiento[]> {
    const url = `${this.baseUrl}/sgrfun/departamentos`;
    return this.http.get<DepartamentoFuncionamiento[]>(url);
  }

  /**
   * Obtiene los municipios por código de departamento
   * @param codigoDepto - Código del departamento
   * @returns Observable con el array de municipios
   */
  getMunicipiosPorDepartamento(codigoDepto: string): Observable<MunicipioFuncionamiento[]> {
    const url = `${this.baseUrl}/sgrfun/municipios_por_departamento/${codigoDepto}`;
    return this.http.get<MunicipioFuncionamiento[]>(url);
  }

  /**
   * Obtiene la distribución total del SGR Funcionamiento
   * @param params - Parámetros de filtrado opcionales
   * @returns Observable con el array de distribuciones
   */
  getDistribucionTotal(params?: DistribucionTotalParams): Observable<DistribucionTotal[]> {
    const url = `${this.baseUrl}/sgrfun/distribuciones/total`;
    let httpParams = new HttpParams();

    if (params) {
      if (params.idVigencia) httpParams = httpParams.set('idVigencia', params.idVigencia.toString());
      if (params.idsFuente) httpParams = httpParams.set('idsFuente', params.idsFuente);
      if (params.idsConcepto) httpParams = httpParams.set('idsConcepto', params.idsConcepto);
      if (params.idsBeneficiario) httpParams = httpParams.set('idsBeneficiario', params.idsBeneficiario);
      if (params.tipoEntidad) httpParams = httpParams.set('tipoEntidad', params.tipoEntidad);
    }

    // Combinar headers anti-caché con parámetros
    const httpOptions = { 
      headers: this.getNoCacheHeaders(),
      params: httpParams 
    };

    return this.http.get<DistribucionTotal[]>(url, httpOptions);
  }

  // ========== SGR General Methods ==========
  /**
   * Obtiene las fechas de corte y actualización para SGR
   * @returns Observable con el array de fechas
   */
  getSGRFechasActualizacionCorteRecaudoIAC(): Observable<SGRFechaActualizacionCorte[]> {
    const url = `${this.baseUrl}/sgr/fecha_actualizacion_corte`;
    return this.http.get<SGRFechaActualizacionCorte[]>(url);
  }

  getSGRFechasActualizacionCorteRecaudoIACVigencia(idvigencia : number): Observable<SGRFechaActualizacionCorte[]> {
    const url = `${this.baseUrl}/sgr/fecha_actualizacion_corte_vigencia`;
    return this.http.get<SGRFechaActualizacionCorte[]>(url, {
    params: { idvigencia }
    });    
  }

  /**
   * Obtiene las vigencias registradas del SGR
   * @returns Observable con el array de vigencias
   * @note Este endpoint puede tener restricciones CORS en desarrollo local
   */
  getSgrVigencias(): Observable<Vigencia[]> {
    const url = `${this.baseUrl}/sgr/vigencias`;
    return this.http.get<Vigencia[]>(url);
  }

  /**
   * Obtiene las vigencias registradas del SGR
   * @returns Observable con el array de vigencias
   * @note Este endpoint puede tener restricciones CORS en desarrollo local
   */
  getSgrVigenciasQa(): Observable<Vigencia[]> {
    const url = `${this.baseUrl}/sgr/vigenciasqa`;
    return this.http.get<Vigencia[]>(url);
  }

  /**
   * Obtiene las vigencias registradas del SGR
   * @returns Observable con el array de vigencias
   * @note Este endpoint puede tener restricciones CORS en desarrollo local
   */
  getVigenciasSgrPbc(): Observable<Vigencia[]> {
    const url = `${this.baseUrl}/sgr/vigenciaspbc`;
    return this.http.get<Vigencia[]>(url);
  }
  
  /**
   * Obtiene las vigencias registradas del SGR - producción
   * @returns Observable con el array de vigencias
   * @note Este endpoint puede tener restricciones CORS en desarrollo local
   */
  getVigenciasSgrPbcPrd(): Observable<Vigencia[]> {
    const url = `${this.baseUrl}/sgr/vigenciaspbcprd`;
    return this.http.get<Vigencia[]>(url);
  }
  
  /**
   * Obtiene las siglas y diccionario de sgr
   * @returns Observable con los datos de siglas y diccionario estructurados
   */
  getSgrSiglasDiccionario(): Observable<FuncionamientoSiglasDiccionario> {
    const siglasUrl = `${this.baseUrl}/sgr/siglas`;
    const diccionarioUrl = `${this.baseUrl}/sgr/diccionario`;

    // Headers para evitar caché del navegador
    const httpOptions = { headers: this.getNoCacheHeaders() };

    return forkJoin({
      siglas: this.http.get<SiglasItem[]>(siglasUrl, httpOptions),
      diccionario: this.http.get<DiccionarioItem[]>(diccionarioUrl, httpOptions)
    }).pipe(
      map(({ siglas, diccionario }) => ({
        diccionario: {
          data: diccionario || []
        },
        siglas: {
          data: siglas || []
        }
      }))
    );
  }

  /**
   * Obtiene los departamentos de SGR
   * @returns Observable con el array 
   */
  getSgrDepartamentos(): Observable<DepartamentoSgr[]> {
    const url = `${this.baseUrl}/sgr/departamentos`;
    return this.http.get<DepartamentoSgr[]>(url);
  }

  /**
   * Obtiene los municipios por código de departamento
   * @param codigoDepto - Código del departamento
   * @returns Observable con el array de municipios
   */
  getMunicipiosDepartamentosSgr(codigoDepto: string): Observable<MunicipioSgp[]> {
    const url = `${this.baseUrl}/sgR/municipios_departamentos/${codigoDepto}`;
    return this.http.get<MunicipioSgp[]>(url);
  }

  /**
   * Obtiene el resumen de PBC vs Recaudo
   * @param idvigencia - vigencia de consulta
   * @param codigoDepto - Código del departamento
   * @param codigoMunicipio - Código del municipio
   * @returns Observable con el resumen de participaciones
   */
  getSgrDetallePBCRecaudo(idvigencia : number, codigoDepto: string, codigoMunicipio: string): Observable<SgrRecaudoItem[]> {
    const url = `${this.baseUrl}/sgr/detalle_pbc_recaudo/${idvigencia }/${codigoDepto}/${codigoMunicipio}`;
    return this.http.get<SgrRecaudoItem[]>(url);
  }

    /**
   * Obtiene el archivo de resumen de PBC vs Recaudo
   * @param idvigencia - vigencia de consulta
   * @param codigoDepto - Código del departamento
   * @param codigoMunicipio - Código del municipio
   * @param vigencia - vigencia de consulta string
   * @param departamento - Nombre del departamento
   * @param municipio - Nombre del municipio
   * @returns Observable con el resumen de participaciones
   */
  getSgrDescargaDetallePBCRecaudo( idvigencia: number
                                   , codigoDepto: string
                                   , codigoMunicipio: string
                                   , vigencia: string
                                   , departamento: string
                                   , municipio: string
                                   , fecha_actualizacion: string
                                   , fecha_corte : string
                                                ): Observable<Blob> {  
    const url = `${this.baseUrl}/sgr/descarga_detalle_pbc_recaudo/${idvigencia}/${codigoDepto}/${codigoMunicipio}/${vigencia}/${departamento}/${municipio}/${fecha_actualizacion}/${fecha_corte}`;
    return this.http.get(url, { responseType: 'blob' });  // responseType 'blob' indica que será un archivo binario
  }


  /**
   * 
   * @returns Descarga del servicio el archivo excel de recaudo mensual
   */
  getSgrDescargaDetallePBCRecaudoMensual(): Observable<Blob> {  
    const url = `${this.baseUrl}/sgr/descarga_detalle_pbc_recaudo_mensual`;
    return this.http.get(url, { responseType: 'blob' });  // responseType 'blob' indica que será un archivo binario
  }

  /**
   * Obtiene el resumen de Presupuesto vs Recaudo
   * @param idvigencia - vigencia de consulta
   * @param codigoDepto - Código del departamento
   * @param codigoMunicipio - Código del municipio
   * @returns Observable con el resumen de participaciones
   */
  getSgrResumenPtoRecaudo(idvigencia : number, tipoConsulta: string, CodigoEntidad: string): Observable<SgrPtoRecaudoItem[]> {
    const url = `${this.baseUrl}/sgr/resumen_pto_recaudo/${idvigencia }/${tipoConsulta}/${CodigoEntidad}`;
    //return this.http.get<SgrPtoRecaudoItem[]>(url);
    const response$ = this.http.get<SgrPtoRecaudoItem[]>(url);

    response$.subscribe(data => {
      console.log('🟢 Lo que trajo el servicio:', data);
    });

    return response$;    
  }

  /**
   * Obtiene el resumen de Presupuesto vs Recaudo
   * @param idvigencia - vigencia de consulta
   * @param codigoDepto - Código del departamento
   * @param codigoMunicipio - Código del municipio
   * @returns Observable con el resumen de participaciones
   */
  getSgrResumenPtoRecaudoQA(idvigencia : number, tipoConsulta: string, CodigoEntidad: string): Observable<SgrPtoRecaudoItem[]> {
    const url = `${this.baseUrl}/sgr/resumen_pto_recaudoqa/${idvigencia }/${tipoConsulta}/${CodigoEntidad}`;
    //return this.http.get<SgrPtoRecaudoItem[]>(url);
    const response$ = this.http.get<SgrPtoRecaudoItem[]>(url);

    response$.subscribe(data => {
      console.log('🟢 Lo que trajo el servicio:', data);
    });

    return response$;    
  }

  /**
   * Obtiene el archivo de resumen de PBC vs Recaudo
   * @param idvigencia - vigencia de consulta
   * @param codigoDepto - Código del departamento
   * @param codigoMunicipio - Código del municipio
   * @param vigencia - vigencia de consulta string
   * @param departamento - Nombre del departamento
   * @param municipio - Nombre del municipio
   * @returns Observable con el resumen de participaciones
   */
  getSgrDescargaResumenPtoRecaudo( idvigencia: number
                                   , tipoConsulta: string
                                   , CodigoEntidad: string
                                   , vigencia: string
                                   , depto: string
                                   , municipio: string
                                   , fecha_actualizacion: string
                                   , fecha_corte : string
                                                ): Observable<Blob> {
    const url = `${this.baseUrl}/sgr/descarga_resumen_pto_recaudo/${idvigencia}/${tipoConsulta}/${CodigoEntidad}/${vigencia}/${depto}/${municipio}/${fecha_actualizacion}/${fecha_corte}`;
    return this.http.get(url, { responseType: 'blob' });  // responseType 'blob' indica que será un archivo binario
  }

  /**
   * Obtiene el resumen de presupuesto y recaudo comparador entre dos entidades
   * @param idVigencia - ID de la vigencia
   * @param tipoConsulta1 - Tipo de consulta para entidad 1 (por ahora 7)
   * @param codigoEntidad1 - Código del municipio o departamento 1
   * @param tipoConsulta2 - Tipo de consulta para entidad 2 (por ahora 7)
   * @param codigoEntidad2 - Código del municipio o departamento 2
   * @returns Observable con el comparativo de las dos entidades
   */
  getSgrResumenPtoRecaudoComparador(
    idVigencia: number,
    tipoConsulta1: number,
    codigoEntidad1: string,
    tipoConsulta2: number,
    codigoEntidad2: string
  ): Observable<SgrResumenPtoRecaudoComparador> {
    const url = `${this.baseUrl}/sgr/resumen_pto_recaudo_comparador/${idVigencia}/${tipoConsulta1}/${codigoEntidad1}/${tipoConsulta2}/${codigoEntidad2}`;
    return this.http.get<SgrResumenPtoRecaudoComparador>(url);
  }

    /**
   * Obtiene el archivo de resumen de PBC vs Recaudo
   * @param idvigencia - vigencia de consulta
   * @param codigoDepto - Código del departamento
   * @param codigoMunicipio - Código del municipio
   * @param vigencia - vigencia de consulta string
   * @param departamento - Nombre del departamento
   * @param municipio - Nombre del municipio
   * @returns Observable con el resumen de participaciones
   */
  getSgrDescargaResumenPtoRecaudoQA( idvigencia: number
                                   , tipoConsulta: string
                                   , CodigoEntidad: string
                                   , vigencia: string
                                   , depto: string
                                   , municipio: string
                                   , fecha_actualizacion: string
                                   , fecha_corte : string
                                                ): Observable<Blob> {  
    const url = `${this.baseUrl}/sgr/descarga_resumen_pto_recaudoqa/${idvigencia}/${tipoConsulta}/${CodigoEntidad}/${vigencia}/${depto}/${municipio}/${fecha_actualizacion}/${fecha_corte}`;
    return this.http.get(url, { responseType: 'blob' });  // responseType 'blob' indica que será un archivo binario
  }



/**
 * Consulta la información del recaudo mensual por id de vigencia
 * @param idvigencia id de la vigencia
 * @returns Observable con la información de recaudo mensual
 */
getSgrDetallePBCRecaudoMensual(idvigencia: number): Observable<SgrRecaudoMensualResponse> {
  const url = `${this.baseUrl}/sgr/resumen_pbc_recaudo_mensual/${idvigencia}`;
  return this.http.get<SgrRecaudoMensualResponse>(url);
}


/**
 * Descarga el archivo de recaudo mensual
 * @param idvigencia - Id de la vigencia
 * @param vigencia - vigencia texto
 * @param fecha_actualizacion - fecha de actualización de la información
 * @param fecha_corte - fecha de corte de la información
 * @returns Observable - Archivo
 */
getSgrDescargaResumenPbcRecaudoMensual( idvigencia: number
                                        , vigencia: string
                                        , fecha_actualizacion: string
                                        , fecha_corte : string
                                        ): Observable<Blob> {
    const url = `${this.baseUrl}/sgr/descarga_resumen_pbc_recaudo_mensual/${idvigencia}/${vigencia}/${fecha_actualizacion}/${fecha_corte}`;
    return this.http.get(url, { responseType: 'blob' });  // responseType 'blob' indica que será un archivo binario
  }

  // ========== SGR Plan Bienal Methods ==========

  /**
   * Obtiene las vigencias registradas del Plan Bienal de Caja
   * @returns Observable con el array de vigencias
   */
  getSgrPlanBienalVigencias(): Observable<VigenciaPlanBienal[]> {
    const url = `${this.baseUrl}/sgrplanbienal/vigencias`;
    return this.http.get<VigenciaPlanBienal[]>(url);
  }

  /**
   * Obtiene los departamentos para Plan Bienal de Caja
   * @returns Observable con el array de departamentos
   */
  getSgrPlanBienalDepartamentos(): Observable<DepartamentoPlanBienal[]> {
    const url = `${this.baseUrl}/sgrplanbienal/departamentos`;
    return this.http.get<DepartamentoPlanBienal[]>(url);
  }

  /**
   * Obtiene los municipios por código de departamento para Plan Bienal
   * @param codigoDepto - Código del departamento
   * @returns Observable con el array de municipios
   */
  getSgrPlanBienalMunicipiosDepartamento(codigoDepto: string): Observable<MunicipioPlanBienal[]> {
    const url = `${this.baseUrl}/sgrplanbienal/municipios_departamentos/${codigoDepto}`;
    return this.http.get<MunicipioPlanBienal[]>(url);
  }

  /**
   * Obtiene el detalle del Plan Bienal de Caja
   * @param idVigencia - ID de la vigencia
   * @param codigoEntidad - Código de la entidad (departamento)
   * @param codigoMunicipio - Código del municipio
   * @returns Observable con el array de detalles del plan bienal
   */
  getSgrPlanBienalDetalle(idVigencia: number, codigoEntidad: string, codigoMunicipio: string): Observable<DetallePlanBienal[]> {
    const url = `${this.baseUrl}/sgrplanbienal/detalle_planbienal/${idVigencia}/${codigoEntidad}/${codigoMunicipio}`;
    return this.http.get<DetallePlanBienal[]>(url);
  }

  /**
   * Genera y descarga en Excel el detalle del Plan Bienal de Caja del SGR.
   * @param params - Filtros de la consulta (vigencia, departamento y municipio)
   * @returns Observable con la respuesta HTTP que contiene el Blob del archivo .xlsx
   */
  getSgrPlanBienalDescargarDetalle(params: DescargaDetallePlanParams): Observable<HttpResponse<Blob>> {
    const segments = [
      params.idVigencia,
      params.vigencia,
      params.codigoDepto,
      params.departamento,
      params.codigoMunicipio,
      params.municipio
    ].map(s => encodeURIComponent(String(s))).join('/');
    const url = `${this.baseUrl}/sgrplanbienal/descarga_detalle_planbienal/${segments}`;
    return this.http.get(url, { responseType: 'blob', observe: 'response' });
  }

  getSgrPlanRecursosVigencias(): Observable<VigenciaPlanBienal[]> {
    const url = `${this.baseUrl}/sgrplanrecursos/vigencias`;
    return this.http.get<VigenciaPlanBienal[]>(url);
  }

  getSgrPlanRecursosDepartamentos(): Observable<DepartamentoPlanBienal[]> {
    const url = `${this.baseUrl}/sgrplanrecursos/departamentos`;
    return this.http.get<DepartamentoPlanBienal[]>(url);
  }

  getSgrPlanRecursosMunicipiosDepartamento(codigoDepto: string): Observable<MunicipioPlanBienal[]> {
    const url = `${this.baseUrl}/sgrplanrecursos/municipios_departamentos/${codigoDepto}`;
    return this.http.get<MunicipioPlanBienal[]>(url);
  }

  getSgrPlanRecursosDetalle(idVigencia: number, codigoEntidad: string, codigoMunicipio: string): Observable<DetallePlanRecursos[]> {
    const url = `${this.baseUrl}/sgrplanrecursos/detalle_planrecursos/${idVigencia}/${codigoEntidad}/${codigoMunicipio}`;
    return this.http.get<DetallePlanRecursos[]>(url);
  }

  /**
   * Genera y descarga en Excel el detalle del Plan de Recursos del SGR.
   * @param params - Filtros de la consulta (vigencia, departamento y municipio)
   * @returns Observable con la respuesta HTTP que contiene el Blob del archivo .xlsx
   */
  getSgrPlanRecursosDescargarDetalle(params: DescargaDetallePlanParams): Observable<HttpResponse<Blob>> {
    const segments = [
      params.idVigencia,
      params.vigencia,
      params.codigoDepto,
      params.departamento,
      params.codigoMunicipio,
      params.municipio
    ].map(s => encodeURIComponent(String(s))).join('/');
    const url = `${this.baseUrl}/sgrplanrecursos/descarga_detalle_planrecursos/${segments}`;
    return this.http.get(url, { responseType: 'blob', observe: 'response' });
  }

  /**
   * Obtiene los insumos del boletín de alertas de caja del SGR
   * Incluye información sobre recaudo, aprobaciones y estado de entidades
   * @returns Observable con los datos de montos y entidades para alertas de caja
   */
  getSgrInsumosBoletinAlertas(): Observable<AlertasCajaResponse> {
    const url = `${this.baseUrl}/sgr/insumos_boletin_alerta`;
    return this.http.get<AlertasCajaResponse>(url);
  }

  // ========== SGP Methods ==========


  /**
   * Obtiene las vigencias de SGP
   * @returns Observable con el array de vigencias de presupuesto
   */
  getSgpVigencias(): Observable<VigenciaSgp[]> {
    const url = `${this.baseUrl}/sgp/vigencias`;
    return this.http.get<VigenciaSgp[]>(url);
  }


/**
   * Obtiene los departamentos de SGP
   * @returns Observable con el array 
   */
  getSgpDepartamentos(): Observable<DepartamentoSgp[]> {
    const url = `${this.baseUrl}/sgp/departamentos`;
    return this.http.get<DepartamentoSgp[]>(url);
  }

  /**
   * Obtiene los municipios por código de departamento
   * @param codigoDepto - Código del departamento
   * @returns Observable con el array de municipios
   */
  getMunicipiosDepartamentosSgp(codigoDepto: string): Observable<MunicipioSgp[]> {
    const url = `${this.baseUrl}/sgp/municipios_departamentos/${codigoDepto}`;
    return this.http.get<MunicipioSgp[]>(url);
  }


  /**
   * Obtiene el resumen general del SGP para un año específico
   * @param anio - Año de consulta
   * @returns Observable con el resumen general
   */
  getSgpResumenGeneral(anio: number): Observable<ResumenGeneral> {
    const url = `${this.baseUrl}/sgp/resumen_general/${anio}`;
    return this.http.get<ResumenGeneral>(url);
  }

  /**
   * Obtiene el resumen de participaciones del SGP
   * @param anio - Año de consulta
   * @param codigoDepto - Código del departamento
   * @param codigoMunicipio - Código del municipio
   * @returns Observable con el resumen de participaciones
   */
  getSgpResumenParticipaciones(anio: number, codigoDepto: string, codigoMunicipio: string): Observable<ResumenParticipaciones> {
    const url = `${this.baseUrl}/sgp/resumen_participaciones/${anio}/${codigoDepto}/${codigoMunicipio}`;
    return this.http.get<ResumenParticipaciones>(url);
  }

  /**
   * Retorna el avance por sectors importantes basado en el presupuesto.
   * @param anio 
   * @param codigoDepto 
   * @param codigoMunicipio 
   * @returns 
   */
  getSgpResumenParticipacionesAvance(anio: number): Observable<ResumenParticipacionesAvance> {
    const url = `${this.baseUrl}/sgp/resumen_participaciones_avance/${anio}`;
    return this.http.get<ResumenParticipacionesAvance>(url);
  }


  /**
   * Obtiene el resumen de distribuciones del SGP para un año específico
   * @param anio - Año de consulta
   * @returns Observable con el resumen de distribuciones
   */
  getSgpResumenDistribuciones(anio: number): Observable<ResumenDistribuciones[]> {
    const url = `${this.baseUrl}/sgp/resumen_distribuciones/${anio}`;
    return this.http.get<ResumenDistribuciones[]>(url);
  }

   /**
   * Obtiene los datos de resumen y detalle de regionaización dados unos parámetros
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @param codigo_dane_depto - Código del departamento
   * @param id_fuente - Código de la fuente
   * @returns Observable con las fuentes para la vigencia y periodo seleccionados, así como el departamento y la fuente.
   */
  getSgpDescargaDatosSgpResumenParticipaciones( anio: number
                                                , codigoDepto: string
                                                , codigoMunicipio: string
                                                , departamento: string
                                                , municipio: string
                                                ): Observable<Blob> {  
    const url = `${this.baseUrl}/sgp/archivo_resumen_participaciones/${anio}/${codigoDepto}/${codigoMunicipio}/${departamento}/${municipio}`;
    return this.http.get(url, { responseType: 'blob' });  // responseType 'blob' indica que será un archivo binario
  }




  /**
   * Obtiene el listado de archivos de la distribución
   * @param id_distribucion - dsitribucion
   * @returns Observable con el resumen de distribuciones
   */
  getSgpResumenDistribucionesListaArchivos(id_distribucion: number): Observable<ResumenDistribucionesArchivo[]> {
    const url = `${this.baseUrl}/sgp/resumen_distribuciones_lista_archivos/${id_distribucion}`;
    return this.http.get<ResumenDistribucionesArchivo[]>(url);
  }




  /**
   * Obtiene el resumen de participaciones de distribución específica
   * @param idDistribucion - ID de la distribución
   * @param codigoDepto - Código del departamento
   * @param codigoMunicipio - Código del municipio
   * @returns Observable con el resumen de participaciones de distribución
   */
  getSgpResumenParticipacionesDistribucion(idDistribucion: number, codigoDepto: string, codigoMunicipio: string): Observable<ResumenParticipaciones[]> {
    const url = `${this.baseUrl}/sgp/resumen_participaciones_distribucion/${idDistribucion}/${codigoDepto}/${codigoMunicipio}`;
    return this.http.get<ResumenParticipaciones[]>(url);
  }

  /**
   * Obtiene el resumen histórico de precios corrientes y constantes del SGP
   * @param params - Parámetros opcionales incluyendo años específicos
   * @returns Observable con el array de datos históricos
   */
  getSgpResumenHistorico(params?: ResumenHistoricoParams): Observable<ResumenHistorico[]> {
    const url = `${this.baseUrl}/sgp/resumen_historico_corrientes_constantes`;
    let httpParams = new HttpParams();

    if (params?.anios) {
      httpParams = httpParams.set('anios', params.anios);
    }

    return this.http.get<ResumenHistorico[]>(url, { params: httpParams });
  }

  /**
   * Obtiene el resumen histórico de precios corrientes y constantes del SGP por entidad
   * @param params - Parámetros opcionales incluyendo años, código de departamento y municipio
   * @returns Observable con el array de datos históricos por entidad
   */
  getSgpResumenHistoricoEntidad(params?: ResumenHistoricoEntidadParams): Observable<ResumenHistoricoEntidad[]> {
    const url = `${this.baseUrl}/sgp/resumen_historico_corrientes_constantes_entidad`;
    let httpParams = new HttpParams();

    if (params?.anios) {
      httpParams = httpParams.set('anios', params.anios);
    }
    if (params?.codigoDepto) {
      httpParams = httpParams.set('codigoDepto', params.codigoDepto);
    }
    if (params?.codigoMunicipio) {
      httpParams = httpParams.set('codigoMunicipio', params.codigoMunicipio);
    }

    return this.http.get<ResumenHistoricoEntidad[]>(url, { params: httpParams });
  }

  /**
   * Obtiene el archivo del resumen histórico de precios corrientes y constantes del SGP por entidad
   * @param params - Parámetros opcionales incluyendo años, código de departamento y municipio
   * @returns Observable con el array de datos históricos por entidad
   */
  getSgpDescargaResumenHistoricoEntidad(params?: ResumenHistoricoEntidadParams): Observable<Blob> {

    const url = `${this.baseUrl}/sgp/archivo_resumen_historico_corrientes_constantes_entidad`;

    let httpParams = new HttpParams();

    if (params?.anios) {
      httpParams = httpParams.set('anios', params.anios);
    }
    if (params?.codigoDepto) {
      httpParams = httpParams.set('codigoDepto', params.codigoDepto);
    }
    if (params?.departamento) {
      httpParams = httpParams.set('departamento', params.departamento);
    }    
    if (params?.codigoMunicipio) {
      httpParams = httpParams.set('codigoMunicipio', params.codigoMunicipio);
    }

    if (params?.municipio) {
      httpParams = httpParams.set('municipio', params.municipio);
    }        
    return this.http.get(url, { 
      params: httpParams, 
      responseType: 'blob' 
    });
  }


  /**
   * Descarga un archivo del SGP por su ID
   * @param idArchivo - ID del archivo a descargar
   * @returns Observable con los datos del archivo
   */
  // getSgpDescargarArchivo(idArchivo: number): Observable<Blob> {
  //   const url = `${this.baseUrl}/sgp/descargararchivo/${idArchivo}`;
  //   return this.http.get(url, {
  //     responseType: 'blob'
  //   });
  // }

  getSgpDescargarArchivo(idArchivo: number): Observable<HttpResponse<Blob>> {
    const url = `${this.baseUrl}/sgp/descargararchivo/${idArchivo}`;
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response'
    });
  }
  

  /**
   * Obtiene las vigencias de presupuesto de la última once del SGP
   * @returns Observable con el array de vigencias de presupuesto
   */
  getSgpVigenciasPresupuestoUltimaOnce(): Observable<VigenciaPresupuesto[]> {
    const url = `${this.baseUrl}/sgp/vigenciasPresupuestoUltimaOnce`;
    return this.http.get<VigenciaPresupuesto[]>(url);
  }

  /**
   * Obtiene el resumen general de la última once del SGP
   * @param idVigencia - ID de la vigencia
   * @param codigoDepto - Código del departamento
   * @param codigoMunicipio - Código del municipio
   * @returns Observable con el resumen de la última once
   */
  getSgpResumenGeneralUltimaOnce(idVigencia: number, codigoDepto: string, codigoMunicipio: string): Observable<ResumenUltimaOnce> {
    const url = `${this.baseUrl}/sgp/resumen_general_ultima_once/${idVigencia}/${codigoDepto}/${codigoMunicipio}`;
    return this.http.get<ResumenUltimaOnce>(url);
  }

  // ========== SGP Indígenas Methods (Resguardos - AESGPRI) ==========

  /**
   * Obtiene el listado de vigencias registradas para SGP Indígenas
   * @returns Observable con el array de vigencias
   */
  getSgpIndigenasVigencias(): Observable<VigenciaSgpIndigena[]> {
    const url = `${this.baseUrl}/sgpindigenas/vigencias`;
    return this.http.get<VigenciaSgpIndigena[]>(url, { headers: this.getNoCacheHeaders() });
  }

  /**
   * Obtiene el listado de departamentos registrados para SGP Indígenas
   * @param vigencias - Vigencias separadas por coma (opcional)
   * @returns Observable con el array de departamentos (incluye la opción "Todos" con código "0")
   */
  getSgpIndigenasDepartamentos(vigencias?: string): Observable<EntidadSgpIndigena[]> {
    const url = `${this.baseUrl}/sgpindigenas/departamentos`;
    let httpParams = new HttpParams();
    if (vigencias) {
      httpParams = httpParams.set('vigencias', vigencias);
    }
    return this.http.get<EntidadSgpIndigena[]>(url, { params: httpParams, headers: this.getNoCacheHeaders() });
  }

  /**
   * Obtiene el listado de municipios registrados para SGP Indígenas
   * @param vigencias - Vigencias separadas por coma (opcional)
   * @param codigoDepto - Código de departamento de 5 dígitos, ej. "91000" (opcional)
   * @returns Observable con el array de municipios (incluye la opción "Todos" con código "0")
   */
  getSgpIndigenasMunicipios(vigencias?: string, codigoDepto?: string): Observable<EntidadSgpIndigena[]> {
    const url = `${this.baseUrl}/sgpindigenas/municipios`;
    let httpParams = new HttpParams();
    if (vigencias) {
      httpParams = httpParams.set('vigencias', vigencias);
    }
    if (codigoDepto) {
      httpParams = httpParams.set('codigoDepto', codigoDepto);
    }
    return this.http.get<EntidadSgpIndigena[]>(url, { params: httpParams, headers: this.getNoCacheHeaders() });
  }

  /**
   * Obtiene el listado de resguardos indígenas
   * @param vigencias - Vigencias separadas por coma (opcional)
   * @param codigoDepto - Código de departamento de 5 dígitos (opcional)
   * @param codigoMunicipio - Código de municipio de 5 dígitos, ej. "91001" (opcional)
   * @returns Observable con el array de resguardos (incluye la opción "Todos" con código "0")
   */
  getSgpIndigenasResguardos(vigencias?: string, codigoDepto?: string, codigoMunicipio?: string): Observable<EntidadSgpIndigena[]> {
    const url = `${this.baseUrl}/sgpindigenas/resguardos`;
    let httpParams = new HttpParams();
    if (vigencias) {
      httpParams = httpParams.set('vigencias', vigencias);
    }
    if (codigoDepto) {
      httpParams = httpParams.set('codigoDepto', codigoDepto);
    }
    if (codigoMunicipio) {
      httpParams = httpParams.set('codigoMunicipio', codigoMunicipio);
    }
    return this.http.get<EntidadSgpIndigena[]>(url, { params: httpParams, headers: this.getNoCacheHeaders() });
  }

  /**
   * Obtiene el consolidado de SGP Indígenas: presupuesto y población distribuidos,
   * con su histórico y comparativo de vigencias
   * @param vigencias - Vigencias separadas por coma (REQUERIDO por el backend)
   * @param codigoDepto - Código de departamento (default "0" = Todos)
   * @param codigoMunicipio - Código de municipio (default "0" = Todos)
   * @param codigoResguardo - Código de resguardo (default "0" = Todos)
   * @returns Observable con el resumen general
   */
  getSgpIndigenasResumenGeneral(
    vigencias: string,
    codigoDepto: string = '0',
    codigoMunicipio: string = '0',
    codigoResguardo: string = '0'
  ): Observable<ResumenGeneralSgpIndigenas> {
    const url = `${this.baseUrl}/sgpindigenas/resumen_general`;
    const httpParams = new HttpParams()
      .set('vigencias', vigencias)
      .set('codigoDepto', codigoDepto)
      .set('codigoMunicipio', codigoMunicipio)
      .set('codigoResguardo', codigoResguardo);
    return this.http.get<ResumenGeneralSgpIndigenas>(url, { params: httpParams, headers: this.getNoCacheHeaders() });
  }

  /**
   * Genera y descarga en Excel el detalle de registros de SGP Indígenas
   * @param params - Filtros de la consulta (vigencias es requerido; codigoDepto debe ser distinto de "0")
   * @returns Observable con la respuesta HTTP que contiene el Blob del archivo .xlsx
   */
  getSgpIndigenasDescargarDetalle(params: DescargaDetalleSgpIndigenasParams): Observable<HttpResponse<Blob>> {
    const url = `${this.baseUrl}/sgpindigenas/descargar-detalle`;
    let httpParams = new HttpParams().set('vigencias', params.vigencias);
    if (params.codigoDepto) httpParams = httpParams.set('codigoDepto', params.codigoDepto);
    if (params.departamento) httpParams = httpParams.set('departamento', params.departamento);
    if (params.codigoMunicipio) httpParams = httpParams.set('codigoMunicipio', params.codigoMunicipio);
    if (params.municipio) httpParams = httpParams.set('municipio', params.municipio);
    if (params.codigoResguardo) httpParams = httpParams.set('codigoResguardo', params.codigoResguardo);
    if (params.resguardo) httpParams = httpParams.set('resguardo', params.resguardo);
    return this.http.get(url, { params: httpParams, responseType: 'blob', observe: 'response' });
  }

  /**
   * Obtiene el resumen de participaciones de la última once del SGP
   * @param idVigencia - ID de la vigencia
   * @param codigoDepto - Código del departamento
   * @param codigoMunicipio - Código del municipio
   * @returns Observable con el resumen de participaciones de la última once
   */
  getSgpResumenParticipacionesUltimaOnce(idVigencia: number, codigoDepto: string, codigoMunicipio: string): Observable<ResumenParticipacionesUltimaOnce> {
    const url = `${this.baseUrl}/sgp/resumen_participaciones_ultima_once/${idVigencia}/${codigoDepto}/${codigoMunicipio}`;
    return this.http.get<ResumenParticipacionesUltimaOnce>(url);
  }


  /**
   * Obtiene el resumen de participaciones de la última once del SGP
   * @param idVigencia - ID de la vigencia
   * @param codigoDepto - Código del departamento
   * @param codigoMunicipio - Código del municipio
   * @param departamento - Departamento
   * @param municipio - Municipio
   * @returns Observable con el resumen de participaciones de la última once
   */
  getSgpDescargarResumenParticipacionesUltimaOnce( idvigencia: number
                                                , vigencia: string
                                                , codigoDepto: string
                                                , codigoMunicipio: string
                                                , departamento: string
                                                , municipio: string
                                                ): Observable<Blob> {  
    const url = `${this.baseUrl}/sgp/archivo_resumen_participaciones_ultima_once/${idvigencia}/${vigencia}/${codigoDepto}/${codigoMunicipio}/${departamento}/${municipio}`;
    return this.http.get(url, { responseType: 'blob' });  // responseType 'blob' indica que será un archivo binario
  }




  /**
   * Obtiene la ficha comparativa entre dos entidades del SGP
   * @param idVigencia - ID de la vigencia
   * @param codigoDepto1 - Código depto de la primera entidad
   * @param codigoEntidad1 - Código de la primera entidad
   * @param codigoDepto2 - Código depto de la segunda entidad 
   * @param codigoEntidad2 - Código de la segunda entidad
   * @returns Observable con la ficha comparativa de las entidades
   */
  getSgpFichaComparativaEntidad(idVigencia: number, codigoDepto1: string, codigoEntidad1: string, codigoDepto2: string, codigoEntidad2: string): Observable<FichaComparativaEntidad[]> {
    const url = `${this.baseUrl}/sgp/ficha_comparativa_entidad/${idVigencia}/${codigoDepto1}/${codigoEntidad1}/${codigoDepto2}/${codigoEntidad2}`;
    return this.http.get<FichaComparativaEntidad[]>(url);
  }

  /**
   * Descarga el archivo Excel de la ficha comparativa entre dos entidades del SGP
   * @param idVigencia - ID de la vigencia
   * @param codigoDepto1 - Código depto de la primera entidad
   * @param codigoEntidad1 - Código de la primera entidad
   * @param codigoDepto2 - Código depto de la segunda entidad
   * @param codigoEntidad2 - Código de la segunda entidad
   * @param depto1 - Nombre del departamento de la primera entidad
   * @param entidad1 - Nombre de la primera entidad
   * @param depto2 - Nombre del departamento de la segunda entidad
   * @param entidad2 - Nombre de la segunda entidad
   * @returns Observable con el archivo binario (Excel)
   */
  getSgpDescargarFichaComparativaEntidad(idVigencia: number, codigoDepto1: string, codigoEntidad1: string, codigoDepto2: string, codigoEntidad2: string, depto1: string, entidad1: string, depto2: string, entidad2: string): Observable<Blob> {
    const url = `${this.baseUrl}/sgp/archivo_ficha_comparativa_entidad/${idVigencia}/${codigoDepto1}/${codigoEntidad1}/${codigoDepto2}/${codigoEntidad2}/${depto1}/${entidad1}/${depto2}/${entidad2}`;
    return this.http.get(url, { responseType: 'blob' });  // responseType 'blob' indica que será un archivo binario
  }

  /**
   * Obtiene la ficha municipal del SGP (vigencia actual frente a la anterior)
   * @param codigoDane - Código DANE del municipio (5 dígitos)
   * @returns Observable con la ficha completa agrupada por concepto
   */
  getSgpFichaMunicipio(codigoDane: string): Observable<FichaSgp> {
    const url = `${this.baseUrl}/sgp/ficha/${codigoDane}`;
    return this.http.get<FichaSgp>(url);
  }

// ========== PGN Methods ==========  

  /**
   * Obtiene las vigencias de presupuesto para PGN
   * @returns Observable con el array de vigencias de presupuesto
   */
  getPgnVigencias(): Observable<VigenciaPgn[]> {
    const url = `${this.baseUrl}/pgn/vigencias`;
    return this.http.get<VigenciaPgn[]>(url);
  }

  /**
   * Obtiene el periodo de PGN para un año específico
   * @param id_vigencia - Año de consulta
   * @returns Observable con los periodos del año
   */
  getPgnPeriodoPorVigencia(id_vigencia : string): Observable<PeriodoPgn[]> {
    const url = `${this.baseUrl}/pgn/periodos_por_vigencia/${id_vigencia}`;
    return this.http.get<PeriodoPgn[]>(url);
  }

  /**
   * Obtiene los departamentos para regionalización de acuerdo con la vigencia y periodo para asegurar que hay resultados
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @returns Observable con los periodos para la vigencia y periodo seleccionados
   */
  getPgnDepartamentosPorVigenciaPeriodo(id_vigencia : string, id_periodo  : string): Observable<DepartamentoPgn[]> {
    const url = `${this.baseUrl}/pgn/departamentos_por_vigencia_periodo/${id_vigencia}/${id_periodo}`;
    return this.http.get<DepartamentoPgn[]>(url);
  }  

  /**
   * Obtiene los departamentos para regionalización de acuerdo con la vigencia y periodo para asegurar que hay resultados
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @param codigo_region - Región de consulta
   * @returns Observable con los periodos para la vigencia y periodo seleccionados
   */
  getPgnDepartamentosPorVigenciaPeriodoRegion(id_vigencia : string, id_periodo  : string, codigo_region :  string): Observable<DepartamentoPgn[]> {
    const url = `${this.baseUrl}/pgn/departamentos_por_vigencia_periodo_region/${id_vigencia}/${id_periodo}/${codigo_region}`;
    return this.http.get<DepartamentoPgn[]>(url);
  }  


  /**
   * Obtiene las fuentes para regionalización de acuerdo con la vigencia y periodo para asegurar que hay resultados
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @returns Observable con las fuentes para la vigencia y periodo seleccionados
   */
  getPgnFuentesPorVigenciaPeriodo(id_vigencia : string, id_periodo  : string): Observable<FuentePgn[]> {
    const url = `${this.baseUrl}/pgn/fuentes_por_vigencia_periodo/${id_vigencia}/${id_periodo}`;
    return this.http.get<FuentePgn[]>(url);
  }    


   /**
   * Obtiene los datos de resumen y detalle de regionaización dados unos parámetros
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @param codigo_dane_depto - Código del departamento
   * @param id_fuente - Código de la fuente
   * @returns Observable con las fuentes para la vigencia y periodo seleccionados, así como el departamento y la fuente.
   */
  getPgnDatosRegionalizacionPorVigenciaPeriodo(id_vigencia : string
                                              , id_periodo  : string
                                              , codigo_dane_depto  : string
                                              , id_fuente  : string): Observable<PgnDatosRegionalizacionResponse> {
    const url = `${this.baseUrl}/pgn/datosregionalizacion_por_vigencia_periodo/${id_vigencia}/${id_periodo}/${codigo_dane_depto}/${id_fuente}`;
    return this.http.get<PgnDatosRegionalizacionResponse>(url);
  } 


  

   /**
   * Obtiene los datos de resumen y detalle de regionaización dados unos parámetros
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @param codigo_dane_depto - Código del departamento
   * @param id_fuente - Código de la fuente
   * @returns Observable con las fuentes para la vigencia y periodo seleccionados, así como el departamento y la fuente.
   */
  getPgnDescargaDatosRegionalizacionPorVigenciaPeriodo( id_vigencia: string,
                                                        id_periodo: string,
                                                        codigo_dane_depto: string,
                                                        id_fuente: string
                                                      ): Observable<Blob> {  
    const url = `${this.baseUrl}/pgn/descargadatosregionalizacion_por_vigencia_periodo/${id_vigencia}/${id_periodo}/${codigo_dane_depto}/${id_fuente}`;
    return this.http.get(url, { responseType: 'blob' });  // responseType 'blob' indica que será un archivo binario
  }



  /**
   * Obtiene los sectores reporte de PGN por sectores de acuerdo con la vigencia y periodo para asegurar que hay resultados
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @returns Observable con las fuentes para la vigencia y periodo seleccionados
   */
  getPgnSectoresPorVigenciaPeriodo(id_vigencia : string, id_periodo  : string): Observable<SectorPgn[]> {
    const url = `${this.baseUrl}/pgn/sectores_por_vigencia_periodo/${id_vigencia}/${id_periodo}`;
    return this.http.get<SectorPgn[]>(url);
  }   



  /**
   * Obtiene las entidades para los sectores para el reporte de PGN 
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @param id_sector  - Id sector
   * @returns Observable con las fuentes para la vigencia y periodo seleccionados
   */
  getPgnEntidadesPorVigenciaPeriodoSector(id_vigencia : string, id_periodo  : string, id_sector :  number): Observable<EntidadPgn[]> {
    const url = `${this.baseUrl}/pgn/entidades_por_vigencia_periodo_sector/${id_vigencia}/${id_periodo}/${id_sector}`;
    return this.http.get<EntidadPgn[]>(url);
  }  

  /**
   * Obtiene las entidades para los sectores para el reporte de PGN 
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @param id_sector  - Id sector
   * @param codigo_entidad  - Código de la entidad
   * @returns Observable con las fuentes para la vigencia y periodo seleccionados
   */
  getPgnProyectosEntidadPorVigenciaPeriodoSector(id_vigencia : string
                                                , id_periodo  : string
                                                , id_sector :  number
                                                , codigo_entidad : string ): Observable<ProyectoPgn[]> {
    const url = `${this.baseUrl}/pgn/proyectos_entidad_por_vigencia_periodo_sector/${id_vigencia}/${id_periodo}/${id_sector}/${codigo_entidad}`;
    return this.http.get<ProyectoPgn[]>(url);
  } 

  /**
   * Obtiene las entidades para los sectores para el reporte de PGN 
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @param id_sector  - Id sector
   * @param codigo_entidad  - Código de la entidad
   * @param bpin  - Bpin del proyecto
   * @param id_fuente - Código de la fuente* 
   * @returns Observable con los datos de inversión
   */
  getPgnDatosInversionFuenteProyectosEntidadPorVigenciaPeriodoSector(id_vigencia : string
                                                                    , id_periodo  : string
                                                                    , id_sector :  number
                                                                    , codigo_entidad : string 
                                                                    , bpin : string 
                                                                    , id_fuente : string ): Observable<PgnDatosInversionResponse> {
    const url = `${this.baseUrl}/pgn/datosinversion_fuente_proyectos_entidad_por_vigencia_periodo_sector/${id_vigencia}/${id_periodo}/${id_sector}/${codigo_entidad}/${bpin}/${id_fuente}`;
    return this.http.get<PgnDatosInversionResponse>(url);
  } 


  /**
   * Obtiene las entidades para los sectores para el reporte de PGN 
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @param id_sector  - Id sector
   * @param codigo_entidad  - Código de la entidad
   * @param bpin  - Bpin del proyecto
   * @param id_fuente - Código de la fuente* 
   * @returns Observable con los datos de inversión
   */
  getPgnDescargaDatosInversionFuenteProyectosEntidadPorVigenciaPeriodoSector(id_vigencia : string
                                                                            , id_periodo  : string
                                                                            , id_sector :  number
                                                                            , codigo_entidad : string 
                                                                            , bpin : string 
                                                                            , id_fuente : string ): Observable<Blob> {
    const url = `${this.baseUrl}/pgn/descargadatosinversion_fuente_proyectos_entidad_por_vigencia_periodo_sector/${id_vigencia}/${id_periodo}/${id_sector}/${codigo_entidad}/${bpin}/${id_fuente}`;
    return this.http.get(url, { responseType: 'blob' });  // responseType 'blob' indica que será un archivo binario
  } 


  /**
   * Obtiene las regiones  para PGN seguimiento de acuerdo con la vigencia y periodo para asegurar que hay resultados
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @returns Observable con las regiones para la vigencia y periodo seleccionados
   */
  getPgnRegionesPorVigenciaPeriodo(id_vigencia : string, id_periodo  : string): Observable<RegionPgn[]> {
    const url = `${this.baseUrl}/pgn/regiones_por_vigencia_periodo/${id_vigencia}/${id_periodo}`;
    return this.http.get<RegionPgn[]>(url);
  }  



   /**
   * Obtiene los datos de resumen y detalle de regionaización dados unos parámetros
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @param codigo_region - Código de la región
   * @param codigo_dane_depto - Código del departamento
   * @param id_fuente - Código de la fuente
   * @returns Observable con las datos  para la vigencia y periodo, región seleccionados, así como el departamento y la fuente.
   */
  getPgnDatosSeguimientoPorVigenciaPeriodo(id_vigencia : string
                                              , id_periodo  : string
                                              , codigo_region :  string
                                              , codigo_dane_depto  : string
                                              , id_fuente  : string): Observable<PgnDatosRegionalizacionResponse> {
    const url = `${this.baseUrl}/pgn/datosseguimiento_por_vigencia_periodo_region_depto_fuente/${id_vigencia}/${id_periodo}/${codigo_region}/${codigo_dane_depto}/${id_fuente}`;
    return this.http.get<PgnDatosRegionalizacionResponse>(url);
  }   



   /**
   * Obtiene los datos de resumen y detalle de regionaización dados unos parámetros
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @param codigo_region - Código de la región
   * @param codigo_dane_depto - Código del departamento
   * @param id_fuente - Código de la fuente
   * @returns Observable con las datos  para la vigencia y periodo, región seleccionados, así como el departamento y la fuente.
   */
  getPgnDescargaDatoSeguimientoPorVigenciaPeriodoRegionDeptoFuente(id_vigencia : string
                                                                  , id_periodo  : string
                                                                  , codigo_region :  string
                                                                  , codigo_dane_depto  : string
                                                                  , id_fuente  : string): Observable<Blob> {
    const url = `${this.baseUrl}/pgn/descargadatosseguimiento_por_vigencia_periodo_region_depto_fuente/${id_vigencia}/${id_periodo}/${codigo_region}/${codigo_dane_depto}/${id_fuente}`;
    return this.http.get(url, { responseType: 'blob' });  // responseType 'blob' indica que será un archivo binario
  }



  // ========== PGN Programación (pgnprog) Methods ==========
  // Controlador paralelo a pgn/* pero sobre el presupuesto de PROGRAMACIÓN.
  // Reutiliza las mismas interfaces de pgn/* porque las estructuras de respuesta son idénticas.

  /**
   * Obtiene las vigencias de programación para PGN
   * @returns Observable con el array de vigencias de programación
   */
  getPgnProgVigencias(): Observable<VigenciaPgn[]> {
    const url = `${this.baseUrl}/pgnprog/vigencias`;
    return this.http.get<VigenciaPgn[]>(url);
  }

  /**
   * Obtiene los periodos de programación de PGN para una vigencia específica
   * @param id_vigencia - Año de consulta
   * @returns Observable con los periodos del año
   */
  getPgnProgPeriodoPorVigencia(id_vigencia : string): Observable<PeriodoPgn[]> {
    const url = `${this.baseUrl}/pgnprog/periodos_por_vigencia/${id_vigencia}`;
    return this.http.get<PeriodoPgn[]>(url);
  }

  /**
   * Obtiene los departamentos para regionalización de programación según vigencia y periodo
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @returns Observable con los departamentos para la vigencia y periodo seleccionados
   */
  getPgnProgDepartamentosPorVigenciaPeriodo(id_vigencia : string, id_periodo  : string): Observable<DepartamentoPgn[]> {
    const url = `${this.baseUrl}/pgnprog/departamentos_por_vigencia_periodo/${id_vigencia}/${id_periodo}`;
    return this.http.get<DepartamentoPgn[]>(url);
  }

  /**
   * Obtiene las fuentes para regionalización de programación según vigencia y periodo
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @returns Observable con las fuentes para la vigencia y periodo seleccionados
   */
  getPgnProgFuentesPorVigenciaPeriodo(id_vigencia : string, id_periodo  : string): Observable<FuentePgn[]> {
    const url = `${this.baseUrl}/pgnprog/fuentes_por_vigencia_periodo/${id_vigencia}/${id_periodo}`;
    return this.http.get<FuentePgn[]>(url);
  }

  /**
   * Obtiene los datos de resumen y detalle de regionalización de programación dados unos parámetros
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @param codigo_dane_depto - Código del departamento
   * @param id_fuente - Código de la fuente
   * @returns Observable con los datos de regionalización de programación
   */
  getPgnProgDatosRegionalizacionPorVigenciaPeriodo(id_vigencia : string
                                                  , id_periodo  : string
                                                  , codigo_dane_depto  : string
                                                  , id_fuente  : string): Observable<PgnDatosRegionalizacionResponse> {
    const url = `${this.baseUrl}/pgnprog/datosregionalizacion_por_vigencia_periodo/${id_vigencia}/${id_periodo}/${codigo_dane_depto}/${id_fuente}`;
    return this.http.get<PgnDatosRegionalizacionResponse>(url);
  }

  /**
   * Descarga el archivo Excel de regionalización de programación dados unos parámetros
   * @param id_vigencia - Año de consulta
   * @param id_periodo - Periodo de consulta
   * @param codigo_dane_depto - Código del departamento
   * @param id_fuente - Código de la fuente
   * @returns Observable con el archivo binario (Blob)
   */
  getPgnProgDescargaDatosRegionalizacionPorVigenciaPeriodo( id_vigencia: string,
                                                            id_periodo: string,
                                                            codigo_dane_depto: string,
                                                            id_fuente: string
                                                          ): Observable<Blob> {
    const url = `${this.baseUrl}/pgnprog/descargadatosregionalizacion_por_vigencia_periodo/${id_vigencia}/${id_periodo}/${codigo_dane_depto}/${id_fuente}`;
    return this.http.get(url, { responseType: 'blob' });  // responseType 'blob' indica que será un archivo binario
  }



  // ========== Geovisor Methods ==========

  private readonly CACHE_PREFIX = 'sicodis_geo_v';
  private readonly TTL_VIGENCIA_ACTIVA  = 60 * 60 * 1000;          // 1 hora
  private readonly TTL_VIGENCIA_CERRADA = 30 * 24 * 60 * 60 * 1000; // 30 días

  private geoCacheTtl(annio: number): number {
    return annio < new Date().getFullYear()
      ? this.TTL_VIGENCIA_CERRADA
      : this.TTL_VIGENCIA_ACTIVA;
  }

  getGeovisorResumen(annio: number, codigoDepto: string | number = 0, codigoEntidad: string | number = 0): Observable<ResumenGeovisor> {
    const cacheKey = `${this.CACHE_PREFIX}${annio}_${codigoDepto}_${codigoEntidad}`;
    const ttl = this.geoCacheTtl(annio);

    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts < ttl) return of(data as ResumenGeovisor);
        localStorage.removeItem(cacheKey);
      }
    } catch { /* localStorage no disponible */ }

    const url = `${this.baseUrl}/geovisor/resumen_geovisor/${annio}/${codigoDepto}/${codigoEntidad}`;
    return this.http.get<ResumenGeovisor>(url).pipe(
      tap(data => {
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
        } catch { /* cuota excedida — silencioso */ }
      })
    );
  }

  limpiarCacheGeovisor(): void {
    const ahora = Date.now();
    const aEliminar: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(this.CACHE_PREFIX)) continue;
      try {
        const { ts } = JSON.parse(localStorage.getItem(key)!);
        const annio = parseInt(key.replace(this.CACHE_PREFIX, '').split('_')[0]);
        if (ahora - ts > this.geoCacheTtl(annio)) aEliminar.push(key);
      } catch {
        aEliminar.push(key!);
      }
    }

    aEliminar.forEach(k => localStorage.removeItem(k));
  }

  // ============================================================================
  // EFICIENCIAS FISCALES Y ADMINISTRATIVAS - API Methods
  // ============================================================================

  /**
   * Obtiene todos los municipios del catálogo de eficiencias
   * @returns Observable con array de municipios
   */
  getEficienciasMunicipios(): Observable<MunicipioEficiencia[]> {
    const url = '/api/eficiencias/municipios';
    return this.http.get<MunicipioEficiencia[]>(url);
  }

  /**
   * Obtiene un municipio específico por código DANE
   * @param codigoDane - Código DANE del municipio
   * @returns Observable con datos del municipio
   */
  getEficienciasMunicipioByCodigo(codigoDane: string): Observable<MunicipioEficiencia> {
    const url = `/api/eficiencias/municipios/${codigoDane}`;
    return this.http.get<MunicipioEficiencia>(url);
  }

  /**
   * Obtiene ingresos tributarios de un municipio
   * @param codigoDane - Código DANE del municipio
   * @param anio - Año específico (opcional)
   * @returns Observable con array de ingresos tributarios
   */
  getEficienciasIngresosTributarios(codigoDane: string, anio?: number): Observable<IngresoTributario[]> {
    const url = anio
      ? `/api/eficiencias/ingresos-tributarios/${codigoDane}/${anio}`
      : `/api/eficiencias/ingresos-tributarios/${codigoDane}`;
    return this.http.get<IngresoTributario[]>(url);
  }

  /**
   * Obtiene datos de población de un municipio
   * @param codigoDane - Código DANE del municipio
   * @param anio - Año específico (opcional)
   * @returns Observable con array de población
   */
  getEficienciasPoblacion(codigoDane: string, anio?: number): Observable<PoblacionMunicipio[]> {
    const url = anio
      ? `/api/eficiencias/poblacion/${codigoDane}/${anio}`
      : `/api/eficiencias/poblacion/${codigoDane}`;
    return this.http.get<PoblacionMunicipio[]>(url);
  }

  /**
   * Obtiene recursos de propósito general de un municipio
   * @param codigoDane - Código DANE del municipio
   * @param anio - Año específico (opcional)
   * @returns Observable con array de recursos
   */
  getEficienciasRecursosPropositoGeneral(codigoDane: string, anio?: number): Observable<RecursoPropositoGeneral[]> {
    const url = anio
      ? `/api/eficiencias/recursos-proposito-general/${codigoDane}/${anio}`
      : `/api/eficiencias/recursos-proposito-general/${codigoDane}`;
    return this.http.get<RecursoPropositoGeneral[]>(url);
  }

  /**
   * Obtiene datos de ICLD (Ley 617) de un municipio
   * @param codigoDane - Código DANE del municipio
   * @param anio - Año específico (opcional)
   * @returns Observable con array de ICLD
   */
  getEficienciasLey617ICLD(codigoDane: string, anio?: number): Observable<Ley617ICLD[]> {
    const url = anio
      ? `/api/eficiencias/ley-617/icld/${codigoDane}/${anio}`
      : `/api/eficiencias/ley-617/icld/${codigoDane}`;
    return this.http.get<Ley617ICLD[]>(url);
  }

  /**
   * Obtiene gastos de funcionamiento (Ley 617) de un municipio
   * @param codigoDane - Código DANE del municipio
   * @param anio - Año específico (opcional)
   * @returns Observable con array de gastos de funcionamiento
   */
  getEficienciasLey617GastosFuncionamiento(codigoDane: string, anio?: number): Observable<Ley617GastosFuncionamiento[]> {
    const url = anio
      ? `/api/eficiencias/ley-617/gastos-funcionamiento/${codigoDane}/${anio}`
      : `/api/eficiencias/ley-617/gastos-funcionamiento/${codigoDane}`;
    return this.http.get<Ley617GastosFuncionamiento[]>(url);
  }

  /**
   * Obtiene razón (Ley 617) de un municipio
   * @param codigoDane - Código DANE del municipio
   * @param anio - Año específico (opcional)
   * @returns Observable con array de razón
   */
  getEficienciasLey617Razon(codigoDane: string, anio?: number): Observable<Ley617Razon[]> {
    const url = anio
      ? `/api/eficiencias/ley-617/razon/${codigoDane}/${anio}`
      : `/api/eficiencias/ley-617/razon/${codigoDane}`;
    return this.http.get<Ley617Razon[]>(url);
  }

  /**
   * Obtiene holgura (Ley 617) de un municipio
   * @param codigoDane - Código DANE del municipio
   * @param anio - Año específico (opcional)
   * @returns Observable con array de holgura
   */
  getEficienciasLey617Holgura(codigoDane: string, anio?: number): Observable<Ley617Holgura[]> {
    const url = anio
      ? `/api/eficiencias/ley-617/holgura/${codigoDane}/${anio}`
      : `/api/eficiencias/ley-617/holgura/${codigoDane}`;
    return this.http.get<Ley617Holgura[]>(url);
  }

  /**
   * Obtiene límite de gasto (Ley 617 - Vigencia 2025) de un municipio
   * @param codigoDane - Código DANE del municipio
   * @returns Observable con límite de gasto
   */
  getEficienciasLey617LimiteGasto(codigoDane: string): Observable<Ley617LimiteGasto> {
    const url = `/api/eficiencias/ley-617/limite-gasto/${codigoDane}`;
    return this.http.get<Ley617LimiteGasto>(url);
  }

  /**
   * Obtiene datos de vigencia 2026 (Ley 617) de un municipio
   * @param codigoDane - Código DANE del municipio
   * @returns Observable con datos de vigencia 2026
   */
  getEficienciasLey617Vigencia2026(codigoDane: string): Observable<Ley617Vigencia2026> {
    const url = `/api/eficiencias/ley-617/vigencia-2026/${codigoDane}`;
    return this.http.get<Ley617Vigencia2026>(url);
  }

  /**
   * Obtiene indicadores de eficiencia fiscal de un municipio
   * @param codigoDane - Código DANE del municipio
   * @param anio - Año específico (opcional)
   * @returns Observable con array de indicadores de eficiencia fiscal
   */
  getEficienciasIndicadoresEficienciaFiscal(codigoDane: string, anio?: number): Observable<IndicadorEficienciaFiscal[]> {
    const url = anio
      ? `/api/eficiencias/indicadores/eficiencia-fiscal/${codigoDane}/${anio}`
      : `/api/eficiencias/indicadores/eficiencia-fiscal/${codigoDane}`;
    return this.http.get<IndicadorEficienciaFiscal[]>(url);
  }

  /**
   * Obtiene indicadores de eficiencia administrativa de un municipio
   * @param codigoDane - Código DANE del municipio
   * @param anio - Año específico (opcional)
   * @returns Observable con array de indicadores de eficiencia administrativa
   */
  getEficienciasIndicadoresEficienciaAdministrativa(codigoDane: string, anio?: number): Observable<IndicadorEficienciaAdministrativa[]> {
    const url = anio
      ? `/api/eficiencias/indicadores/eficiencia-administrativa/${codigoDane}/${anio}`
      : `/api/eficiencias/indicadores/eficiencia-administrativa/${codigoDane}`;
    return this.http.get<IndicadorEficienciaAdministrativa[]>(url);
  }

  /**
   * Obtiene resumen completo de un municipio con todos sus datos
   * @param codigoDane - Código DANE del municipio
   * @returns Observable con resumen completo del municipio
   */
  getEficienciasResumenMunicipio(codigoDane: string): Observable<ResumenMunicipioEficiencia> {
    const url = `/api/eficiencias/resumen/${codigoDane}`;
    return this.http.get<ResumenMunicipioEficiencia>(url);
  }

  /**
   * Compara múltiples municipios en un año específico
   * @param codigos - Array de códigos DANE de municipios a comparar
   * @param anio - Año de comparación
   * @returns Observable con comparación de municipios
   */
  getEficienciasComparar(codigos: string[], anio: number): Observable<ComparacionMunicipios> {
    const params = new HttpParams()
      .set('codigos', codigos.join(','))
      .set('anio', anio.toString());
    const url = '/api/eficiencias/comparar';
    return this.http.get<ComparacionMunicipios>(url, { params });
  }

  /**
   * Obtiene ranking de municipios por eficiencia fiscal en un año
   * @param anio - Año para el ranking
   * @param limit - Número de municipios a retornar (default: 50)
   * @returns Observable con array de municipios ordenados por eficiencia
   */
  getEficienciasRankingEficienciaFiscal(anio: number, limit: number = 50): Observable<RankingEficienciaItem[]> {
    const url = `/api/eficiencias/ranking/eficiencia-fiscal/${anio}`;
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<RankingEficienciaItem[]>(url, { params });
  }

  // ============================================================================
  // END EFICIENCIAS FISCALES Y ADMINISTRATIVAS
  // ============================================================================

  // ============================================================================
  // SGR DISTRIBUCIÓN — CARGA DE INSUMOS (Manual M-CA-04 v12)
  // ============================================================================

  /**
   * Sube al backend el archivo (plantilla Excel) de un insumo requerido para el
   * cálculo de la distribución del SGR, asociado a un bienio y a su fuente.
   * @param params - Bienio, fuente (MME, DANE, MHCP, ANH/ANM, SGP, Min. Interior),
   *                 identificador del insumo y archivo a cargar.
   * @returns Observable con la respuesta HTTP del cargue.
   */
  cargarInsumoDistribucionSgr(params: CargarInsumoDistribucionParams): Observable<HttpResponse<InsumoCargaResultado>> {
    const formData = new FormData();
    formData.append('archivo', params.archivo, params.archivo.name);
    formData.append('idBienio', String(params.idBienio));
    formData.append('bienio', params.bienio);
    formData.append('fuente', params.fuente);
    formData.append('insumo', params.insumo);

    const segments = [params.idBienio, params.fuente, params.insumo]
      .map(s => encodeURIComponent(String(s)))
      .join('/');
    const url = `${this.baseUrl}/sgrdistribucion/insumos/cargar/${segments}`;
    return this.http.post<InsumoCargaResultado>(url, formData, { observe: 'response' });
  }

  /**
   * Obtiene el estado de cargue de los insumos de la distribución del SGR para un bienio.
   * @param idBienio - Identificador del bienio.
   * @returns Observable con el estado de cada insumo (cargado, pendiente, versión, fecha).
   */
  getEstadoInsumosDistribucionSgr(idBienio: number): Observable<InsumoEstado[]> {
    const url = `${this.baseUrl}/sgrdistribucion/insumos/estado/${encodeURIComponent(idBienio)}`;
    return this.http.get<InsumoEstado[]>(url);
  }

  /**
   * Descarga la plantilla Excel oficial para diligenciar un insumo de la distribución del SGR.
   * @param fuente - Sigla de la fuente (MME, DANE, MHCP, ANH/ANM, SGP, MININTERIOR).
   * @param insumo - Identificador del insumo.
   * @returns Observable con la respuesta HTTP que contiene el Blob de la plantilla .xlsx
   */
  descargarPlantillaInsumoDistribucionSgr(fuente: string, insumo: string): Observable<HttpResponse<Blob>> {
    const segments = [fuente, insumo].map(s => encodeURIComponent(String(s))).join('/');
    const url = `${this.baseUrl}/sgrdistribucion/insumos/plantilla/${segments}`;
    return this.http.get(url, { responseType: 'blob', observe: 'response' });
  }

  /**
   * Inicia una corrida de cálculo de la distribución del SGR para un bienio.
   * La ejecución es asíncrona; devuelve el identificador de la corrida creada.
   * @param idBienio - Identificador del bienio.
   * @returns Observable con la corrida creada (estado inicial `en_proceso`).
   */
  ejecutarDistribucionSgr(idBienio: number): Observable<CorridaDistribucion> {
    const url = `${this.baseUrl}/sgrdistribucion/ejecutar/${encodeURIComponent(idBienio)}`;
    return this.http.post<CorridaDistribucion>(url, {});
  }

  /**
   * Consulta el estado/progreso de una corrida en ejecución (polling).
   * @param idCorrida - Identificador de la corrida.
   * @returns Observable con el estado y la fase actual.
   */
  getEstadoEjecucionSgr(idCorrida: number): Observable<EjecucionEstado> {
    const url = `${this.baseUrl}/sgrdistribucion/corridas/estado/${encodeURIComponent(idCorrida)}`;
    return this.http.get<EjecucionEstado>(url);
  }

  /**
   * Obtiene el historial de corridas (versionadas por fecha de ejecución) de un bienio.
   * @param idBienio - Identificador del bienio.
   * @returns Observable con la lista de corridas, de la más reciente a la más antigua.
   */
  getCorridasDistribucionSgr(idBienio: number): Observable<CorridaDistribucion[]> {
    const url = `${this.baseUrl}/sgrdistribucion/corridas/${encodeURIComponent(idBienio)}`;
    return this.http.get<CorridaDistribucion[]>(url);
  }

  /**
   * Obtiene el detalle de una corrida: reporte de verificación (listas de chequeo del
   * manual) y totales por asignación.
   * @param idCorrida - Identificador de la corrida.
   * @returns Observable con el detalle de la corrida.
   */
  getDetalleCorridaSgr(idCorrida: number): Observable<DetalleCorrida> {
    const url = `${this.baseUrl}/sgrdistribucion/corridas/detalle/${encodeURIComponent(idCorrida)}`;
    return this.http.get<DetalleCorrida>(url);
  }

  /**
   * Descarga una de las salidas de una corrida (Excel oficial, XML del SPGR o reporte
   * de verificación).
   * @param idCorrida - Identificador de la corrida.
   * @param tipo - Tipo de salida a descargar.
   * @returns Observable con la respuesta HTTP que contiene el Blob del archivo.
   */
  descargarSalidaCorridaSgr(idCorrida: number, tipo: TipoSalidaCorrida): Observable<HttpResponse<Blob>> {
    const segments = [idCorrida, tipo].map(s => encodeURIComponent(String(s))).join('/');
    const url = `${this.baseUrl}/sgrdistribucion/corridas/descarga/${segments}`;
    return this.http.get(url, { responseType: 'blob', observe: 'response' });
  }

  /**
   * Marca una corrida como la versión oficial del bienio (desmarca la anterior).
   * @param idCorrida - Identificador de la corrida a promover.
   * @returns Observable con la corrida actualizada.
   */
  marcarCorridaOficialSgr(idCorrida: number): Observable<CorridaDistribucion> {
    const url = `${this.baseUrl}/sgrdistribucion/corridas/marcar-oficial/${encodeURIComponent(idCorrida)}`;
    return this.http.post<CorridaDistribucion>(url, {});
  }

  /**
   * Obtiene el conjunto de parámetros de cálculo vigente para un bienio
   * (porcentajes de la tabla 2, ponderadores, umbrales/banderas y redondeo).
   * @param idBienio - Identificador del bienio.
   * @returns Observable con el conjunto de parámetros versionado.
   */
  getParametrosVigentesSgr(idBienio: number): Observable<ConjuntoParametros> {
    const url = `${this.baseUrl}/sgrdistribucion/parametros/vigente/${encodeURIComponent(idBienio)}`;
    return this.http.get<ConjuntoParametros>(url);
  }

  /**
   * Obtiene el histórico de versiones de parámetros de un bienio.
   * @param idBienio - Identificador del bienio.
   * @returns Observable con las versiones de parámetros, de la más reciente a la más antigua.
   */
  getHistoricoParametrosSgr(idBienio: number): Observable<ConjuntoParametros[]> {
    const url = `${this.baseUrl}/sgrdistribucion/parametros/${encodeURIComponent(idBienio)}`;
    return this.http.get<ConjuntoParametros[]>(url);
  }

  /**
   * Crea una nueva versión del conjunto de parámetros de cálculo (perfil administrador).
   * @param conjunto - Conjunto de parámetros a versionar.
   * @returns Observable con el conjunto persistido (con su nueva versión).
   */
  guardarParametrosSgr(conjunto: ConjuntoParametros): Observable<ConjuntoParametros> {
    const url = `${this.baseUrl}/sgrdistribucion/parametros`;
    return this.http.post<ConjuntoParametros>(url, conjunto);
  }

  /**
   * @deprecated No usar. Quedó de un intento previo de login y nunca se invocó:
   * espera `{ token }` mientras el API devuelve `{ access_token }`.
   * La sesión de usuario se maneja ahora en `auth/user-auth.service.ts`.
   * Se conserva renombrado para no perder la referencia al endpoint.
   */
  loginObsoleto(usuario: string, password: string): Observable<string> {
      return this.http.post<{ token: string }>('https://sicodis.dnp.gov.co/apiws/auth/login', { usuario, password })
        .pipe(
          tap((resp: { token: string }) => {
            this.token = resp.token; // ahora TypeScript sabe que resp tiene propiedad token
          }),
          map(resp => resp.token) // opcional: si quieres devolver solo el token
        );
    }
}

// ============================================================================
// CONFIGURACIÓN: MOCK vs API REAL PARA EFICIENCIAS
// ============================================================================

/**
 * Flag para determinar si usar datos mock o API real para eficiencias
 *
 * - true: Usa datos estáticos desde /assets/data/eficiencias/
 * - false: Usa API real (backend Node.js o .NET)
 *
 * IMPORTANTE: Cambiar a false cuando el API .NET esté disponible en producción
 */
export const USE_MOCK_EFICIENCIAS = true;

/**
 * Servicio unificado de eficiencias que usa mock o API según configuración
 *
 * Este servicio actúa como fachada (facade pattern) que decide automáticamente
 * si usar datos mock o llamadas al API real basándose en la constante USE_MOCK_EFICIENCIAS.
 *
 * Ventajas:
 * - Fácil migración: solo cambiar un flag
 * - Mismo código en componentes
 * - Testing simplificado
 *
 * Uso en componentes:
 * ```typescript
 * constructor(private eficienciasService: EficienciasService) {}
 *
 * this.eficienciasService.getMunicipios().subscribe(...)
 * this.eficienciasService.getResumenMunicipio('05001').subscribe(...)
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class EficienciasService {
  constructor(
    private apiService: SicodisApiService,
    private mockService: EficienciasMockService
  ) {
    const modo = USE_MOCK_EFICIENCIAS ? 'MOCK (datos estáticos)' : 'API REAL';
    console.log(`🔧 EficienciasService inicializado en modo: ${modo}`);
  }

  /**
   * Obtener todos los municipios disponibles
   * @returns Observable con lista de municipios
   */
  getMunicipios(): Observable<MunicipioEficiencia[]> {
    if (USE_MOCK_EFICIENCIAS) {
      return this.mockService.getMunicipios();
    }
    return this.apiService.getEficienciasMunicipios();
  }

  /**
   * Obtener municipio específico por código DANE
   * @param codigoDane Código DANE del municipio
   * @returns Observable con datos del municipio
   */
  getMunicipioByCodigo(codigoDane: string): Observable<MunicipioEficiencia> {
    if (USE_MOCK_EFICIENCIAS) {
      return this.mockService.getMunicipioByCodigo(codigoDane);
    }
    return this.apiService.getEficienciasMunicipioByCodigo(codigoDane);
  }

  /**
   * Obtener resumen completo de un municipio
   * @param codigoDane Código DANE del municipio (ej: '05001' para Medellín)
   * @returns Observable con resumen completo del municipio
   */
  getResumenMunicipio(codigoDane: string): Observable<ResumenMunicipioEficiencia> {
    if (USE_MOCK_EFICIENCIAS) {
      return this.mockService.getResumenMunicipio(codigoDane);
    }
    return this.apiService.getEficienciasResumenMunicipio(codigoDane);
  }
}