import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { initSessionLog, writeLog, getCurrentLogFilePath } from './logger.js';
import { insertScanStart, updateScanFinish } from './db.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default path for ClamAV installation on Windows via Winget
const CLAMAV_DIR = 'C:\\Program Files\\ClamAV';
const CLAMSCAN_EXE = path.join(CLAMAV_DIR, 'clamscan.exe');
const FRESHCLAM_EXE = path.join(CLAMAV_DIR, 'freshclam.exe');

const LOCAL_DB_DIR = path.join(__dirname, '..', 'clamav_db');
const LOCAL_CONF = path.join(__dirname, '..', 'freshclam.conf');

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

  return {
    file: null,
    status: 'INFO',
    threatName: null,
    rawLine: line
  };
}

/**
 * Core function to run clamscan
 * @param {string[]} targetPaths - Array of paths to scan
 * @param {string} scanType - quick, full, or file
 * @param {string[]} additionalArgs - Extra arguments for clamscan (e.g., filesize limits)
 */
function runClamScan(targetPaths, scanType, additionalArgs = []) {
  return new Promise((resolve, reject) => {
    // Inicializar log para esta sesión
    const logFile = initSessionLog();
    writeLog('INFO', `Iniciando escaneo tipo: ${scanType}`);
    
    import('fs').then(fs => {
      if (!fs.existsSync(CLAMSCAN_EXE)) {
        writeLog('ERROR', `No se encontró ClamAV en ${CLAMAV_DIR}. Verifica que esté instalado.`);
        // Enviar error a la DB
        const scanId = insertScanStart(scanType, logFile);
        updateScanFinish(scanId, 0, 0, 'error');
        // Resolver vacio para que la UI se detenga suavemente
        return resolve({ scannedFiles: 0, threatsFound: 0, threats: [] });
      }

      // Registrar inicio en DB
      const scanId = insertScanStart(scanType, logFile);
      activeScanId = scanId;

      const args = ['--recursive', `--database=${LOCAL_DB_DIR}`, ...additionalArgs, ...targetPaths];
      const clamProcess = spawn(CLAMSCAN_EXE, args);
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
          } else {
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

        if (isCancelled) {
          updateScanFinish(scanId, summary.scannedFiles, summary.threatsFound, 'cancelled');
          writeLog('WARNING', 'Escaneo cancelado por el usuario.');
          resolve(summary);
          return;
        }

        if (code === 0 || code === 1) {
          updateScanFinish(scanId, summary.scannedFiles, summary.threatsFound, 'completed');
          writeLog('INFO', `Escaneo completado. Archivos: ${summary.scannedFiles}, Amenazas: ${summary.threatsFound}`);
          resolve(summary);
        } else {
          updateScanFinish(scanId, summary.scannedFiles, summary.threatsFound, 'error');
          reject(new Error(`ClamScan exited with code ${code}`));
        }
      });

      clamProcess.on('error', (err) => {
        updateScanFinish(scanId, 0, 0, 'error');
        writeLog('ERROR', `Error iniciando clamscan: ${err.message}`);
        reject(new Error(`Failed to start ClamScan: ${err.message}`));
      });
    }).catch(reject);
  });
}

/**
 * Escaneo de archivo/directorio único
 */
export function scanTarget(targetPath) {
  // Escaneo personalizado: Balanceado
  const additionalArgs = ['--max-filesize=500M', '--max-scansize=500M', '--max-recursion=10'];
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
  
  // Estereotipo de Escaneo Rápido: Muy veloz, omite archivos gigantes, no profundiza mucho en archivos comprimidos
  const additionalArgs = [
    '--max-filesize=20M',
    '--max-scansize=50M',
    '--max-recursion=2',       // Poca profundidad en zips
    '--max-dir-recursion=15',  // Límite de carpetas
    '--scan-archive=no'        // Saltar escaneo profundo de archivos comprimidos gigantes
  ];
  
  return runClamScan(targets, 'quick', additionalArgs);
}

/**
 * Escaneo Completo: Todo el disco C (o la unidad seleccionada)
 */
export function fullScan(drivePath = 'C:\\') {
  // Estereotipo de Escaneo Completo: Analiza todo a fondo, sin límites estrictos
  const additionalArgs = [
    '--max-filesize=2000M', 
    '--max-scansize=2000M', 
    '--max-recursion=15',
    '--scan-archive=yes'
  ];
  return runClamScan([drivePath], 'full', additionalArgs);
}

/**
 * Actualiza la base de firmas usando freshclam
 */
export function updateSignatures(onLog) {
  return new Promise((resolve, reject) => {
    const args = [`--datadir=${LOCAL_DB_DIR}`, `--config-file=${LOCAL_CONF}`];
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
