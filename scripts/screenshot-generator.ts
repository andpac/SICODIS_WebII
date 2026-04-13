/**
 * 📸 GENERADOR AUTOMÁTICO DE SCREENSHOTS - SICODIS
 *
 * ⚙️ CONFIGURACIÓN DE TIMEOUTS:
 * Si obtienes errores de timeout, ajusta los valores en la línea 38-42:
 *
 * private readonly TIMEOUTS = {
 *   navigation: 60000,      // Tiempo para cargar páginas (en ms)
 *   waitForSelector: 30000, // Tiempo para esperar elementos (en ms)
 *   click: 15000,           // Tiempo para clicks (en ms)
 *   networkIdle: 60000,     // Tiempo para esperar red inactiva (en ms)
 * };
 *
 * Ejemplo: Para aumentar a 90 segundos, cambiar 60000 → 90000
 */

import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface ScreenshotSpec {
  id: string;
  path: string;
  url: string;
  description: string;
  actions: string[];
  fullPage: boolean;
  selector?: string;
  usedIn: string[];
}

interface ScreenshotInventory {
  baseUrl: string;
  viewport: {
    width: number;
    height: number;
  };
  deviceScaleFactor: number;
  screenshots: ScreenshotSpec[];
}

class ScreenshotGenerator {
  private browser!: Browser;
  private context!: BrowserContext;
  private page!: Page;
  private inventory: ScreenshotInventory;
  private baseDir: string;
  private successCount: number = 0;
  private errorCount: number = 0;
  private errors: { id: string; error: string }[] = [];

  // ⚙️ CONFIGURACIÓN DE TIMEOUTS (en milisegundos)
  private readonly TIMEOUTS = {
    navigation: 60000,      // Timeout para navegar a página (60 segundos)
    waitForSelector: 30000, // Timeout para esperar elementos (30 segundos)
    click: 15000,           // Timeout para clicks (15 segundos)
    networkIdle: 60000,     // Timeout para esperar red inactiva (60 segundos)
  };

  constructor(inventoryPath: string) {
    this.inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'));
    this.baseDir = path.join(__dirname, '../docs/manual-de-usuario');
  }

  async initialize() {
    console.log('🚀 Iniciando Playwright...');
    console.log(`⏱️  Timeouts configurados:`);
    console.log(`   - Navegación: ${this.TIMEOUTS.navigation / 1000}s`);
    console.log(`   - Espera de elementos: ${this.TIMEOUTS.waitForSelector / 1000}s`);
    console.log(`   - Clicks: ${this.TIMEOUTS.click / 1000}s\n`);

    this.browser = await chromium.launch({
      headless: false, // Cambiar a true para ejecución sin interfaz
      slowMo: 100, // Ralentizar para ver qué está pasando
    });

    this.context = await this.browser.newContext({
      viewport: this.inventory.viewport,
      deviceScaleFactor: this.inventory.deviceScaleFactor,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    this.page = await this.context.newPage();

    // Configurar timeout por defecto de la página
    this.page.setDefaultTimeout(this.TIMEOUTS.navigation);

    // Interceptar errores de consola para debugging
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log('   ⚠️  Console error:', msg.text());
      }
    });

    console.log('✅ Playwright inicializado\n');
  }

  async generateAll() {
    console.log(`📸 Generando ${this.inventory.screenshots.length} screenshots...\n`);

    for (let i = 0; i < this.inventory.screenshots.length; i++) {
      const spec = this.inventory.screenshots[i];
      const progress = `[${i + 1}/${this.inventory.screenshots.length}]`;

      console.log(`${progress} ${spec.id}`);
      console.log(`   📄 ${spec.description}`);

      try {
        await this.generateScreenshot(spec);
        this.successCount++;
        console.log(`   ✅ Guardado: ${spec.path}\n`);
      } catch (error: any) {
        this.errorCount++;
        const errorMsg = error.message || String(error);
        this.errors.push({ id: spec.id, error: errorMsg });
        console.log(`   ❌ Error: ${errorMsg}\n`);
      }

      // Pausa entre screenshots para evitar sobrecarga
      await this.page.waitForTimeout(500);
    }

    this.printSummary();
  }

  private async generateScreenshot(spec: ScreenshotSpec) {
    const url = `${this.inventory.baseUrl}${spec.url}`;

    // Navegar a la URL
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: this.TIMEOUTS.navigation,
    });

    // Ejecutar acciones
    for (const action of spec.actions) {
      await this.executeAction(action);
    }

    // Asegurar que el directorio existe
    const outputPath = path.join(this.baseDir, spec.path);
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Tomar screenshot
    if (spec.selector) {
      // Screenshot de un elemento específico
      const element = await this.page.locator(spec.selector).first();
      await element.screenshot({ path: outputPath });
    } else {
      // Screenshot de página completa o viewport
      await this.page.screenshot({
        path: outputPath,
        fullPage: spec.fullPage,
      });
    }
  }

  private async executeAction(action: string) {
    // Parser de acciones basado en el formato del inventario
    action = action.trim();

    if (action.startsWith('waitForSelector(')) {
      const selector = this.extractParam(action, 'waitForSelector');
      await this.page.waitForSelector(selector, { timeout: this.TIMEOUTS.waitForSelector });
    }
    else if (action.startsWith('waitForLoadState(')) {
      const state = this.extractParam(action, 'waitForLoadState') as any;
      await this.page.waitForLoadState(state, { timeout: this.TIMEOUTS.networkIdle });
    }
    else if (action.startsWith('wait(')) {
      const ms = parseInt(this.extractParam(action, 'wait'));
      await this.page.waitForTimeout(ms);
    }
    else if (action.startsWith('select(')) {
      const match = action.match(/select\(['"](.+?)['"],\s*['"](.+?)['"]\)/);
      if (match) {
        const [, selector, value] = match;
        await this.page.selectOption(selector, value, { timeout: this.TIMEOUTS.waitForSelector });
      }
    }
    else if (action.startsWith('click(')) {
      const selector = this.extractParam(action, 'click');
      await this.page.click(selector, { timeout: this.TIMEOUTS.click });
    }
    else if (action.startsWith('hover(')) {
      const selector = this.extractParam(action, 'hover');
      await this.page.hover(selector, { timeout: this.TIMEOUTS.click });
    }
    else if (action.startsWith('screenshot(')) {
      // Esta acción se maneja en generateScreenshot, aquí solo la ignoramos
      return;
    }
    else {
      console.log(`   ⚠️  Acción desconocida: ${action}`);
    }
  }

  private extractParam(action: string, functionName: string): string {
    const regex = new RegExp(`${functionName}\\(['"](.+?)['"]\\)`);
    const match = action.match(regex);
    return match ? match[1] : '';
  }

  private printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE GENERACIÓN DE SCREENSHOTS');
    console.log('='.repeat(60));
    console.log(`✅ Exitosos: ${this.successCount}`);
    console.log(`❌ Errores:   ${this.errorCount}`);
    console.log(`📁 Total:     ${this.inventory.screenshots.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORES DETALLADOS:');
      this.errors.forEach(({ id, error }) => {
        console.log(`   - ${id}: ${error}`);
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  async cleanup() {
    console.log('🧹 Cerrando navegador...');
    if (this.browser) {
      await this.browser.close();
    }
    console.log('✅ Limpieza completada');
  }

  async generate(screenshotIds?: string[]) {
    try {
      await this.initialize();

      if (screenshotIds && screenshotIds.length > 0) {
        // Generar solo screenshots específicos
        const filtered = this.inventory.screenshots.filter(s =>
          screenshotIds.includes(s.id)
        );

        if (filtered.length === 0) {
          console.log('❌ No se encontraron screenshots con los IDs especificados');
          return;
        }

        console.log(`📸 Generando ${filtered.length} screenshot(s) específico(s)...\n`);

        for (const spec of filtered) {
          console.log(`🎯 ${spec.id}`);
          console.log(`   📄 ${spec.description}`);

          try {
            await this.generateScreenshot(spec);
            this.successCount++;
            console.log(`   ✅ Guardado: ${spec.path}\n`);
          } catch (error: any) {
            this.errorCount++;
            const errorMsg = error.message || String(error);
            this.errors.push({ id: spec.id, error: errorMsg });
            console.log(`   ❌ Error: ${errorMsg}\n`);
          }
        }

        this.printSummary();
      } else {
        // Generar todos los screenshots
        await this.generateAll();
      }
    } catch (error) {
      console.error('❌ Error fatal:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const inventoryPath = path.join(__dirname, '../screenshot-inventory.json');

  if (!fs.existsSync(inventoryPath)) {
    console.error(`❌ No se encontró el archivo de inventario: ${inventoryPath}`);
    process.exit(1);
  }

  const generator = new ScreenshotGenerator(inventoryPath);

  // Comandos disponibles
  if (args.length === 0 || args[0] === 'all') {
    // Generar todos los screenshots
    await generator.generate();
  } else if (args[0] === 'list') {
    // Listar todos los screenshots disponibles
    const inventory: ScreenshotInventory = JSON.parse(
      fs.readFileSync(inventoryPath, 'utf-8')
    );
    console.log('\n📋 SCREENSHOTS DISPONIBLES:\n');
    inventory.screenshots.forEach((s, i) => {
      console.log(`${(i + 1).toString().padStart(3)}. ${s.id}`);
      console.log(`     📄 ${s.description}`);
      console.log(`     🔗 ${s.url}`);
      console.log(`     📁 ${s.path}\n`);
    });
  } else {
    // Generar screenshots específicos por ID
    const ids = args;
    await generator.generate(ids);
  }
}

main();
