import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

interface OptimizationOptions {
  maxWidth: number;
  quality: number;
  compressionLevel: number;
}

class ImageOptimizer {
  private assetsDir: string;
  private options: OptimizationOptions;
  private stats = {
    processed: 0,
    errors: 0,
    originalSize: 0,
    optimizedSize: 0,
  };

  constructor(assetsDir: string, options?: Partial<OptimizationOptions>) {
    this.assetsDir = assetsDir;
    this.options = {
      maxWidth: options?.maxWidth || 1920,
      quality: options?.quality || 85,
      compressionLevel: options?.compressionLevel || 9,
    };
  }

  async optimizeAll() {
    console.log('🎨 Iniciando optimización de imágenes...\n');
    console.log(`📁 Directorio: ${this.assetsDir}`);
    console.log(`⚙️  Configuración:`);
    console.log(`   - Ancho máximo: ${this.options.maxWidth}px`);
    console.log(`   - Calidad: ${this.options.quality}%`);
    console.log(`   - Compresión: Nivel ${this.options.compressionLevel}\n`);

    const images = this.findImages(this.assetsDir);

    if (images.length === 0) {
      console.log('⚠️  No se encontraron imágenes PNG para optimizar');
      return;
    }

    console.log(`📸 Encontradas ${images.length} imágenes\n`);

    for (let i = 0; i < images.length; i++) {
      const imagePath = images[i];
      const relativePath = path.relative(this.assetsDir, imagePath);
      const progress = `[${i + 1}/${images.length}]`;

      console.log(`${progress} ${relativePath}`);

      try {
        await this.optimizeImage(imagePath);
        this.stats.processed++;
      } catch (error: any) {
        this.stats.errors++;
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    this.printSummary();
  }

  private findImages(dir: string): string[] {
    let images: string[] = [];

    if (!fs.existsSync(dir)) {
      return images;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        images = images.concat(this.findImages(fullPath));
      } else if (stat.isFile() && item.toLowerCase().endsWith('.png')) {
        images.push(fullPath);
      }
    }

    return images;
  }

  private async optimizeImage(imagePath: string) {
    const stats = fs.statSync(imagePath);
    const originalSize = stats.size;

    // Crear backup temporal
    const backupPath = imagePath + '.backup';
    fs.copyFileSync(imagePath, backupPath);

    try {
      // Optimizar imagen
      await sharp(imagePath)
        .resize(this.options.maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .png({
          compressionLevel: this.options.compressionLevel,
          quality: this.options.quality,
          adaptiveFiltering: true,
        })
        .toFile(imagePath + '.optimized');

      // Reemplazar original con versión optimizada
      fs.unlinkSync(imagePath);
      fs.renameSync(imagePath + '.optimized', imagePath);

      // Eliminar backup
      fs.unlinkSync(backupPath);

      const newStats = fs.statSync(imagePath);
      const optimizedSize = newStats.size;
      const savings = originalSize - optimizedSize;
      const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

      this.stats.originalSize += originalSize;
      this.stats.optimizedSize += optimizedSize;

      console.log(
        `   ✅ ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)} ` +
        `(${savingsPercent}% reducido)`
      );
    } catch (error) {
      // Restaurar backup en caso de error
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, imagePath);
        fs.unlinkSync(backupPath);
      }
      throw error;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private printSummary() {
    const totalSavings = this.stats.originalSize - this.stats.optimizedSize;
    const totalSavingsPercent = ((totalSavings / this.stats.originalSize) * 100).toFixed(1);

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE OPTIMIZACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Procesadas:  ${this.stats.processed}`);
    console.log(`❌ Errores:     ${this.stats.errors}`);
    console.log(`📦 Tamaño original:  ${this.formatBytes(this.stats.originalSize)}`);
    console.log(`📦 Tamaño optimizado: ${this.formatBytes(this.stats.optimizedSize)}`);
    console.log(`💾 Ahorro total:     ${this.formatBytes(totalSavings)} (${totalSavingsPercent}%)`);
    console.log('='.repeat(60) + '\n');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const assetsDir = path.join(__dirname, '../docs/manual-de-usuario/assets');

  // Opciones personalizables
  let maxWidth = 1920;
  let quality = 85;
  let compressionLevel = 9;

  // Parsear argumentos
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--width' && args[i + 1]) {
      maxWidth = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--quality' && args[i + 1]) {
      quality = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--compression' && args[i + 1]) {
      compressionLevel = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--help') {
      console.log(`
🎨 Optimizador de Imágenes para Manual SICODIS

Uso:
  npm run screenshots:optimize [opciones]

Opciones:
  --width <px>         Ancho máximo en píxeles (default: 1920)
  --quality <0-100>    Calidad de compresión (default: 85)
  --compression <0-9>  Nivel de compresión PNG (default: 9)
  --help               Muestra esta ayuda

Ejemplos:
  npm run screenshots:optimize
  npm run screenshots:optimize -- --width 1600 --quality 90
  npm run screenshots:optimize -- --compression 7
      `);
      process.exit(0);
    }
  }

  const optimizer = new ImageOptimizer(assetsDir, {
    maxWidth,
    quality,
    compressionLevel,
  });

  await optimizer.optimizeAll();
}

main();
