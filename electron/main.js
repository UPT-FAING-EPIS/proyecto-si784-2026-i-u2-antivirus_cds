import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 900,
    minHeight: 650,
    frame: false, // Frameless window as per design.md
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // We'll point this to the dist folder when building
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

import { updateSignatures, scanTarget, quickScan, fullScan, cancelActiveScan } from './clamav.js';
import { quarantineFile, restoreFile, deletePermanently } from './quarantine.js';
import { getQuarantineRecords, getScanHistory } from './db.js';
import { startWatcher, stopWatcher, getWatcherStatus } from './watcher.js';
import { startAntiRansomware, stopAntiRansomware, getAntiRansomwareStatus } from './honeypot.js';
import { ipcMain, dialog } from 'electron';

// Register IPC handlers

// Scan handlers
ipcMain.handle('cancel-scan', async () => {
  return cancelActiveScan();
});

ipcMain.handle('scan-quick', async () => {
  return quickScan();
});

ipcMain.handle('scan-full', async () => {
  return fullScan();
});

ipcMain.handle('scan-target', async (event, targetPath) => {
  return scanTarget(targetPath);
});

ipcMain.handle('select-folder', async () => {
  const win = BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('quarantine-file', async (event, originalPath, threatName) => {
  return quarantineFile(originalPath, threatName);
});

ipcMain.handle('restore-file', async (event, id) => {
  return restoreFile(id);
});

ipcMain.handle('delete-quarantine-file', async (event, id) => {
  return deletePermanently(id);
});

ipcMain.handle('get-quarantine-records', async () => {
  return getQuarantineRecords();
});

ipcMain.handle('get-scan-history', async () => {
  return getScanHistory();
});

ipcMain.handle('export-history', async () => {
  const win = BrowserWindow.getFocusedWindow();
  const result = await dialog.showSaveDialog(win, {
    title: 'Exportar Historial',
    defaultPath: 'RustGuard_Historial.txt',
    filters: [{ name: 'Text Files', extensions: ['txt'] }]
  });

  if (!result.canceled && result.filePath) {
    const fs = await import('fs');
    const records = getScanHistory();
    let txtContent = 'RUSTGUARD - HISTORIAL DE ESCANEOS\n=================================\n\n';
    
    for (const r of records) {
      txtContent += `[${new Date(r.started_at).toLocaleString()}] Tipo: ${r.scan_type.toUpperCase()} | Estado: ${r.status.toUpperCase()}\n`;
      txtContent += `Archivos analizados: ${r.files_scanned} | Amenazas: ${r.threats_found}\n`;
      if (r.finished_at) txtContent += `Finalizado: ${new Date(r.finished_at).toLocaleString()}\n`;
      txtContent += `---------------------------------\n`;
    }

    fs.writeFileSync(result.filePath, txtContent);
    return { success: true, path: result.filePath };
  }
  return { success: false, canceled: true };
});

ipcMain.handle('open-log', async (event, logPath) => {
  const { shell } = await import('electron');
  if (logPath) {
    await shell.openPath(logPath);
  }
});

ipcMain.handle('read-log', async (event, logPath) => {
  const fs = await import('fs');
  if (logPath && fs.existsSync(logPath)) {
    return fs.readFileSync(logPath, 'utf8');
  }
  return '';
});

ipcMain.handle('toggle-realtime', async (event, enable) => {
  if (enable) {
    startWatcher();
  } else {
    await stopWatcher();
  }
  return getWatcherStatus();
});

ipcMain.handle('get-realtime-status', async () => {
  return getWatcherStatus();
});

ipcMain.handle('toggle-antiransomware', async (event, enable) => {
  if (enable) {
    startAntiRansomware();
  } else {
    await stopAntiRansomware();
  }
  return getAntiRansomwareStatus();
});

ipcMain.handle('get-antiransomware-status', async () => {
  return getAntiRansomwareStatus();
});

// Window controls
ipcMain.on('window-minimize', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});

ipcMain.on('window-maximize', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    if (win.isMaximized()) {
      win.restore();
    } else {
      win.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});

import { startClamdService, stopClamdService } from './clamd_service.js';
import { generateClamAVConfigs } from './config_generator.js';

app.whenReady().then(async () => {
  // Generar archivos de configuración de ClamAV en userData
  generateClamAVConfigs();

  // T-38: Pantalla de splash
  const splash = new BrowserWindow({
    width: 400,
    height: 350,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  splash.loadFile(path.join(__dirname, 'splash.html'));

  // T-11: Actualización automática de firmas al iniciar la app
  try {
    await updateSignatures((log) => {
      console.log(`[Freshclam] ${log.rawLine}`);
      if (splash && !splash.isDestroyed()) {
        splash.webContents.send('splash-status', 'Actualizando firmas ClamAV...');
      }
    });
  } catch (err) {
    console.warn(`[Freshclam Aviso] No se pudo actualizar firmas automáticamente. Asegúrate de tener configurado freshclam.conf. Detalle: ${err.message}`);
  }

  // Iniciar demonio Clamd
  try {
    if (splash && !splash.isDestroyed()) {
      splash.webContents.send('splash-status', 'Cargando Motor Antivirus (clamd) en memoria...');
    }
    
    await startClamdService(
      (log) => console.log(log.rawLine),
      () => console.log('[Main] Motor Antivirus Listo.')
    );
  } catch (err) {
    console.error(`[Clamd Error] No se pudo iniciar el servicio clamd: ${err.message}`);
  }

  // Finalizar splash y abrir ventana principal
  createWindow();
  if (splash && !splash.isDestroyed()) {
    splash.close();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopClamdService();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
