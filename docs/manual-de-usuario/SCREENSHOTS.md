# Guía de Generación de Screenshots para el Manual de Usuario

Este documento explica cómo generar y optimizar los screenshots del Manual de Usuario de SICODIS utilizando el sistema automatizado con Playwright.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Uso Básico](#uso-básico)
- [Comandos Disponibles](#comandos-disponibles)
- [Estructura del Inventario](#estructura-del-inventario)
- [Agregar Nuevos Screenshots](#agregar-nuevos-screenshots)
- [Optimización de Imágenes](#optimización-de-imágenes)
- [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

- **Node.js**: Versión 18.x o superior
- **npm**: Versión 9.x o superior
- **Conexión a Internet**: Para acceder a https://sicodis.dnp.gov.co
- **Espacio en disco**: ~500MB para navegadores Playwright

---

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Instalar navegadores Playwright

```bash
npx playwright install chromium
```

Esto descargará el navegador Chromium que Playwright utilizará para generar los screenshots.

---

## Uso Básico

### Generar TODOS los screenshots

```bash
npm run screenshots
```

Este comando:
- Abre el navegador Chromium
- Navega a cada módulo de SICODIS
- Aplica los filtros especificados
- Captura los screenshots
- Los guarda en `docs/manual-de-usuario/assets/`

**Tiempo estimado**: 10-15 minutos para los 40+ screenshots

### Ver lista de screenshots disponibles

```bash
npm run screenshots:list
```

Muestra todos los screenshots configurados con sus IDs, descripciones y rutas.

### Generar screenshots específicos

```bash
npm run screenshots menu-principal sgp-resumen-completo
```

Genera solo los screenshots con los IDs especificados.

### Optimizar imágenes generadas

```bash
npm run screenshots:optimize
```

Reduce el tamaño de las imágenes PNG sin pérdida significativa de calidad.

### Generar y optimizar todo (flujo completo)

```bash
npm run screenshots:all
```

Ejecuta:
1. Generación de todos los screenshots
2. Optimización de todas las imágenes

---

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run screenshots` | Genera todos los screenshots |
| `npm run screenshots:list` | Lista IDs de screenshots disponibles |
| `npm run screenshots:optimize` | Optimiza imágenes PNG en /assets |
| `npm run screenshots:all` | Genera y optimiza todo |
| `npm run screenshots <id1> <id2>...` | Genera screenshots específicos por ID |

### Ejemplos de Uso

```bash
# Listar todos los screenshots disponibles
npm run screenshots:list

# Generar solo screenshots de SGP
npm run screenshots sgp-resumen-completo sgp-documentos-anexos-completo sgp-detalle-presupuestal-completo

# Generar solo screenshots de elementos generales
npm run screenshots menu-principal elementos-comunes filtros-cascada

# Generar todos y optimizar
npm run screenshots:all

# Optimizar con opciones personalizadas
npm run screenshots:optimize -- --width 1600 --quality 90
```

---

## Estructura del Inventario

El archivo `screenshot-inventory.json` define todos los screenshots a generar.

### Formato del Inventario

```json
{
  "baseUrl": "https://sicodis.dnp.gov.co",
  "viewport": {
    "width": 1920,
    "height": 1080
  },
  "deviceScaleFactor": 2,
  "screenshots": [
    {
      "id": "sgp-resumen-completo",
      "path": "assets/sgp/sgp-resumen-completo.png",
      "url": "/sgp-inicio",
      "description": "Vista completa del módulo SGP Resumen",
      "actions": [
        "waitForSelector('select[formControlName=\"vigencia\"]')",
        "select('select[formControlName=\"vigencia\"]', '2025')",
        "click('button:has-text(\"Actualizar\")')",
        "wait(3000)",
        "waitForLoadState('networkidle')"
      ],
      "fullPage": true,
      "usedIn": ["03-sgp/03-01-sgp-resumen.md"]
    }
  ]
}
```

### Campos Explicados

- **id**: Identificador único del screenshot
- **path**: Ruta donde se guardará la imagen (relativa a `docs/manual-de-usuario/`)
- **url**: Ruta del módulo en SICODIS (se concatena con baseUrl)
- **description**: Descripción legible del screenshot
- **actions**: Array de acciones a ejecutar antes de capturar
- **fullPage**: `true` = página completa, `false` = solo viewport
- **selector** (opcional): Capturar solo un elemento específico
- **usedIn**: Documentos del manual que usan este screenshot

### Acciones Disponibles

| Acción | Ejemplo | Descripción |
|--------|---------|-------------|
| `waitForSelector()` | `"waitForSelector('.header')"` | Espera a que un elemento aparezca |
| `waitForLoadState()` | `"waitForLoadState('networkidle')"` | Espera a que la red esté inactiva |
| `wait()` | `"wait(2000)"` | Espera un tiempo en milisegundos |
| `select()` | `"select('select[name=\"year\"]', '2025')"` | Selecciona una opción en dropdown |
| `click()` | `"click('button:has-text(\"Aplicar\")')"` | Hace clic en un elemento |
| `hover()` | `"hover('.menu-item')"` | Pasa el mouse sobre un elemento |
| `screenshot()` | `"screenshot('.chart-container')"` | Indica captura de selector específico |

---

## Agregar Nuevos Screenshots

### Paso 1: Identificar el screenshot necesario

- Revisar los placeholders en los archivos `.md` del manual
- Determinar qué módulo y vista se necesita capturar

### Paso 2: Agregar entrada al inventario

Editar `screenshot-inventory.json` y agregar:

```json
{
  "id": "nuevo-screenshot",
  "path": "assets/categoria/nombre-archivo.png",
  "url": "/ruta-del-modulo",
  "description": "Descripción clara del screenshot",
  "actions": [
    "waitForSelector('.elemento-clave')",
    "select('select[formControlName=\"filtro\"]', 'valor')",
    "click('button:has-text(\"Actualizar\")')",
    "wait(2000)"
  ],
  "fullPage": true,
  "usedIn": ["ruta/al/documento.md"]
}
```

### Paso 3: Probar generación

```bash
npm run screenshots nuevo-screenshot
```

### Paso 4: Verificar resultado

- Revisar la imagen en `docs/manual-de-usuario/assets/categoria/`
- Verificar que se vea correctamente en el documento `.md`
- Ajustar acciones si es necesario

### Consejos para Nuevos Screenshots

**✅ Buenas Prácticas:**
- Usar IDs descriptivos (ej: `sgp-resumen-treetable` en vez de `screenshot-1`)
- Incluir esperas (`wait()`) después de clicks y selects para cargar datos
- Usar `waitForLoadState('networkidle')` antes de capturar
- Documentar en `description` qué muestra el screenshot

**❌ Evitar:**
- IDs genéricos o numéricos
- Capturar sin esperar a que los datos carguen
- Olvidar el campo `usedIn` (dificulta mantenimiento)
- Screenshots demasiado grandes (usar `selector` para elementos específicos)

---

## Optimización de Imágenes

### Optimización Estándar

```bash
npm run screenshots:optimize
```

**Configuración por defecto:**
- Ancho máximo: 1920px
- Calidad: 85%
- Compresión: Nivel 9

### Optimización Personalizada

```bash
npm run screenshots:optimize -- --width 1600 --quality 90 --compression 7
```

**Opciones:**
- `--width <px>`: Ancho máximo en píxeles
- `--quality <0-100>`: Calidad de compresión (0-100)
- `--compression <0-9>`: Nivel de compresión PNG (0-9, 9 es máximo)

### Resultado Esperado

```
📊 RESUMEN DE OPTIMIZACIÓN
============================================================
✅ Procesadas:  42
❌ Errores:     0
📦 Tamaño original:  145.3 MB
📦 Tamaño optimizado: 68.7 MB
💾 Ahorro total:     76.6 MB (52.7%)
============================================================
```

---

## Solución de Problemas

### Error: "npm: command not found"

**Problema**: Node.js/npm no está instalado o no está en el PATH.

**Solución**:
1. Verificar instalación: `node --version && npm --version`
2. Si no está instalado, descargar de https://nodejs.org/
3. Reiniciar terminal después de instalar

### Error: "Cannot find module '@playwright/test'" o "Unknown file extension .ts"

**Problema**: Dependencias no están instaladas correctamente.

**Solución**:
```bash
npm install
npx playwright install chromium
```

Si persiste el error de `.ts`, las dependencias se actualizaron. Ejecute:
```bash
npm install tsx
```

### Screenshots salen en blanco o sin datos

**Problema**: Los datos no cargaron antes de la captura.

**Solución 1** - Aumentar esperas en acciones específicas:
Editar `screenshot-inventory.json` y modificar el screenshot problemático:
```json
"actions": [
  "waitForSelector('.elemento')",
  "wait(5000)",  // Aumentar tiempo de espera
  "waitForLoadState('networkidle')"
]
```

**Solución 2** - Aumentar timeouts globales (recomendado):
Los timeouts ya están aumentados a:
- Navegación: 60 segundos
- Espera de elementos: 30 segundos
- Clicks: 15 segundos

Si aún así hay problemas, editar `scripts/screenshot-generator.ts` (líneas 38-42):
```typescript
private readonly TIMEOUTS = {
  navigation: 90000,      // 90 segundos
  waitForSelector: 45000, // 45 segundos
  click: 20000,           // 20 segundos
  networkIdle: 90000,     // 90 segundos
};
```

### Error: "Timeout 10000ms exceeded" o "Timeout 30000ms exceeded"

**Problema**: El elemento no aparece en el tiempo esperado.

**✅ SOLUCIONADO**: Los timeouts ya fueron aumentados significativamente:
- De 10s → 30s para espera de elementos
- De 10s → 15s para clicks
- De 30s → 60s para navegación

Si el error persiste:
1. Verificar que el selector CSS sea correcto con DevTools
2. Verificar que SICODIS esté accesible en https://sicodis.dnp.gov.co
3. Aumentar aún más los timeouts en `scripts/screenshot-generator.ts` (ver solución anterior)

### Screenshots de módulos que requieren autenticación

**Problema**: SICODIS tiene autoLogin, pero a veces falla.

**Solución**:
- El sistema SICODIS ya maneja autoLogin automáticamente
- Si persiste, verificar que `auth.service.ts` esté funcionando
- Considerar agregar acción de espera adicional:
  ```json
  "wait(5000)"  // esperar más tiempo para autoLogin
  ```

### Imágenes muy pesadas después de generar

**Problema**: Screenshots PNG sin optimizar son muy grandes.

**Solución**:
```bash
npm run screenshots:optimize
```

O usar flujo completo:
```bash
npm run screenshots:all
```

### El navegador no se cierra después de ejecutar

**Problema**: Error durante ejecución impide cleanup.

**Solución**:
- Cerrar manualmente el navegador
- Ejecutar nuevamente el comando
- Si persiste, reiniciar terminal

---

## Mantenimiento

### Actualizar screenshots cuando cambia la UI

```bash
# Regenerar todos
npm run screenshots:all

# O solo los afectados
npm run screenshots sgp-resumen-completo sgp-detalle-presupuestal-completo
```

### Verificar screenshots rotos

```bash
# Listar todos los placeholders en documentación
grep -r "!\[.*\](.*\.png)" docs/manual-de-usuario/*.md docs/manual-de-usuario/**/*.md

# Verificar que existan los archivos
npm run screenshots:list
```

### Backup antes de regenerar

```bash
# Crear backup de assets
cp -r docs/manual-de-usuario/assets docs/manual-de-usuario/assets-backup

# Regenerar
npm run screenshots:all

# Si hay problemas, restaurar
rm -rf docs/manual-de-usuario/assets
mv docs/manual-de-usuario/assets-backup docs/manual-de-usuario/assets
```

---

## Recursos Adicionales

- **Playwright Documentation**: https://playwright.dev/
- **Sharp Documentation**: https://sharp.pixelplumbing.com/
- **SICODIS**: https://sicodis.dnp.gov.co

---

## Contacto

Para reportar problemas o sugerencias sobre la generación de screenshots:
- **Email**: sicodis@dnp.gov.co
- **Issues**: Repositorio del proyecto

---

*Última actualización: 2026-04-12*
