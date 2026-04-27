# 2. Navegación General

## Información del Documento
- **Última actualización**: Ver [CHANGELOG.md](./CHANGELOG.md)
- **Versión**: 1.0.0

## Tabla de Contenidos
- [Introducción](#introducción)
- [Estructura del Menú Principal](#estructura-del-menú-principal)
- [Elementos Comunes de la Interfaz](#elementos-comunes-de-la-interfaz)
- [Patrones de Navegación](#patrones-de-navegación)
- [Uso de Filtros en Cascada](#uso-de-filtros-en-cascada)
- [Funcionalidades de Exportación](#funcionalidades-de-exportación)
- [Navegación por Teclado](#navegación-por-teclado)
- [Capturas de Pantalla](#capturas-de-pantalla)

---

## Introducción

SICODIS ofrece una interfaz web intuitiva y consistente en todos sus módulos. Este capítulo describe los elementos comunes de navegación y las funcionalidades compartidas que encontrará en todo el sistema.

---

## Estructura del Menú Principal

![Menú principal de SICODIS](./assets/menu-principal.png)
*Placeholder: Captura del header con todos los menús desplegados*

El menú principal de SICODIS está organizado en cuatro secciones principales:

### 1. Inicio
**Ruta**: `/`

Página principal con:
- Dashboard general del sistema
- Acceso rápido a módulos destacados
- Tarjetas de navegación por sistema (SGP, SGR, PGN)
- Indicadores clave agregados

### 2. SGP (Sistema General de Participaciones)

**Opciones del menú**:

| Opción de Menú | Descripción | Ruta |
|----------------|-------------|------|
| **SGP - Resumen** | Vista general de participaciones | `/sgp-inicio` |
| **SGP - Documentos Anexos** | Distribuciones con documentos adjuntos | `/sgp-documentos-anexos` |
| **SGP - Detalle Presupuestal** | Desglose de doceavas | `/sgp-detalle-presupuestal` |
| **SGP - Comparativo** | Comparación entre municipios | `/sgp-comparativa` |
| **SGP - Histórico** | Serie histórica 2002-2026 | `/sgp-historico` |
| **SGP - Eficiencias** | Indicadores fiscales y administrativos | `/sgp-eficiencias` |
| **SGP - Resguardos** | Datos de resguardos indígenas | `/sgp-resguardos` |

### 3. SGR (Sistema General de Regalías)

**Opciones del menú**:

| Opción de Menú | Descripción | Ruta |
|----------------|-------------|------|
| **SGR - Recaudo Mensual** | Seguimiento mensual del recaudo | `/sgr-recaudo-mensual` |
| **SGR - Recaudo Directas** | Asignaciones directas por entidad | `/sgr-recaudo-directas` |
| **SGR - Presupuesto y Recaudo** | Comparativa presupuesto vs recaudo | `/sgr-presupuesto-y-recaudo` |
| **SGR - Funcionamiento** | Administración y SSEC | `/reporte-funcionamiento` |
| **SGR - Plan de Recursos** | Proyección 10 años | `/sgr-plan-recursos` |
| **SGR - Plan Bienal de Caja** | Flujo de caja bienal | `/sgr-plan-bienal-de-caja` |
| **SGR - Comparativo** | Comparación entre municipios | `/sgr-comparativo` |

### 4. PGN (Presupuesto General de la Nación)

**Opciones del menú**:

| Opción de Menú | Descripción | Ruta |
|----------------|-------------|------|
| **PGN - Regionalización** | Programación regionalizada | `/pgn-regionalizacion` |
| **PGN - Seguimiento** | Ejecución regionalizada | `/pgn-seguimiento` |
| **PGN - Inversión por Sector** | Análisis sectorial y por proyecto | `/pgn-inversion-por-sector` |

### 5. Ayuda

**Opciones del menú**:
- **Preguntas Frecuentes**: FAQ del sistema
- **Glosario**: Términos técnicos
- **Contacto**: Información de soporte

---

## Elementos Comunes de la Interfaz

![Elementos de interfaz comunes](./assets/general/elementos-comunes.png)
*Placeholder: Captura mostrando header, breadcrumbs, footer*

### Header (Encabezado)

**Elementos del header**:
1. **Logo SICODIS/DNP**: Clic lleva al inicio
2. **Menú principal**: Navegación por sistemas
3. **Breadcrumbs**: Ruta de navegación actual
4. **Información de sesión**: (Si aplica autenticación)

### Breadcrumbs (Migas de Pan)

Muestran la ruta de navegación actual:
```
Inicio > SGP > SGP Documentos Anexos
```

Puede hacer clic en cualquier nivel para retroceder en la navegación.

### Footer (Pie de Página)

Contiene:
- Enlaces a redes sociales del DNP
- Información de contacto
- Aviso de privacidad
- Versión del sistema
- Copyright

### Panel de Filtros

![Panel de filtros típico](./assets/panel-filtros.png)
*Placeholder: Captura de sección de filtros con controles*

Presente en la mayoría de módulos, incluye:
- **Selectores desplegables**: Vigencia, Departamento, Municipio, etc.
- **Botones de acción**: Actualizar, Limpiar, Descargar
- **Indicadores de selección**: Muestran filtros activos

### Área de Visualización

Zona principal donde se muestran:
- **Gráficos**: Barras, líneas, donut, gauge
- **Tablas**: Simples, jerárquicas (TreeTable), con scroll
- **Tarjetas de métricas**: KPIs e indicadores clave
- **Mapas**: (En algunos módulos)

---

## Patrones de Navegación

### Navegación Vertical (Por Menú)

1. Haga clic en el menú del sistema deseado (SGP, SGR o PGN)
2. Se desplegará un submenú con las opciones disponibles
3. Seleccione el módulo que desea consultar
4. La página se cargará con los filtros por defecto

### Navegación Horizontal (Por Tarjetas)

En algunos módulos encontrará tarjetas de navegación:

![Tarjetas de navegación](./assets/tarjetas-navegacion.png)
*Placeholder: Captura de tarjetas de acceso rápido*

- **Clic en tarjeta**: Navega al módulo correspondiente
- **Información resumida**: Muestra métricas clave del módulo
- **Ícono representativo**: Identifica visualmente el módulo

### Navegación por Tabs (Pestañas)

Algunos módulos tienen múltiples vistas en tabs:

**Ejemplo**: SGP Comparativo
- Tab "Recursos"
- Tab "Detalle-recaudo"
- Tab "Informe-trimestral"

Haga clic en el tab para cambiar de vista sin salir del módulo.

### Navegación en TreeTables

![TreeTable con jerarquía](./assets/treetable-ejemplo.png)
*Placeholder: Captura de TreeTable expandida/colapsada*

Las tablas jerárquicas permiten:
- **Expandir** ⊕: Clic para ver niveles inferiores
- **Colapsar** ⊖: Clic para ocultar niveles inferiores
- **Expandir todo**: Botón en la cabecera (si disponible)
- **Scroll horizontal**: Para columnas adicionales

---

## Uso de Filtros en Cascada

![Filtros en cascada](./assets/filtros-cascada.png)
*Placeholder: Captura de filtros Vigencia → Departamento → Municipio*

La mayoría de módulos implementan filtros en cascada, donde la selección de un filtro afecta las opciones disponibles en el siguiente.

### Patrón Típico: Vigencia → Departamento → Municipio

#### 1. Selector de Vigencia
**Primer filtro (obligatorio)**:
- Seleccione el año o bienio que desea consultar
- Afecta todos los datos del módulo
- Opciones disponibles dependen del sistema:
  - **SGP**: Años individuales (2021, 2022, 2023, etc.)
  - **SGR**: Bienios (2023-2024, 2024-2025, etc.)
  - **PGN**: Años fiscales

#### 2. Selector de Departamento
**Segundo filtro (dependiente de vigencia)**:
- Se activa después de seleccionar vigencia
- Muestra los 32 departamentos de Colombia
- Opción especial: **"Todos"** o **"Nacional"** (código "0" o "-1")
- Al seleccionar un departamento específico, se filtra la lista de municipios

#### 3. Selector de Municipio
**Tercer filtro (dependiente de departamento)**:
- Se activa después de seleccionar departamento
- Muestra solo municipios del departamento seleccionado
- Si seleccionó "Todos" en departamento, puede ver todos los municipios o agregado nacional
- Opción especial: **"Gobernación"** (para datos del nivel departamental)

### Comportamiento de Filtros

#### Filtros Obligatorios vs Opcionales
- ✅ **Obligatorios**: Marcados con asterisco (*) o mensaje "Requerido"
- ⚪ **Opcionales**: Si no se selecciona, muestra datos agregados

#### Botón "Actualizar" / "Aplicar"
- Algunos módulos actualizan automáticamente al cambiar filtros
- Otros requieren hacer clic en **"Actualizar"** o **"Aplicar"** para cargar datos
- 💡 **Consejo**: Si no ve cambios inmediatos, busque el botón de aplicar

#### Botón "Limpiar Filtros"
- Restablece todos los filtros a valores por defecto
- Útil para comenzar una nueva consulta
- No recarga la página, solo resetea los controles

### Filtros Especiales por Sistema

#### SGP
- **Multi-selector de años** (Histórico): Permite seleccionar múltiples vigencias
- **Tipo de dato** (Eficiencias): Selecciona categoría de indicador

#### SGR
- **Rango de fechas** (Recaudo Mensual): Desde-Hasta mensual
- **Beneficiario** (Plan Bienal): Departamentos vs Municipios
- **Fuente de asignación** (Funcionamiento): Paz, Directas, CTI, etc.

#### PGN
- **Región**: Agrupación macro de departamentos
- **Sector**: Área temática de inversión
- **Entidad**: Organismo ejecutor (dependiente de Sector)
- **Proyecto (BPIN)**: Proyecto específico (dependiente de Entidad)

---

## Funcionalidades de Exportación

![Opciones de descarga](./assets/opciones-descarga.png)
*Placeholder: Captura del botón de descarga y opciones*

Casi todos los módulos ofrecen descarga de datos en formato Excel (.xlsx).

### Tipos de Descarga

#### 1. Descarga Simple
**Botón**: "Descargar" o ícono de descarga 📥

**Contenido**:
- Datos visibles actualmente en pantalla
- Respeta filtros aplicados
- Formato: Excel con hoja única

**Nombre de archivo típico**:
```
SGP_DetalleBpresupuestal_2025_Boyaca_Tunja_20260409.xlsx
```

#### 2. Descarga con Opciones (Split Button)
**Botón desplegable** con múltiples opciones:
- "Descargar Consolidado"
- "Descargar Detalle Mensual"
- "Descargar Histórico"
- "Descargar Informe" (PDF en algunos casos)

**Ejemplo**: SGR Presupuesto y Recaudo
- Opción 1: Consolidado (resumen)
- Opción 2: Detalle mensual (24 meses)

#### 3. Descarga de Archivos Adjuntos
En **SGP Documentos Anexos**:
- Modal con lista de archivos disponibles
- Cada archivo tiene botón de descarga individual
- Formatos: .xlsx, .pdf, .docx

### Proceso de Descarga

1. **Aplique filtros** deseados en el módulo
2. **Haga clic** en el botón "Descargar"
3. **Espere** mientras se genera el archivo (puede tardar unos segundos)
4. **Guarde** el archivo en su dispositivo
5. **Abra** con Excel, LibreOffice u otro visor compatible

⚠️ **Nota sobre Pop-ups**: Configure su navegador para permitir pop-ups de sicodis.dnp.gov.co si la descarga no inicia automáticamente.

### Formato de Archivos Excel

Los archivos descargados generalmente incluyen:

**Hoja 1: Datos**
- Encabezados descriptivos
- Datos tabulares
- Formato: Números con separador de miles, moneda colombiana

**Hoja 2: Metadatos** (cuando aplica)
- Fecha de generación
- Filtros aplicados
- Fuente de datos
- Vigencia consultada

### Uso de Datos Descargados

💡 **Usos recomendados**:
- Análisis offline con tablas dinámicas de Excel
- Integración con otras bases de datos
- Generación de informes personalizados
- Respaldo de información consultada

---

## Navegación por Teclado

SICODIS soporta navegación por teclado para mejorar la accesibilidad:

### Atajos Globales

| Tecla | Acción |
|-------|--------|
| `Tab` | Navegar entre controles (adelante) |
| `Shift + Tab` | Navegar entre controles (atrás) |
| `Enter` | Activar botón o abrir selector |
| `Esc` | Cerrar modal o cancelar |
| `Espacio` | Seleccionar opción en dropdown |
| `↑` `↓` | Navegar en listas desplegables |

### En Tablas y TreeTables

| Tecla | Acción |
|-------|--------|
| `↑` `↓` | Navegar entre filas |
| `←` `→` | Expandir/colapsar en TreeTable |
| `Home` | Ir a primera fila |
| `End` | Ir a última fila |

### En Gráficos Interactivos

- **Tab**: Enfoca elementos del gráfico
- **Enter**: Muestra detalles (tooltip)
- **Esc**: Cierra detalles

---

## Capturas de Pantalla

### Vista General de un Módulo Típico

![Vista general módulo](./assets/modulo-vista-general.png)
*Placeholder: Captura de pantalla completa de un módulo con todos sus elementos: header, breadcrumbs, filtros, gráficos, tablas, footer*

### Detalle de Interacción

![Hover en gráfico](./assets/interaccion-grafico.png)
*Placeholder: Captura mostrando tooltip al pasar el mouse sobre un elemento de gráfico*

### Modal de Ayuda

![Modal de ayuda contextual](./assets/modal-ayuda.png)
*Placeholder: Ejemplo de modal con información adicional o diccionario de siglas*

---

## Consejos de Navegación

💡 **Mejores prácticas**:

1. **Comience con filtros amplios**: Seleccione vigencia y departamento antes de municipio específico
2. **Use breadcrumbs para retroceder**: En vez del botón "atrás" del navegador
3. **Limpie filtros entre consultas**: Para evitar resultados confusos
4. **Descargue datos para análisis profundo**: La visualización web es para exploración, Excel para análisis detallado
5. **Consulte el glosario**: Si encuentra términos desconocidos (acceso rápido en menú Ayuda)

⚠️ **Evite**:
- Abrir múltiples pestañas del mismo módulo (puede causar conflictos de caché)
- Usar zoom del navegador diferente a 100% (puede descuadrar gráficos)
- Aplicar filtros sin esperar la carga completa de datos

---

## Ver También
- [06-01. Glosario de Términos](./06-ayuda/06-01-glosario-terminos.md) - Definiciones técnicas
- [06-00. Preguntas Frecuentes](./06-ayuda/06-00-preguntas-frecuentes.md) - Dudas comunes
- [06-02. Soporte y Contacto](./06-ayuda/06-02-soporte-contacto.md) - Asistencia técnica

---
*Para reportar errores o sugerencias sobre este documento, contacte a sicodis@dnp.gov.co*
