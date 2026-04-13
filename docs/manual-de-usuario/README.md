# Manual de Usuario - SICODIS

Este directorio contiene el manual de usuario completo de SICODIS (Sistema de Consultas y Distribuciones).

## Estructura

- **00-portada.md**: Portada del manual
- **01-introduccion.md**: Introducción general al sistema
- **02-navegacion-general.md**: Navegación y elementos comunes de la interfaz
- **03-sgp/**: Sistema General de Participaciones (7 documentos)
- **04-sgr/**: Sistema General de Regalías (7 documentos)
- **05-pgn/**: Presupuesto General de la Nación (3 documentos)
- **06-ayuda/**: Preguntas frecuentes, glosario y soporte (3 documentos)
- **07-apendices/**: Metodologías, fuentes y normatividad (3 documentos)
- **CHANGELOG.md**: Historial de cambios del manual

## Versión Actual
- **Versión**: 1.0.0
- **Fecha**: 2026-04-09
- **Total de documentos**: 29 archivos de contenido

## Control de Cambios
Ver archivo [CHANGELOG.md](./CHANGELOG.md) para el historial completo de cambios.

## Cómo Usar Este Manual

### Para Usuarios Nuevos
1. Comience con [01-introduccion.md](./01-introduccion.md)
2. Revise [02-navegacion-general.md](./02-navegacion-general.md)
3. Consulte los capítulos específicos según el sistema que necesite

### Para Usuarios Experimentados
- Use el índice de cada capítulo para navegar directamente a módulos específicos
- Consulte el [06-ayuda/06-01-glosario-terminos.md](./06-ayuda/06-01-glosario-terminos.md) para definiciones técnicas
- Revise las [06-ayuda/06-00-preguntas-frecuentes.md](./06-ayuda/06-00-preguntas-frecuentes.md) para resolver dudas comunes

## Sistemas Cubiertos

### SGP - Sistema General de Participaciones
10 módulos de consulta sobre distribuciones de participaciones a entidades territoriales.

### SGR - Sistema General de Regalías
7 módulos de consulta sobre recaudo y distribución de regalías.

### PGN - Presupuesto General de la Nación
3 módulos de consulta sobre regionalización del presupuesto nacional.

## Generación de Screenshots

Este manual incluye un sistema automatizado para generar screenshots de todos los módulos de SICODIS utilizando Playwright.

### Instalación Rápida

```bash
# Instalar dependencias
npm install

# Instalar navegador Chromium
npx playwright install chromium
```

### Comandos Disponibles

```bash
# Generar todos los screenshots
npm run screenshots

# Listar screenshots disponibles
npm run screenshots:list

# Generar screenshots específicos
npm run screenshots menu-principal sgp-resumen-completo

# Optimizar imágenes generadas
npm run screenshots:optimize

# Generar y optimizar todo
npm run screenshots:all
```

### Documentación Completa

Ver [SCREENSHOTS.md](./SCREENSHOTS.md) para:
- Guía completa de uso
- Cómo agregar nuevos screenshots
- Solución de problemas
- Configuración avanzada

### Estructura de Assets

```
assets/
├── general/     # Screenshots de navegación general
├── sgp/         # Screenshots del SGP
├── sgr/         # Screenshots del SGR
└── pgn/         # Screenshots del PGN
```

## Contacto
- **Email**: sicodis@dnp.gov.co
- **Sitio web**: https://sicodis.dnp.gov.co
- **Entidad**: Departamento Nacional de Planeación (DNP)

## Licencia y Uso
Este manual es de carácter público y está diseñado para facilitar el uso del sistema SICODIS por parte de funcionarios públicos, analistas y ciudadanos interesados en información sobre transferencias fiscales en Colombia.

---
*Última actualización del README: 2026-04-12*
