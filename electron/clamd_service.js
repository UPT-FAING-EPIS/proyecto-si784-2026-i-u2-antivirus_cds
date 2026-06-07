import { spawn } from 'child_process';
import path from 'path';
import { CLAMD_CONF_PATH } from './paths.js';

// Default path for ClamAV installation on Windows via Winget
const CLAMAV_DIR = 'C:\\Program Files\\ClamAV';
const CLAMD_EXE = path.join(CLAMAV_DIR, 'clamd.exe');

let clamdProcess = null;

export function startClamdService(onLog, onReady) {
  return new Promise((resolve, reject) => {
    // Si ya está corriendo, no hacer nada
    if (clamdProcess) {
      if (onReady) onReady();
      return resolve();
    }

    import('fs').then(fs => {
      if (!fs.existsSync(CLAMD_EXE)) {
        return reject(new Error(`No se encontró ClamAV en ${CLAMAV_DIR}. Verifica que esté instalado.`));
      }

      const args = [`--config-file=${CLAMD_CONF_PATH}`];
      clamdProcess = spawn(CLAMD_EXE, args);

      let isReady = false;

      clamdProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (onLog) onLog({ status: 'INFO', rawLine: `[Clamd] ${output}` });

        // Identificar cuándo clamd está listo para recibir conexiones
        // clamd suele imprimir algo parecido a "Listening daemon..." o no imprimir nada si tiene Foreground activado
        // Para asegurar compatibilidad, asumimos que si no hay error tras un rato, o si emite "Socket found" o "listening" está listo
        if (!isReady && (output.toLowerCase().includes('listening') || output.toLowerCase().includes('accepting'))) {
          isReady = true;
          if (onReady) onReady();
          resolve();
        }
      });

      clamdProcess.stderr.on('data', (data) => {
        const errOutput = data.toString().trim();
        if (onLog) onLog({ status: 'WARNING', rawLine: `[Clamd] ${errOutput}` });
        
        // A veces clamd imprime advertencias pero sigue funcionando. 
        // Si hay un error fatal, el proceso se cerrará.
      });

      clamdProcess.on('close', (code) => {
        clamdProcess = null;
        if (onLog) onLog({ status: 'INFO', rawLine: `[Clamd] Servicio detenido con código ${code}` });
      });

      clamdProcess.on('error', (err) => {
        clamdProcess = null;
        reject(new Error(`Failed to start Clamd: ${err.message}`));
      });

      // Fallback: Si clamd no emite un texto obvio de "listening" pero no crashea en 15 segundos, asumimos que está listo.
      setTimeout(() => {
        if (!isReady && clamdProcess) {
          isReady = true;
          if (onReady) onReady();
          resolve();
        }
      }, 15000);
    }).catch(reject);
  });
}

export function stopClamdService() {
  if (clamdProcess) {
    clamdProcess.kill('SIGINT');
    clamdProcess = null;
  }
}
