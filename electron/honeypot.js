import fs from 'fs';
import path from 'path';
import os from 'os';
import chokidar from 'chokidar';
import { BrowserWindow } from 'electron';
import { writeLog } from './logger.js';

let honeypotWatcher = null;
let isAntiRansomwareEnabled = false;

const userProfile = os.homedir();
// Create honeypots in Documents and Desktop
const HONEYPOT_NAMES = ['.rg_canary.docx', '.rg_canary.jpg'];
const TARGET_DIRS = [
  path.join(userProfile, 'Documents'),
  path.join(userProfile, 'Desktop')
];

let activeHoneypots = [];

/**
 * Crea los archivos señuelo en los directorios objetivo
 */
function deployHoneypots() {
  activeHoneypots = [];
  
  for (const dir of TARGET_DIRS) {
    if (!fs.existsSync(dir)) continue;

    for (const name of HONEYPOT_NAMES) {
      const filePath = path.join(dir, name);
      try {
        // Create a fake file with some dummy content
        fs.writeFileSync(filePath, 'RustGuard Canary File. Do not modify. Si ves esto, no lo modifiques.');
        
        // In a real scenario on Windows, we could hide the file using 'attrib +h' via exec.
        // For simplicity and cross-platform compatibility, starting with '.' hides it on Linux/Mac.
        // On Windows it just makes it look like a system file extension, but we can call a command.
        if (os.platform() === 'win32') {
          import('child_process').then(({ exec }) => {
            exec(`attrib +h "${filePath}"`);
          });
        }
        
        activeHoneypots.push(filePath);
      } catch (err) {
        writeLog('WARNING', `No se pudo crear honeypot en ${filePath}: ${err.message}`);
      }
    }
  }
}

/**
 * Elimina los archivos señuelo
 */
function removeHoneypots() {
  for (const filePath of activeHoneypots) {
    try {
      if (fs.existsSync(filePath)) {
        // Remove hidden attribute first on Windows if needed, though fs.unlinkSync usually works
        if (os.platform() === 'win32') {
           import('child_process').then(({ execSync }) => {
             try { execSync(`attrib -h "${filePath}"`); } catch(e){}
             fs.unlinkSync(filePath);
           });
        } else {
          fs.unlinkSync(filePath);
        }
      }
    } catch (err) {
      writeLog('WARNING', `Error al limpiar honeypot ${filePath}: ${err.message}`);
    }
  }
  activeHoneypots = [];
}

/**
 * Inicia el monitoreo de los honeypots
 */
export function startAntiRansomware() {
  if (isAntiRansomwareEnabled) return;

  writeLog('INFO', 'Iniciando Escudo Anti-Ransomware (Heurística)...');
  deployHoneypots();

  if (activeHoneypots.length === 0) {
    writeLog('WARNING', 'No se pudieron desplegar honeypots. Anti-Ransomware inactivo.');
    return;
  }

  honeypotWatcher = chokidar.watch(activeHoneypots, {
    persistent: true,
    ignoreInitial: true,
  });

  // Si alguien modifica o borra un honeypot, ¡es un ataque!
  honeypotWatcher.on('change', handleRansomwareDetection);
  honeypotWatcher.on('unlink', handleRansomwareDetection);

  isAntiRansomwareEnabled = true;
  writeLog('SUCCESS', 'Escudo Anti-Ransomware ACTIVADO');
  notifyStatusChange();
}

/**
 * Detiene el monitoreo y limpia los honeypots
 */
export async function stopAntiRansomware() {
  if (!isAntiRansomwareEnabled) return;

  writeLog('INFO', 'Desactivando Escudo Anti-Ransomware...');
  
  if (honeypotWatcher) {
    await honeypotWatcher.close();
    honeypotWatcher = null;
  }

  removeHoneypots();
  isAntiRansomwareEnabled = false;
  
  writeLog('SUCCESS', 'Escudo Anti-Ransomware DESACTIVADO');
  notifyStatusChange();
}

export function getAntiRansomwareStatus() {
  return isAntiRansomwareEnabled;
}

/**
 * Maneja la detección de una alteración en el honeypot
 */
function handleRansomwareDetection(filePath) {
  writeLog('DANGER', `¡ALERTA CRÍTICA! Modificación detectada en archivo señuelo: ${filePath}`);
  writeLog('DANGER', `Posible ataque de Ransomware en progreso.`);

  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    const win = windows[0];
    
    // Forzar la ventana a primer plano
    if (win.isMinimized()) win.restore();
    win.maximize();
    win.setAlwaysOnTop(true);
    win.focus();
    win.setAlwaysOnTop(false); // No dejarla permanentemente bloqueando todo

    // Enviar señal de alerta al frontend
    win.webContents.send('ransomware-alert', {
      filePath,
      time: new Date().toISOString()
    });
  }
}

function notifyStatusChange() {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    windows[0].webContents.send('antiransomware-status-changed', isAntiRansomwareEnabled);
  }
}
