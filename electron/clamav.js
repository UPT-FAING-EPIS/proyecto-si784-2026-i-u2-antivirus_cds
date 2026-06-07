import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { initSessionLog, writeLog, getCurrentLogFilePath } from './logger.js';
import { insertScanStart, updateScanFinish } from './db.js';
import { CLAMAV_DB_DIR, FRESHCLAM_CONF_PATH, CLAMD_CONF_PATH } from './paths.js';

// Default path for ClamAV installation on Windows via Winget
const CLAMAV_DIR = 'C:\\Program Files\\ClamAV';
const CLAMDSCAN_EXE = path.join(CLAMAV_DIR, 'clamdscan.exe');
const FRESHCLAM_EXE = path.join(CLAMAV_DIR, 'freshclam.exe');

let activeClamProcess = null;
let activeScanId = null;

export function cancelActiveScan() {
  if (activeClamProcess) {
    activeClamProcess.emit('cancel-scan');
    activeClamProcess.kill('SIGKILL');
    return true;
  }
  return false;
}

/**
 * Parses a single line of output from clamscan
 */
function parseClamScanLine(line) {
  const matchFound = line.match(/^(.*?):\s+(.*?)\s+FOUND$/);
  if (matchFound) {
    return {
      file: matchFound[1],
      status: 'THREAT',
      threatName: matchFound[2],
      rawLine: line
    };
  }
  
  const matchOk = line.match(/^(.*?):\s+OK$/);
  if (matchOk) {
    return {
      file: matchOk[1],
      status: 'CLEAN',
      threatName: null,
      rawLine: line
    };
  }

  // Filtrar advertencias de archivos bloqueados por el SO (Error 32: Archivo en uso / Access denied)
  if (
    line.includes("Can't open file") || 
    line.includes("File path check failure") || 
    line.includes("File tree walk aborted") ||
    line.includes("Access denied. ERROR") ||
    line.includes("Empty file")
  ) {
    return {
      file: null,
      status: 'IGNORED',
      threatName: null,
      rawLine: line
    };
  }

  return {
    file: null,
    status: 'INFO',
    threatName: null,
    rawLine: line
  };
}

async function generateScanList(targetPaths, listFilePath, context) {
  const stream = fs.createWriteStream(listFilePath, { flags: 'w' });
  
  async function walk(dir) {
    if (context.isCancelled) return;
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (context.isCancelled) return;
        const fullPath = path.join(dir, entry.name);
        try {
          if (entry.isDirectory()) {
            await walk(fullPath);
          } else {
            stream.write(fullPath + '\n');
          }
        } catch (e) {}
      }
    } catch (e) {
      // Ignorar EPERM/EACCES
    }
  }

  for (const target of targetPaths) {
    if (context.isCancelled) break;
    try {
      const stat = await fs.promises.stat(target);
      if (stat.isDirectory()) {
        await walk(target);
      } else {
        stream.write(target + '\n');
      }
    } catch (e) {}
  }
  
  return new Promise(resolve => stream.end(resolve));
}

/**
 * Core function to run clamscan
 * @param {string[]} targetPaths - Array of paths to scan
 * @param {string} scanType - quick, full, or file
 * @param {string[]} additionalArgs - Extra arguments for clamscan (e.g., filesize limits)
 */
function runClamScan(targetPaths, scanType, additionalArgs = []) {
  return new Promise(async (resolve, reject) => {
    // Inicializar log para esta sesión
    const logFile = initSessionLog();
    writeLog('INFO', `Iniciando escaneo tipo: ${scanType}. Recopilando archivos...`);
    
    if (!fs.existsSync(CLAMDSCAN_EXE)) {
      writeLog('ERROR', `No se encontró ClamAV en ${CLAMAV_DIR}. Verifica que esté instalado.`);
      const scanId = insertScanStart(scanType, logFile);
      updateScanFinish(scanId, 0, 0, 'error');
      return resolve({ scannedFiles: 0, threatsFound: 0, threats: [] });
    }

    // Registrar inicio en DB
    const scanId = insertScanStart(scanType, logFile);
    activeScanId = scanId;

    let context = { isCancelled: false };
    
    // Mock clamProcess para cancelación durante la recopilación
    activeClamProcess = {
      emit: () => {},
      kill: () => { context.isCancelled = true; }
    };

    const listFilePath = path.join(os.tmpdir(), `rustguard_scan_${scanId}.txt`);
    await generateScanList(targetPaths, listFilePath, context);

    if (context.isCancelled) {
      if (fs.existsSync(listFilePath)) fs.unlinkSync(listFilePath);
      activeClamProcess = null;
      activeScanId = null;
      updateScanFinish(scanId, 0, 0, 'cancelled');
      writeLog('WARNING', 'Escaneo cancelado por el usuario.');
      return resolve({ scannedFiles: 0, threatsFound: 0, threats: [] });
    }

    writeLog('INFO', `Archivos indexados. Iniciando motor ClamAV...`);

    const args = [`--config-file=${CLAMD_CONF_PATH}`, '--multiscan', ...additionalArgs, '-f', listFilePath];
    const clamProcess = spawn(CLAMDSCAN_EXE, args);
    activeClamProcess = clamProcess;

    let isCancelled = false;
    clamProcess.on('cancel-scan', () => {
      isCancelled = true;
    });

    const summary = {
      scannedFiles: 0,
      threatsFound: 0,
      threats: []
    };

    let remainingBuffer = '';

    clamProcess.stdout.on('data', (data) => {
      const chunk = remainingBuffer + data.toString();
      const lines = chunk.split('\n');
      remainingBuffer = lines.pop(); // Keep the last incomplete line in buffer

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;

        const parsed = parseClamScanLine(cleanLine);
        if (parsed.status === 'CLEAN') {
          summary.scannedFiles++;
          writeLog('SUCCESS', cleanLine);
        } else if (parsed.status === 'THREAT') {
          summary.scannedFiles++;
          summary.threatsFound++;
          summary.threats.push(parsed);
          writeLog('DANGER', cleanLine);
        } else if (parsed.status === 'INFO') {
          writeLog('INFO', cleanLine);
        }
      }
    });

    clamProcess.stderr.on('data', (data) => {
      writeLog('ERROR', data.toString().trim());
    });

    clamProcess.on('close', (code) => {
      activeClamProcess = null;
      activeScanId = null;
      
      if (fs.existsSync(listFilePath)) {
        try { fs.unlinkSync(listFilePath); } catch (e) {}
      }

      if (isCancelled) {
        updateScanFinish(scanId, summary.scannedFiles, summary.threatsFound, 'cancelled');
        writeLog('WARNING', 'Escaneo cancelado por el usuario.');
        resolve(summary);
        return;
      }

      // Al usar -f, clamdscan no aborta; si termina (0, 1 o 2), lo damos por válido.
      if (code === 0 || code === 1 || code === 2) {
        updateScanFinish(scanId, summary.scannedFiles, summary.threatsFound, 'completed');
        writeLog('INFO', `Escaneo completado. Archivos: ${summary.scannedFiles}, Amenazas: ${summary.threatsFound}`);
        resolve(summary);
      } else {
        updateScanFinish(scanId, summary.scannedFiles, summary.threatsFound, 'error');
        reject(new Error(`ClamScan exited with code ${code}`));
      }
    });

    clamProcess.on('error', (err) => {
      if (fs.existsSync(listFilePath)) {
        try { fs.unlinkSync(listFilePath); } catch (e) {}
      }
      updateScanFinish(scanId, 0, 0, 'error');
      writeLog('ERROR', `Error iniciando clamdscan: ${err.message}`);
      reject(new Error(`Failed to start ClamdScan: ${err.message}`));
    });
  });
}

/**
 * Escaneo de archivo/directorio único
 */
export function scanTarget(targetPath) {
  // Escaneo personalizado: Balanceado
  // clamdscan toma la configuración de clamd.conf, no necesita argumentos extra de tamaño aquí
  const additionalArgs = [];
  return runClamScan([targetPath], 'file', additionalArgs);
}

/**
 * Escaneo Rápido: AppData, Temp, Downloads, Startup
 */
export function quickScan() {
  const userProfile = os.homedir();
  const targets = [
    path.join(userProfile, 'AppData'),
    path.join(userProfile, 'Downloads'),
    os.tmpdir(),
    path.join(userProfile, 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup')
  ];
  
  // Estereotipo de Escaneo Rápido: Muy veloz
  // clamdscan lee límites de clamd.conf. No le pasamos limits por CLI.
  const additionalArgs = [];
  
  return runClamScan(targets, 'quick', additionalArgs);
}

/**
 * Escaneo Completo: Todo el disco C (o la unidad seleccionada)
 */
export function fullScan(drivePath = 'C:\\') {
  // Estereotipo de Escaneo Completo: Analiza todo a fondo
  const additionalArgs = [];
  return runClamScan([drivePath], 'full', additionalArgs);
}

/**
 * Actualiza la base de firmas usando freshclam
 */
export function updateSignatures(onLog) {
  return new Promise((resolve, reject) => {
    const args = [`--datadir=${CLAMAV_DB_DIR}`, `--config-file=${FRESHCLAM_CONF_PATH}`];
    const freshclamProcess = spawn(FRESHCLAM_EXE, args);
    
    freshclamProcess.stdout.on('data', (data) => {
      if (onLog) onLog({ status: 'INFO', rawLine: data.toString().trim() });
    });

    freshclamProcess.stderr.on('data', (data) => {
      if (onLog) onLog({ status: 'WARNING', rawLine: data.toString().trim() });
    });

    freshclamProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        reject(new Error(`Freshclam exited with code ${code}`));
      }
    });

    freshclamProcess.on('error', (err) => {
      reject(new Error(`Failed to start Freshclam: ${err.message}`));
    });
  });
}
