import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { User, CreateUserRequest, UpdateUserRequest, UserListResponse } from '../models/user.interface';
import { Profile } from '../models/profile.interface';



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


// ========== Request Parameters Interfaces ==========
export interface DistribucionTotalParams {
  idVigencia?: number;
  idsFuente?: string;
  idsConcepto?: string;
  idsBeneficiario?: string;
  tipoEntidad?: string;
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
   * Obtiene las entidades asociadas a un concepto específico
   * @param idConcepto - ID del concepto
   * @returns Observable con el array de entidades
   */
  getEntidadesConceptos(idConcepto: number): Observable<EntidadConcepto[]> {
    const url = `${this.baseUrl}/sgrfun/entidades_conceptos/${idConcepto}`;
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
  getVigenciasSgrPbc(): Observable<Vigencia[]> {
    const url = `${this.baseUrl}/sgr/vigenciaspbc`;
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
  getSgpResumenParticipacionesDistribucion(idDistribucion: number, codigoDepto: string, codigoMunicipio: string): Observable<ResumenParticipaciones> {
    const url = `${this.baseUrl}/sgp/resumen_participaciones_distribucion/${idDistribucion}/${codigoDepto}/${codigoMunicipio}`;
    return this.http.get<ResumenParticipaciones>(url);
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



    login(usuario: string, password: string): Observable<string> {
      return this.http.post<{ token: string }>('https://sicodis.dnp.gov.co/apiws/auth/login', { usuario, password })
        .pipe(
          tap((resp: { token: string }) => {
            this.token = resp.token; // ahora TypeScript sabe que resp tiene propiedad token
          }),
          map(resp => resp.token) // opcional: si quieres devolver solo el token
        );
    }


  // ========== ADMIN - User Management Methods ==========

  /**
   * Obtiene la lista de usuarios con paginación y filtros
   * @param params - Parámetros de filtrado opcionales (page, limit, search)
   * @returns Observable con la lista de usuarios
   */
  getUsuarios(params?: { page?: number; limit?: number; search?: string }): Observable<UserListResponse> {
    const url = `${this.baseUrl}/admin/usuarios`;
    let httpParams = new HttpParams();

    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<UserListResponse>(url, { params: httpParams });
  }

  /**
   * Obtiene un usuario por ID
   * @param id - ID del usuario
   * @returns Observable con el usuario
   */
  getUsuarioById(id: number): Observable<User> {
    const url = `${this.baseUrl}/admin/usuarios/${id}`;
    return this.http.get<User>(url);
  }

  /**
   * Crea un nuevo usuario
   * @param usuario - Datos del usuario a crear
   * @returns Observable con el usuario creado
   */
  createUsuario(usuario: CreateUserRequest): Observable<User> {
    const url = `${this.baseUrl}/admin/usuarios`;
    return this.http.post<User>(url, usuario).pipe(
      tap(response => console.log('✅ Usuario creado:', response)),
      catchError(error => {
        console.error('❌ Error creando usuario:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza un usuario existente
   * @param id - ID del usuario
   * @param usuario - Datos actualizados del usuario
   * @returns Observable con el usuario actualizado
   */
  updateUsuario(id: number, usuario: UpdateUserRequest): Observable<User> {
    const url = `${this.baseUrl}/admin/usuarios/${id}`;
    return this.http.put<User>(url, usuario).pipe(
      tap(response => console.log('✅ Usuario actualizado:', response)),
      catchError(error => {
        console.error('❌ Error actualizando usuario:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un usuario (soft delete)
   * @param id - ID del usuario
   * @returns Observable con el resultado
   */
  deleteUsuario(id: number): Observable<void> {
    const url = `${this.baseUrl}/admin/usuarios/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => console.log('✅ Usuario eliminado:', id)),
      catchError(error => {
        console.error('❌ Error eliminando usuario:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todos los perfiles disponibles
   * @returns Observable con la lista de perfiles
   */
  getPerfiles(): Observable<Profile[]> {
    const url = `${this.baseUrl}/admin/perfiles`;
    return this.http.get<Profile[]>(url);
  }

  /**
   * Obtiene el usuario actual autenticado
   * @returns Observable con el usuario actual
   */
  getCurrentUser(): Observable<User> {
    const url = `${this.baseUrl}/auth/me`;
    return this.http.get<User>(url);
  }

  /**
   * Actualiza el perfil del usuario actual
   * @param updates - Campos a actualizar (solo nombre, teléfono, extensión)
   * @returns Observable con el usuario actualizado
   */
  updateOwnProfile(updates: Partial<User>): Observable<User> {
    const url = `${this.baseUrl}/auth/me`;
    return this.http.patch<User>(url, updates);
  }


}