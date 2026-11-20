/**
 * Ficha Municipal SGP en PDF, armada con pdfmake.
 * El documento se construye con texto, tablas y figuras vectoriales (no con capturas de pantalla),
 * así queda nítido a cualquier zoom y el texto se puede seleccionar y copiar.
 *
 * Los logos vienen incrustados en sgp-ficha-logos.ts
 *
 * Estructura
 *   Primera página   encabezado de SICODIS (GOV.CO, DNP y SICODIS) y título de la ficha
 *   Cuerpo           indicadores del municipio, variación del SGP y una sección por concepto
 *   Final            notas aclaratorias y pie institucional del DNP
 *   Todas las páginas  numeración "Página X de Y"
 */

import { FichaSgp, FichaSgpComparativo, FichaSgpCriterio, FichaSgpRecurso } from '../../services/sicodis-api.service';
import { LOGO_DNP, LOGO_GOVCO, LOGO_SICODIS } from './sgp-ficha-logos';

/** Métodos de formato y textos que ya tiene el componente y que el PDF reutiliza */
export interface FichaPdfContexto {
  ficha: FichaSgp | null;
  fechaActual: string;
  formatNumero(valor: number | null | undefined, decimales?: number): string;
  formatPesos(valor: number | null | undefined, decimales?: number): string;
  formatPorcentaje(valor: number | null | undefined, decimales?: number): string;
  formatVariacion(valor: number | null | undefined): string;
  criterio(lista: FichaSgpCriterio[] | null | undefined, orden: number): FichaSgpCriterio | null;
  recurso(codigo: string): FichaSgpRecurso | null;
  textoVariacionRecurso(codigo: string): string;
  textoVariacionCriterio(c: FichaSgpCriterio | null): string;
  textoDiferenciaPoblacion: string;
  textoDiferenciaRecursos: string;
  textoPoblacionPG(ind: Record<string, any> | null): string;
  textoEficienciaFiscal(ind: Record<string, any> | null): string;
  textoEficienciaAdministrativa(ind: Record<string, any> | null): string;
  textoEficienciaPAE(ind: Record<string, any> | null): string;
  textoCertificadoSalud(ind: Record<string, any> | null): string;
  textoMonopolioSalud(ind: Record<string, any> | null): string;
}

// ============================================================================
// COLORES
// ============================================================================

const AZUL = '#1a408c';
const AZUL_GOV = '#0943b5';   // azul de la barra GOV.CO de SICODIS
const AZUL_PIE = '#0943b5';
const GRIS_TEXTO = '#495057';
const GRIS_FONDO = '#f8f9fa';
const GRIS_LINEA = '#cbd5e1';
const VERDE = '#0f6b4a';
const ROJO = '#a12d22';

/** Colores de cada concepto, los mismos de la ficha en pantalla */
const CONCEPTOS = [
  { clave: 'educacion',    codigo: 'EDUCACION',    titulo: 'Participación para Educación',                          actual: '#ed7d31', anterior: '#fbe5d6', banda: '#c55a11' },
  { clave: 'salud',        codigo: 'SALUD',        titulo: 'Participación para Salud',                              actual: '#fe187b', anterior: '#ffd6e8', banda: '#c2185b' },
  { clave: 'agua',         codigo: 'AGUA',         titulo: 'Participación para Agua Potable y Saneamiento Básico', actual: '#ffc000', anterior: '#fff2cc', banda: '#bf8f00' },
  { clave: 'proposito',    codigo: 'PROPOSITO',    titulo: 'Participación para Propósito General',                  actual: '#1f9bcf', anterior: '#d6f1fb', banda: '#17759c' },
  { clave: 'alimentacion', codigo: 'ALIMENTACION', titulo: 'Programa de Alimentación Escolar',                      actual: '#93c571', anterior: '#eaf4e4', banda: '#548235' },
  { clave: 'riberenos',    codigo: 'RIBERENOS',    titulo: 'Ribereños del río Magdalena',                           actual: '#b5c98a', anterior: '#f6f5e2', banda: '#7a8a4a' },
  { clave: 'resguardos',   codigo: 'RESGUARDOS',   titulo: 'Resguardos Indígenas',                                  actual: '#00d25f', anterior: '#e1ffef', banda: '#00994a' },
  { clave: 'fonpet',       codigo: 'FONPET',       titulo: 'FONPET 2,9%',                                           actual: '#64748b', anterior: '#e2e8f0', banda: '#475569' }
];

const NOMBRES_CORTOS: Record<string, string> = {
  EDUCACION: 'Educación', SALUD: 'Salud', AGUA: 'Agua', PROPOSITO: 'Propósito',
  ALIMENTACION: 'Alimentación', RIBERENOS: 'Ribereños', RESGUARDOS: 'Resguardos',
  FONPET: 'FONPET', TOTAL: 'Total'
};

const NOTAS = [
  'La información relacionada con el promedio departamental corresponde al promedio de la asignación per cápita calculada para el concepto consultado. Por ejemplo, si se consulta la participación de Propósito General para un municipio del departamento de Cundinamarca, este indicador mostrará el promedio per cápita de los recursos asignados por dicho concepto a los municipios del departamento de Cundinamarca.',
  'La información relacionada con el promedio por población corresponde al promedio de la asignación per cápita calculada para el concepto consultado, considerando aquellos municipios cuya población se encuentre dentro de un rango del 10% por encima y del 10% por debajo de la población del municipio consultado. Por ejemplo, si se consulta la participación de Propósito General para el municipio de Abejorral (Antioquia), cuya población certificada para la vigencia 2026 es de 21.126 habitantes, este indicador mostrará el promedio per cápita de los recursos asignados por dicho concepto a los municipios con poblaciones comprendidas entre 19.013 y 23.239 habitantes.',
  'La información relacionada con el promedio por NBI corresponde al promedio de la asignación per cápita calculada para el concepto consultado, considerando aquellos municipios cuyo índice de Necesidades Básicas Insatisfechas (NBI) se encuentre dentro de un rango del 10% por encima y del 10% por debajo del NBI del municipio consultado. Por ejemplo, si se consulta la participación de Propósito General para el municipio de Abejorral (Antioquia), cuyo NBI certificado para la vigencia 2026 es del 14%, este indicador mostrará el promedio per cápita de los recursos asignados por dicho concepto a los municipios con niveles de NBI comprendidos entre el 12,6% y el 15,4%.',
  'La información relacionada con el promedio por población y NBI corresponde al promedio de la asignación per cápita calculada para el concepto consultado, considerando aquellos municipios que cumplen simultáneamente dos condiciones, i) que su población se encuentre dentro de un rango del 10% por encima y del 10% por debajo de la población del municipio consultado y ii) que su índice de Necesidades Básicas Insatisfechas (NBI) se encuentre dentro de un rango del 10% por encima y del 10% por debajo del NBI del municipio consultado.',
  'La información relacionada con la brecha corresponde a la diferencia entre la asignación per cápita del municipio consultado y el promedio per cápita de referencia correspondiente (departamental, población, NBI). Un valor positivo indica que la asignación per cápita del municipio es superior al promedio de referencia, mientras que un valor negativo indica que es inferior.',
  'Para cada asignación se presentan las variables más representativas y con mayor incidencia en la distribución de los recursos. Sin perjuicio de lo anterior, debe tenerse en cuenta que la asignación final resulta de la aplicación integral de la metodología definida en la ley y depende del comportamiento de todas las variables utilizadas en la distribución a nivel nacional. En particular, algunas variables, como los indicadores de eficiencia, se determinan con base en el desempeño relativo de cada entidad territorial frente al total nacional.'
];

// Ancho útil de la página A4 vertical con márgenes de 40 puntos
const ANCHO_UTIL = 515;

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

/**
 * Arma y descarga el PDF de la ficha municipal
 */
export async function generarFichaPdf(ctx: FichaPdfContexto): Promise<void> {
  const ficha = ctx.ficha;
  const dg = ficha?.datosGenerales;
  if (!ficha || !dg) return;

  // pdfmake y sus fuentes se cargan solo cuando se descarga la ficha
  const pdfMakeModulo: any = await import('pdfmake/build/pdfmake');
  const fuentesModulo: any = await import('pdfmake/build/vfs_fonts');
  const pdfMake = pdfMakeModulo.default ?? pdfMakeModulo;
  const vfs = fuentesModulo?.default?.pdfMake?.vfs
    ?? fuentesModulo?.pdfMake?.vfs
    ?? fuentesModulo?.default?.vfs
    ?? fuentesModulo?.vfs
    ?? fuentesModulo?.default;
  if (typeof pdfMake.addVirtualFileSystem === 'function') {
    pdfMake.addVirtualFileSystem(vfs);
  } else {
    pdfMake.vfs = vfs;
  }

  const imagenes = { govCo: LOGO_GOVCO, dnp: LOGO_DNP, sicodis: LOGO_SICODIS };
  const documento = construirDocumento(ctx, imagenes);

  const nombreArchivo = `Ficha_Municipal_SGP_${dg.codigoDane}_${dg.nombreMunicipio}_${dg.nombreDepto}`
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_') + '.pdf';

  pdfMake.createPdf(documento).download(nombreArchivo);
}

/**
 * Definición completa del documento para pdfmake (sin descargarlo).
 * Se separa de la descarga para poder revisarlo o generarlo en otros contextos
 */
export function construirDocumento(ctx: FichaPdfContexto, imagenes: Record<string, string>): any {
  const dg = ctx.ficha!.datosGenerales!;

  const contenido: any[] = [
    encabezado(imagenes),
    titulo(ctx),
    indicadores(ctx),
    seccionVariacion(ctx),
    ...CONCEPTOS.map(c => seccionConcepto(ctx, c)),
    notasAclaratorias(),
    pieInstitucional(imagenes)
  ];

  const documento = {
    pageSize: 'A4',
    pageMargins: [40, 50, 40, 45],
    info: {
      title: `Ficha Municipal SGP ${dg.nombreMunicipio} (${dg.nombreDepto})`,
      author: 'Departamento Nacional de Planeación, SICODIS',
      subject: `Asignación SGP ${dg.anioActual} frente a ${dg.anioAnterior}`
    },
    defaultStyle: { font: 'Roboto', fontSize: 9, color: '#1f2937', lineHeight: 1.2 },
    images: imagenes,

    // Desde la segunda página, una línea discreta con el nombre de la ficha
    header: (paginaActual: number) => paginaActual === 1 ? null : {
      margin: [40, 20, 40, 0],
      columns: [
        { text: 'SICODIS · Ficha Municipal SGP', color: AZUL, bold: true, fontSize: 8 },
        { text: `${dg.nombreMunicipio}, ${dg.nombreDepto} · DANE ${dg.codigoDane}`, alignment: 'right', color: GRIS_TEXTO, fontSize: 8 }
      ]
    },

    // Numeración en todas las páginas
    footer: (paginaActual: number, totalPaginas: number) => ({
      margin: [40, 12, 40, 0],
      columns: [
        { text: `Fecha de consulta: ${ctx.fechaActual}`, fontSize: 7.5, color: GRIS_TEXTO },
        { text: `Página ${paginaActual} de ${totalPaginas}`, alignment: 'right', fontSize: 7.5, color: GRIS_TEXTO }
      ]
    }),

    content: contenido,

    styles: {
      tituloSeccion: { fontSize: 12, bold: true, color: '#0b1c3f' },
      subtitulo: { fontSize: 10, bold: true, color: '#1f2937' },
      encabezadoTabla: { bold: true, fontSize: 8.5, color: '#1f2937', fillColor: '#e9ecef', alignment: 'center' },
      celda: { fontSize: 8.5 },
      nota: { fontSize: 7.5, color: GRIS_TEXTO }
    }
  };

  return documento;
}

// ============================================================================
// ENCABEZADO Y TÍTULO (solo primera página)
// ============================================================================

function encabezado(img: Record<string, string>): any {
  return {
    margin: [0, -20, 0, 10],
    stack: [
      // Barra azul de GOV.CO
      {
        table: {
          widths: ['*'],
          body: [[img['govCo']
            ? { image: 'govCo', width: 62, margin: [12, 7, 0, 6] }
            : { text: 'GOV.CO', color: '#ffffff', bold: true, fontSize: 12, margin: [12, 6, 0, 6] }]]
        },
        layout: { fillColor: () => AZUL_GOV, hLineWidth: () => 0, vLineWidth: () => 0, paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0, paddingBottom: () => 0 }
      },
      // Logos del DNP y de SICODIS con la línea separadora
      {
        margin: [12, 10, 0, 8],
        columns: [
          img['dnp']
            ? { image: 'dnp', fit: [120, 52], width: 130 }
            : { text: 'Departamento Nacional de Planeación', width: 140, bold: true, color: GRIS_TEXTO, margin: [0, 12, 0, 0] },
          { width: 20, canvas: [{ type: 'line', x1: 10, y1: 0, x2: 10, y2: 54, lineWidth: 0.8, lineColor: '#555555' }] },
          img['sicodis']
            ? { image: 'sicodis', fit: [150, 44], width: 160, margin: [8, 5, 0, 0] }
            : { text: 'SICODIS', width: 160, bold: true, fontSize: 20, margin: [8, 10, 0, 0] }
        ]
      },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: ANCHO_UTIL, y2: 0, lineWidth: 2, lineColor: '#f2f2f2' }] }
    ]
  };
}

function titulo(ctx: FichaPdfContexto): any {
  const dg = ctx.ficha!.datosGenerales!;
  return {
    margin: [0, 4, 0, 12],
    stack: [
      { text: 'Ficha Municipal SGP', fontSize: 20, bold: true, color: AZUL, alignment: 'center' },
      { text: `${dg.nombreMunicipio}, ${dg.nombreDepto}`, fontSize: 13, bold: true, color: '#264a70', alignment: 'center', margin: [0, 2, 0, 0] },
      {
        text: `Código DANE ${dg.codigoDane} · Vigencia ${dg.anioActual} frente a ${dg.anioAnterior} · Valores en millones de pesos`,
        fontSize: 8.5, color: GRIS_TEXTO, alignment: 'center', margin: [0, 2, 0, 0]
      }
    ]
  };
}

// ============================================================================
// INDICADORES DEL MUNICIPIO (población, NBI y recursos SGP)
// ============================================================================

function indicadores(ctx: FichaPdfContexto): any {
  const dg = ctx.ficha!.datosGenerales!;
  const total = ctx.recurso('TOTAL');

  // Caja gris con borde de color a la izquierda, como en la ficha en pantalla
  const caja = (tituloCaja: string, cuerpo: any[], bordeColor = AZUL) => ({
    table: {
      widths: ['*'],
      body: [[{ stack: [{ text: tituloCaja, fontSize: 8.5, color: '#64748b', margin: [0, 0, 0, 4] }, ...cuerpo] }]]
    },
    layout: {
      fillColor: () => GRIS_FONDO,
      hLineWidth: () => 0,
      vLineWidth: (i: number) => (i === 0 ? 3 : 0),
      vLineColor: () => bordeColor,
      paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 8, paddingBottom: () => 8
    }
  });

  const par = (anterior: string, actual: string, unidad: string) => ({
    columns: [
      { stack: [{ text: `${dg.anioAnterior}`, fontSize: 7.5, color: '#64748b' }, { text: anterior, fontSize: 14, bold: true, color: '#7d93b8' }, { text: unidad, fontSize: 7, color: GRIS_TEXTO }] },
      { text: '›', width: 14, fontSize: 18, color: '#94a3b8', margin: [0, 6, 0, 0] },
      { stack: [{ text: `${dg.anioActual}`, fontSize: 7.5, color: '#64748b' }, { text: actual, fontSize: 14, bold: true, color: AZUL }, { text: unidad, fontSize: 7, color: GRIS_TEXTO }] }
    ]
  });

  const variacion = (valor: number | null, detalle: string) => {
    const color = colorVariacion(valor);
    return {
      margin: [0, 6, 0, 0],
      table: {
        widths: ['auto', '*'],
        body: [[
          { text: [{ text: 'Variación  ', fontSize: 8, bold: true }, { text: ctx.formatVariacion(valor), fontSize: 14, bold: true }], color, margin: [4, 2, 4, 2] },
          { text: `${detalle} que en ${dg.anioAnterior}`, fontSize: 7.5, color, margin: [4, 5, 4, 2] }
        ]]
      },
      layout: { fillColor: () => fondoVariacion(valor), hLineWidth: () => 0, vLineWidth: () => 0 }
    };
  };

  const nbi = dg.nbiActual ?? 0;

  return {
    margin: [0, 0, 0, 14],
    columnGap: 8,
    columns: [
      {
        width: '36%',
        ...caja('Población', [
          par(ctx.formatNumero(dg.poblacionAnterior), ctx.formatNumero(dg.poblacionActual), 'habitantes'),
          variacion(dg.variacionPoblacion, ctx.textoDiferenciaPoblacion)
        ])
      },
      {
        width: '22%',
        ...caja('Pobreza NBI', [
          { text: `${ctx.formatNumero(dg.nbiActual, 1)}%`, fontSize: 22, bold: true, color: AZUL },
          {
            margin: [0, 6, 0, 4],
            canvas: [
              { type: 'rect', x: 0, y: 0, w: 90, h: 5, r: 2, color: '#e2e8f0' },
              { type: 'rect', x: 0, y: 0, w: Math.max(0, Math.min(90, nbi * 0.9)), h: 5, r: 2, color: AZUL }
            ]
          },
          { text: 'Necesidades Básicas Insatisfechas', fontSize: 7, color: GRIS_TEXTO }
        ])
      },
      {
        width: '*',
        ...caja('Recursos SGP', [
          par(`$${ctx.formatNumero(total?.valorAnterior)}`, `$${ctx.formatNumero(total?.valorActual)}`, 'millones de pesos'),
          variacion(total?.variacion ?? null, ctx.textoDiferenciaRecursos)
        ], (total?.variacion ?? 0) >= 0 ? '#10b981' : '#ef4444')
      }
    ]
  };
}

// ============================================================================
// DATOS GENERALES SOBRE LA ASIGNACIÓN (variación del SGP por concepto)
// ============================================================================

function seccionVariacion(ctx: FichaPdfContexto): any {
  const dg = ctx.ficha!.datosGenerales!;
  // Con el per cápita del Total al lado, la tabla de variación ocupa media página
  const hayTotal = !!ctx.ficha!.comparativoTotal;
  const anchoBarra = hayTotal ? 50 : 210;
  const fs = hayTotal ? 7 : 8.5;
  const recursos = (ctx.ficha!.recursos ?? [])
    .filter(r => r.codigo === 'TOTAL' || tieneAsignacion(ctx, r.codigo))
    .slice()
    .sort((a, b) => a.orden - b.orden);

  const filas = recursos.map(r => {
    const anterior = r.valorAnterior ?? 0;
    const actual = r.valorActual ?? 0;
    const suma = anterior + actual;
    const esTotal = r.codigo === 'TOTAL';
    const barra = suma > 0
      ? {
          canvas: [
            { type: 'rect', x: 0, y: 1, w: (anterior / suma) * anchoBarra, h: 11, color: '#dae3f3' },
            { type: 'rect', x: (anterior / suma) * anchoBarra, y: 1, w: (actual / suma) * anchoBarra, h: 11, color: '#8faadc' }
          ]
        }
      : { text: '' };
    return [
      { text: NOMBRES_CORTOS[r.codigo] ?? r.concepto, bold: esTotal, alignment: 'right', style: 'celda', fontSize: fs },
      { text: `$${ctx.formatNumero(anterior)}`, alignment: 'right', bold: esTotal, style: 'celda', fontSize: fs },
      { text: `$${ctx.formatNumero(actual)}`, alignment: 'right', bold: esTotal, style: 'celda', fontSize: fs },
      barra,
      { text: r.variacion === null ? 'No aplica' : ctx.formatPorcentaje(r.variacion), alignment: 'right', bold: true, color: colorVariacion(r.variacion), style: 'celda', fontSize: fs }
    ];
  });

  const encabezado = (texto: string) => ({ text: texto, style: 'encabezadoTabla', fontSize: hayTotal ? 7 : 8.5 });

  const variacion = [
    { text: 'Variación del SGP (millones de pesos)', style: 'subtitulo', margin: [0, 0, 0, 4] },
    {
      margin: [0, 0, 0, 4],
      table: {
        headerRows: 1,
        widths: hayTotal ? [50, 36, 36, anchoBarra, 38] : [70, 62, 62, anchoBarra, '*'],
        body: [
          [
            encabezado('Concepto'),
            encabezado(`${dg.anioAnterior}`),
            encabezado(`${dg.anioActual}`),
            encabezado(hayTotal ? 'Proporción' : `Proporción ${dg.anioAnterior} / ${dg.anioActual}`),
            encabezado('Variación')
          ],
          ...filas
        ]
      },
      layout: tablaLigera()
    },
    leyenda(dg.anioAnterior, dg.anioActual, '#dae3f3', '#8faadc'),
    { text: 'Hasta la fecha no se ha distribuido la totalidad de los recursos de educación y del FONPET.', style: 'nota', margin: [0, 4, 0, 12] }
  ];

  if (!hayTotal) {
    return [tituloSeccion('Datos generales sobre la asignación', AZUL), ...variacion];
  }

  // Variación y per cápita del Total en una sola línea, igual que en pantalla
  return [
    tituloSeccion('Datos generales sobre la asignación', AZUL),
    {
      unbreakable: true,
      columnGap: 15,
      columns: [
        { width: 250, stack: variacion },
        { width: 250, stack: [perCapita(ctx, ctx.ficha!.comparativoTotal!, { clave: 'total', codigo: 'TOTAL', titulo: 'Total SGP', actual: '#7f7f7f', anterior: '#dae3f3', banda: AZUL }, true)] }
      ]
    }
  ];
}

// ============================================================================
// SECCIÓN POR CONCEPTO
// ============================================================================

function seccionConcepto(ctx: FichaPdfContexto, c: typeof CONCEPTOS[number]): any {
  const ficha: any = ctx.ficha;
  const datos = ficha?.[c.clave];
  // Si el municipio no recibe recursos del concepto en ninguna vigencia, la sección no sale
  if (!datos || !tieneAsignacion(ctx, c.codigo)) return null;
  const dg = ctx.ficha!.datosGenerales!;

  // Criterios a mostrar. Salud trae tres grupos; las asignaciones de un solo valor usan su fila de recursos
  let grupos: { titulo?: string; criterios: FichaSgpCriterio[] }[];
  if (c.clave === 'salud') {
    grupos = [
      { titulo: 'Régimen Subsidiado', criterios: datos.criterios?.regimenSubsidiado ?? [] },
      { titulo: 'Salud Pública', criterios: datos.criterios?.saludPublica ?? [] },
      { titulo: 'Subsidio a la Oferta', criterios: datos.criterios?.subsidioOferta ?? [] }
    ];
  } else if (Array.isArray(datos.criterios)) {
    grupos = [{ criterios: datos.criterios }];
  } else {
    const r = ctx.recurso(c.codigo);
    grupos = r ? [{ criterios: [{ orden: 1, criterio: c.titulo, valorAnterior: r.valorAnterior, valorActual: r.valorActual, diferencia: r.diferencia, variacion: r.variacion }] }] : [];
  }

  const bloques = lineasQueDetermino(ctx, c.clave, datos);

  return [
    // Título, variación y tabla de criterios siempre juntos, para que el título no quede solo al final de una página
    {
      unbreakable: true,
      stack: [
        tituloSeccion(c.titulo, c.banda),
        {
          text: [
            `La variación de los recursos en ${dg.anioActual} es `,
            { text: ctx.textoVariacionRecurso(c.codigo), bold: true, color: c.banda }
          ],
          margin: [0, 2, 0, 6]
        },
        tablaCriterios(ctx, grupos, c)
      ]
    },
    datos.comparativo ? perCapita(ctx, datos.comparativo, c) : null,
    bloques.length > 0 ? queDetermino(bloques, c) : null,
    { text: '', margin: [0, 0, 0, 10] }
  ];
}

/** Tabla de criterios con la barra de proporción entre las dos vigencias */
function tablaCriterios(ctx: FichaPdfContexto, grupos: { titulo?: string; criterios: FichaSgpCriterio[] }[], c: typeof CONCEPTOS[number]): any {
  const dg = ctx.ficha!.datosGenerales!;
  const anchoBarra = 150;
  const cuerpo: any[] = [[
    { text: 'Criterio', style: 'encabezadoTabla' },
    { text: `${dg.anioAnterior}`, style: 'encabezadoTabla' },
    { text: `${dg.anioActual}`, style: 'encabezadoTabla' },
    { text: `Proporción ${dg.anioAnterior} / ${dg.anioActual}`, style: 'encabezadoTabla' },
    { text: 'Variación', style: 'encabezadoTabla' }
  ]];

  grupos.forEach(g => {
    if (g.titulo) {
      cuerpo.push([{ text: g.titulo, colSpan: 5, bold: true, color: c.banda, fontSize: 8.5, fillColor: '#fafafa' }, {}, {}, {}, {}]);
    }
    g.criterios.slice().sort((a, b) => a.orden - b.orden).forEach(cr => {
      const anterior = cr.valorAnterior ?? 0;
      const actual = cr.valorActual ?? 0;
      const suma = anterior + actual;
      const esTotal = cr.criterio === 'Total';
      cuerpo.push([
        { text: cr.criterio, bold: esTotal, style: 'celda' },
        { text: ctx.formatPesos(anterior), alignment: 'right', bold: esTotal, style: 'celda' },
        { text: ctx.formatPesos(actual), alignment: 'right', bold: esTotal, style: 'celda' },
        suma > 0
          ? {
              canvas: [
                { type: 'rect', x: 0, y: 1, w: (anterior / suma) * anchoBarra, h: 10, color: c.anterior },
                { type: 'rect', x: (anterior / suma) * anchoBarra, y: 1, w: (actual / suma) * anchoBarra, h: 10, color: c.actual }
              ]
            }
          : { text: 'Sin recursos', fontSize: 7.5, color: '#94a3b8' },
        { text: cr.variacion === null ? 'No aplica' : ctx.formatPorcentaje(cr.variacion), alignment: 'right', bold: true, color: colorVariacion(cr.variacion), style: 'celda' }
      ]);
    });
  });

  return {
    stack: [
      {
        table: { headerRows: 1, dontBreakRows: true, widths: ['*', 60, 60, anchoBarra, 55], body: cuerpo },
        layout: tablaLigera()
      },
      leyenda(dg.anioAnterior, dg.anioActual, c.anterior, c.actual)
    ],
    margin: [0, 0, 0, 8]
  };
}

/** Per cápita del municipio frente a los promedios y las cuatro brechas */
function perCapita(ctx: FichaPdfContexto, comp: FichaSgpComparativo, c: typeof CONCEPTOS[number], compacto = false): any {
  const dg = ctx.ficha!.datosGenerales!;
  const columnas = [
    { etiqueta: 'Municipio', valor: comp.perCapitaMunicipio ?? 0, municipio: true },
    { etiqueta: 'Promedio departamental', valor: comp.promedioDepartamental ?? 0, municipio: false },
    { etiqueta: 'Promedio población', valor: comp.promedioPoblacion ?? 0, municipio: false },
    { etiqueta: 'Promedio NBI', valor: comp.promedioNBI ?? 0, municipio: false },
    { etiqueta: 'Promedio población y NBI', valor: comp.promedioPoblacionNBI ?? 0, municipio: false }
  ];
  const maximo = Math.max(1, ...columnas.map(x => x.valor));
  // En modo compacto la gráfica cabe en media página, al lado de la variación
  const anchoMax = compacto ? 90 : 260;
  const fs = compacto ? 7 : 8.5;

  const barras = columnas.map(x => ([
    { text: x.etiqueta, style: 'celda', bold: x.municipio, fontSize: fs },
    { canvas: [{ type: 'rect', x: 0, y: 1, w: Math.max(1, (x.valor / maximo) * anchoMax), h: 10, color: x.municipio ? c.actual : '#bfbfbf' }] },
    { text: ctx.formatPesos(x.valor), alignment: 'right', style: 'celda', bold: x.municipio, fontSize: fs }
  ]));

  const brechas = [
    { t: 'Departamento', b: comp.brechaDepartamental, d: comp.diferenciaDepartamental },
    { t: 'Población', b: comp.brechaPoblacion, d: comp.diferenciaPoblacion },
    { t: 'NBI', b: comp.brechaNBI, d: comp.diferenciaNBI },
    { t: 'Población y NBI', b: comp.brechaPoblacionNBI, d: comp.diferenciaPoblacionNBI }
  ];

  return {
    unbreakable: true,
    margin: [0, 0, 0, 8],
    stack: [
      { text: `Recursos del SGP per cápita ${dg.anioActual} (pesos)`, style: 'subtitulo', margin: [0, 0, 0, 4] },
      { table: { widths: [compacto ? 78 : 120, anchoMax + 6, '*'], body: barras }, layout: 'noBorders' },
      { text: 'Brecha del municipio frente al promedio', bold: true, fontSize: 8.5, alignment: 'center', margin: [0, 6, 0, 3] },
      {
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            brechas.map(x => ({ text: x.t, style: 'encabezadoTabla', fontSize: compacto ? 7 : 8.5 })),
            brechas.map(x => ({
              stack: [
                { text: x.b === null ? 'No aplica' : ctx.formatPorcentaje(x.b), fontSize: compacto ? 11 : 13, alignment: 'center', color: '#1f2937' },
                { text: `${ctx.formatPesos(x.d)} por habitante`, fontSize: compacto ? 6 : 7, alignment: 'center', color: colorVariacion(x.b) }
              ],
              margin: [0, 2, 0, 2]
            }))
          ]
        },
        layout: { hLineColor: () => '#333333', vLineColor: () => '#333333', hLineWidth: () => 0.6, vLineWidth: () => 0.6 }
      }
    ]
  };
}

/** Recuadro "¿Qué determinó la asignación de recursos?" */
function queDetermino(bloques: { titulo?: string; lineas: any[] }[], c: typeof CONCEPTOS[number]): any {
  const cuerpo: any[] = [];
  bloques.forEach(b => {
    if (b.titulo) cuerpo.push({ text: b.titulo, bold: true, decoration: 'underline', margin: [0, 4, 0, 2] });
    cuerpo.push({ ul: b.lineas, markerColor: c.banda, margin: [0, 0, 0, 2] });
  });

  return {
    unbreakable: true,
    stack: [
      {
        table: { widths: ['*'], body: [[{ text: '¿Qué determinó la asignación de recursos?', color: '#ffffff', alignment: 'center', bold: true, margin: [0, 3, 0, 3] }]] },
        layout: { fillColor: () => c.banda, hLineWidth: () => 0, vLineWidth: () => 0 }
      },
      { stack: cuerpo, margin: [6, 4, 6, 0] }
    ]
  };
}

/** Textos de "¿Qué determinó?" por concepto, los mismos de la ficha en pantalla */
function lineasQueDetermino(ctx: FichaPdfContexto, clave: string, datos: any): { titulo?: string; lineas: any[] }[] {
  const dg = ctx.ficha!.datosGenerales!;
  const ind = datos.indicadores ?? {};
  const n = (v: any, d = 0) => ctx.formatNumero(v, d);
  const p = (v: any, d = 1) => ctx.formatPorcentaje(v, d);
  const variacion = (cr: FichaSgpCriterio | null) => ({ text: ['La variación de los recursos es ', { text: ctx.textoVariacionCriterio(cr), bold: true }] });
  const comparaAnios = (texto: string, actual: any, anterior: any) =>
    `${texto} asciende a ${n(actual)} frente a la del año anterior que fue de ${n(anterior)}`;

  switch (clave) {
    case 'educacion':
      return [
        { titulo: 'Prestación de Servicios', lineas: [
          variacion(ctx.criterio(datos.criterios, 1)),
          ind['certificado']
            ? `Municipio certificado en educación. ${comparaAnios('La matrícula atendida', ind['matriculaPrestacionActual'], ind['matriculaPrestacionAnterior'])}`
            : 'Municipio no certificado en educación'
        ] },
        { titulo: 'Calidad Gratuidad Educativa', lineas: [
          variacion(ctx.criterio(datos.criterios, 2)),
          comparaAnios('La matrícula de gratuidad educativa', ind['gratuidadOficialActual'], ind['gratuidadOficialAnterior']),
          comparaAnios('La matrícula en jornada única', ind['gratuidadJornadaUnicaActual'], ind['gratuidadJornadaUnicaAnterior'])
        ] },
        { titulo: 'Calidad Matrícula Oficial', lineas: [
          variacion(ctx.criterio(datos.criterios, 3)),
          comparaAnios('La matrícula oficial', ind['matriculaOficialActual'], ind['matriculaOficialAnterior']),
          comparaAnios('La matrícula reconocida', ind['matriculaReconocidaActual'], ind['matriculaReconocidaAnterior']),
          comparaAnios('La matrícula indígena', ind['matriculaIndigenaActual'], ind['matriculaIndigenaAnterior'])
        ] }
      ];

    case 'salud':
      return [
        { titulo: 'Régimen Subsidiado', lineas: [
          `La variación de la población afiliada al régimen subsidiado es de ${p(ind['variacionPoblacionRS'])}, pasando de ${n(ind['poblacionRSAnterior'])} en ${dg.anioAnterior} a ${n(ind['poblacionRSActual'])} en ${dg.anioActual}`
        ] },
        { titulo: 'Salud Pública', lineas: [
          `La variación de la población DANE es ${p(dg.variacionPoblacion)}, pasando de ${n(dg.poblacionAnterior)} en ${dg.anioAnterior} a ${n(dg.poblacionActual)} en ${dg.anioActual} y de la población Malaria ${p(ind['variacionPoblacionMalaria'])}, pasando de ${n(ind['poblacionMalariaAnterior'])} en ${dg.anioAnterior} a ${n(ind['poblacionMalariaActual'])} en ${dg.anioActual}`,
          `El índice de ruralidad en ${dg.anioActual} es ${p(ind['ruralidadActual'])} frente al de ${dg.anioAnterior} que fue de ${p(ind['ruralidadAnterior'])}`,
          `La densidad poblacional en ${dg.anioActual} es de ${p(ind['densidadActual'], 2)} frente a ${dg.anioAnterior} que fue de ${p(ind['densidadAnterior'], 2)}. Tener en cuenta que los beneficiarios de estos recursos son aquellos por encima del promedio nacional, que en ${dg.anioActual} es ${p(ind['densidadPromedioNalActual'], 2)} y en ${dg.anioAnterior} fue ${p(ind['densidadPromedioNalAnterior'], 2)}`,
          `La cobertura de vacunación en ${dg.anioActual} es de ${p(ind['vacunacionActual'])} frente a ${dg.anioAnterior} que fue de ${p(ind['vacunacionAnterior'])}. La meta establecida por el MSPS para ser beneficiario es de ${p(ind['metaVacunacion'])}`,
          `El porcentaje de recursos comprometidos en ${dg.anioActual} es de ${p(ind['cuipoActual'])} frente a ${dg.anioAnterior} que fue de ${p(ind['cuipoAnterior'])}. La meta establecida por el MSPS para ser beneficiario es de ${p(ind['metaCuipo'])}`
        ] },
        { titulo: 'Subsidio a la Oferta', lineas: [
          ctx.textoMonopolioSalud(ind),
          ctx.textoCertificadoSalud(ind),
          'Aplica las mismas variables de salud pública, población DANE, pobreza, ruralidad y densidad poblacional'
        ] }
      ];

    case 'agua':
      return [{ lineas: [
        `La variación de la población es de ${p(dg.variacionPoblacion)}, pasando de ${n(dg.poblacionAnterior)} en ${dg.anioAnterior} a ${n(dg.poblacionActual)} en ${dg.anioActual}`,
        `La variación de la población balance del esquema solidario es de ${p(ind['variacionPoblacionBalance'])}, pasando de ${n(ind['poblacionBalanceAnterior'])} en ${dg.anioAnterior} a ${n(ind['poblacionBalanceActual'])} en ${dg.anioActual}`,
        `El indicador de eficiencia es ${p(ind['eficienciaActual'])} mientras que el año anterior fue de ${p(ind['eficienciaAnterior'])}`
      ] }];

    case 'proposito':
      return [{ lineas: [
        ctx.textoPoblacionPG(ind),
        ctx.textoEficienciaFiscal(ind),
        ctx.textoEficienciaAdministrativa(ind)
      ] }];

    case 'alimentacion':
      return [{ lineas: [
        comparaAnios('La matrícula oficial', ind['matriculaActual'], ind['matriculaAnterior']),
        ctx.textoEficienciaPAE(ind)
      ] }];

    case 'riberenos':
      return [{ lineas: [
        (ind['kmRioMagdalena'] ?? 0) > 0
          ? `El municipio tiene ${n(ind['kmRioMagdalena'], 2)} km² de ribera sobre el río Magdalena`
          : 'El municipio no tiene ribera sobre el río Magdalena, por lo cual no recibe recursos por esta asignación'
      ] }];

    case 'resguardos':
      // Igual que en pantalla, solo se informa si el municipio recibe recursos de resguardos
      return (ctx.recurso('RESGUARDOS')?.valorActual ?? 0) > 0
        ? [{ lineas: [
            `La variación de la población en resguardos indígenas es de ${p(ind['variacionPoblacionResguardo'])}, pasando de ${n(ind['poblacionResguardoAnterior'])} en ${dg.anioAnterior} a ${n(ind['poblacionResguardoActual'])} en ${dg.anioActual}`
          ] }]
        : [];

    default:
      return [];
  }
}

// ============================================================================
// NOTAS Y PIE INSTITUCIONAL (solo al final)
// ============================================================================

function notasAclaratorias(): any {
  return {
    unbreakable: true,
    margin: [0, 6, 0, 14],
    stack: [
      { text: 'Notas aclaratorias', bold: true, color: AZUL, fontSize: 10, margin: [0, 0, 0, 4] },
      { ol: NOTAS.map(t => ({ text: t, alignment: 'justify', margin: [0, 0, 0, 3] })), fontSize: 7.5, color: GRIS_TEXTO }
    ]
  };
}

function pieInstitucional(img: Record<string, string>): any {
  return {
    unbreakable: true,
    table: {
      widths: [90, '*', '*'],
      body: [[
        {
          stack: [
            img['govCo'] ? { image: 'govCo', width: 70 } : { text: 'GOV.CO', bold: true, fontSize: 14, color: '#ffffff' }
          ],
          margin: [10, 10, 0, 10]
        },
        {
          stack: [
            { text: 'Departamento Nacional de Planeación', bold: true, fontSize: 9.5, margin: [0, 0, 0, 4] },
            { text: 'Dirección: Calle 26 # 13-19, Piso 1º - Edificio ENTerritorio / Bogotá D.C., Colombia', fontSize: 7.5 },
            { text: 'Código Postal: 110311', fontSize: 7.5 },
            { text: 'Horario de Atención: Lunes a Viernes 8:00 a.m. a 4:30 p.m. jornada continua', fontSize: 7.5 }
          ],
          margin: [10, 10, 6, 10]
        },
        {
          stack: [
            { text: 'Contacto', bold: true, fontSize: 9.5, margin: [0, 0, 0, 4] },
            { text: 'Teléfono Conmutador: +57 601 381 50 00', fontSize: 7.5 },
            { text: 'Línea gratuita anticorrupción: 01 8000 121221 opción 2', fontSize: 7.5 },
            { text: 'Correo electrónico: servicioalciudadano@dnp.gov.co', fontSize: 7.5 },
            { text: 'Buzón de notificaciones DNP: notificacionesjudiciales@dnp.gov.co', fontSize: 7.5 }
          ],
          margin: [10, 10, 6, 10]
        }
      ]]
    },
    layout: {
      fillColor: () => AZUL_PIE,
      hLineWidth: () => 0,
      vLineWidth: (i: number) => (i === 1 || i === 2 ? 0.6 : 0),
      vLineColor: () => '#9fb6e6'
    },
    color: '#ffffff'
  };
}

// ============================================================================
// AYUDAS DE DISEÑO
// ============================================================================

function tituloSeccion(texto: string, color: string): any {
  return {
    margin: [0, 6, 0, 4],
    table: { widths: [4, '*'], body: [[{ text: '', fillColor: color }, { text: texto, style: 'tituloSeccion', fillColor: '#cfeefd', margin: [6, 4, 0, 4] }]] },
    layout: 'noBorders'
  };
}

function leyenda(anioAnterior: number, anioActual: number, colorAnterior: string, colorActual: string): any {
  return {
    margin: [0, 4, 0, 0],
    columns: [
      { width: '*', text: '' },
      { width: 'auto', columns: [
        { width: 8, canvas: [{ type: 'rect', x: 0, y: 2, w: 7, h: 7, color: colorAnterior }] },
        { width: 'auto', text: `${anioAnterior}`, fontSize: 7.5, margin: [2, 0, 10, 0] },
        { width: 8, canvas: [{ type: 'rect', x: 0, y: 2, w: 7, h: 7, color: colorActual }] },
        { width: 'auto', text: `${anioActual}`, fontSize: 7.5, margin: [2, 0, 10, 0] },
        { width: 'auto', text: 'millones de pesos', fontSize: 7.5, color: '#94a3b8' }
      ] },
      { width: '*', text: '' }
    ]
  };
}

function tablaLigera(): any {
  return {
    hLineWidth: (i: number) => (i === 1 ? 0.8 : 0.4),
    vLineWidth: () => 0,
    hLineColor: () => GRIS_LINEA,
    paddingTop: () => 3,
    paddingBottom: () => 3
  };
}

/** El municipio recibe recursos del concepto en alguna de las dos vigencias */
function tieneAsignacion(ctx: FichaPdfContexto, codigo: string): boolean {
  const r = ctx.recurso(codigo);
  return !!r && ((r.valorAnterior ?? 0) > 0 || (r.valorActual ?? 0) > 0);
}

function colorVariacion(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || valor === 0) return '#64748b';
  return valor > 0 ? VERDE : ROJO;
}

function fondoVariacion(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || valor === 0) return '#f1f5f9';
  return valor > 0 ? '#e7f6ef' : '#fdecea';
}