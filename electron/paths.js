import { app } from 'electron';
import path from 'path';
import fs from 'fs';

// Asegurarse de que userData existe
const userDataPath = app.getPath('userData');

export const LOGS_DIR = path.join(userDataPath, 'logs');
export const DB_DIR = path.join(userDataPath, 'db');
export const QUARANTINE_DIR = path.join(userDataPath, 'quarantine');
export const CLAMAV_DB_DIR = path.join(userDataPath, 'clamav_db');

export const CLAMD_CONF_PATH = path.join(userDataPath, 'clamd.conf');
export const FRESHCLAM_CONF_PATH = path.join(userDataPath, 'freshclam.conf');

// Asegurar que los directorios principales existan
const dirsToCreate = [LOGS_DIR, DB_DIR, QUARANTINE_DIR, CLAMAV_DB_DIR];

dirsToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Copiar firmas ClamAV desde extraResources al userData en el primer inicio
// Esto permite distribuir las firmas con el instalador/portable
function seedClamAVDatabase() {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) return; // En desarrollo no copiar desde resources

  // En producción, extraResources se ubica junto al app.asar
  const resourcesPath = process.resourcesPath;
  const bundledClamDB = path.join(resourcesPath, 'clamav_db');

  if (!fs.existsSync(bundledClamDB)) return;

  // Verificar si userData/clamav_db ya tiene archivos .cvd (firmas válidas)
  const existingFiles = fs.readdirSync(CLAMAV_DB_DIR).filter(f => f.endsWith('.cvd') || f.endsWith('.cld'));
  if (existingFiles.length > 0) return; // Ya tiene firmas, no sobrescribir

  console.log('[Paths] Copiando firmas ClamAV iniciales desde recursos empaquetados...');

  const filesToCopy = fs.readdirSync(bundledClamDB);
  for (const file of filesToCopy) {
    const src = path.join(bundledClamDB, file);
    const dest = path.join(CLAMAV_DB_DIR, file);
    try {
      fs.copyFileSync(src, dest);
      console.log(`[Paths] Copiado: ${file}`);
    } catch (err) {
      console.error(`[Paths] Error copiando ${file}: ${err.message}`);
    }
  }

  console.log('[Paths] Firmas ClamAV iniciales copiadas correctamente.');
}

seedClamAVDatabase();
