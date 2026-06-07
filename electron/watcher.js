import chokidar from 'chokidar';
import path from 'path';
import os from 'os';
import { BrowserWindow, Notification } from 'electron';
import { scanTarget } from './clamav.js';
import { writeLog } from './logger.js';

let watcher = null;
let isRealTimeEnabled = false;

/**
 * Inicia el monitoreo en tiempo real
 */
export function startWatcher() {
  if (isRealTimeEnabled) return;

  const userProfile = os.homedir();
  const watchPaths = [
    path.join(userProfile, 'Downloads'),
    path.join(userProfile, 'Desktop')
  ];

  watcher = chokidar.watch(watchPaths, {
    ignored: /(^|[\/\\])\../, // Ignore hidden files
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });

  watcher.on('add', handleFileChange);
  watcher.on('change', handleFileChange);

  isRealTimeEnabled = true;
  writeLog('INFO', 'Protección en tiempo real ACTIVADA');
  
  notifyStatusChange();
}

/**
 * Detiene el monitoreo en tiempo real
 */
export async function stopWatcher() {
  if (!isRealTimeEnabled || !watcher) return;
  
  await watcher.close();
  watcher = null;
  isRealTimeEnabled = false;
  
  writeLog('INFO', 'Protección en tiempo real DESACTIVADA');
  notifyStatusChange();
}

export function getWatcherStatus() {
  return isRealTimeEnabled;
}

let scanQueue = [];
let isScanning = false;

/**
 * Analiza el archivo modificado/añadido (T-26) pero usando una COLA
 */
function handleFileChange(filePath) {
  writeLog('INFO', `Monitoreo: Archivo encolado para escaneo -> ${filePath}`);
  
  if (!scanQueue.includes(filePath)) {
    scanQueue.push(filePath);
  }
  
  processQueue();
}

async function processQueue() {
  if (isScanning || scanQueue.length === 0) return;
  
  isScanning = true;
  const filePath = scanQueue.shift();

  try {
    const summary = await scanTarget(filePath);
    
    // Si hay amenaza (T-27, T-39)
    if (summary.threatsFound > 0) {
      writeLog('DANGER', `¡Alerta en tiempo real! Amenaza encontrada en ${filePath}`);
      const threat = summary.threats[0];
      
      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        windows[0].webContents.send('threat-detected', threat);
      }

      // T-39 Notificación Nativa
      new Notification({
        title: 'RustGuard: ¡Amenaza Detectada!',
        body: `Se ha encontrado ${threat.threatName} en un archivo reciente. Revisa la aplicación inmediatamente.`,
        urgency: 'critical'
      }).show();
    } else {
      writeLog('SUCCESS', `Limpio: ${filePath}`);
    }
  } catch (error) {
    writeLog('ERROR', `Error al escanear archivo en tiempo real: ${error.message}`);
  } finally {
    isScanning = false;
    // Procesar el siguiente archivo si hay
    if (scanQueue.length > 0) {
      processQueue();
    }
  }
}

function notifyStatusChange() {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    windows[0].webContents.send('realtime-status-changed', isRealTimeEnabled);
  }
}
