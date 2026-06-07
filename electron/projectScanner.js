import { spawn } from 'node:child_process';
import path from 'node:path';
import { app } from 'electron';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resuelve la ruta al binario externo según si la app está empaquetada o en desarrollo.
 * En desarrollo:  <proyecto>/bin/<binName>
 * En producción:  <resourcesPath>/bin/<binName>
 */
function getBinPath(binName) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'bin', binName);
  }
  return path.join(__dirname, '..', 'bin', binName);
}

/**
 * Ejecuta un binario externo y retorna su stdout parseado como JSON.
 * @param {string} binPath - Ruta absoluta al ejecutable
 * @param {string[]} args - Argumentos CLI
 * @returns {Promise<object>} - Resultado parseado
 */
function runBinary(binPath, args) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    const proc = spawn(binPath, args, {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    proc.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(new Error(`Herramienta no encontrada: ${binPath}. Asegúrate de que el binario existe en la carpeta bin/.`));
      } else {
        reject(new Error(`Error al ejecutar ${path.basename(binPath)}: ${err.message}`));
      }
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${path.basename(binPath)} terminó con código ${code}. Stderr: ${stderr.trim()}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (parseErr) {
        reject(new Error(`No se pudo parsear la salida JSON de ${path.basename(binPath)}: ${parseErr.message}. Stdout: ${stdout.substring(0, 500)}`));
      }
    });
  });
}

/**
 * Ejecuta el escáner de secretos (Python compilado) sobre la ruta indicada.
 * @param {string} targetPath - Ruta del proyecto a analizar
 * @returns {Promise<object>}
 */
export async function runSecretScanner(targetPath) {
  const binName = process.platform === 'win32' ? 'secret-scanner.exe' : 'secret-scanner';
  const binPath = getBinPath(binName);
  return runBinary(binPath, ['--target', targetPath, '--format', 'json']);
}

/**
 * Ejecuta el analizador de dependencias (Kotlin compilado) sobre la ruta indicada.
 * @param {string} targetPath - Ruta del proyecto a analizar
 * @returns {Promise<object>}
 */
export async function runDependencyAnalyzer(targetPath) {
  const binName = process.platform === 'win32' ? 'dep-analyzer.exe' : 'dep-analyzer';
  const binPath = getBinPath(binName);
  return runBinary(binPath, ['--path', targetPath, '--format', 'json']);
}

/**
 * Escanea un proyecto completo ejecutando ambos escáneres en paralelo.
 * Retorna un objeto consolidado con los resultados de cada escáner y posibles errores.
 * @param {string} targetPath - Ruta del proyecto a analizar
 * @returns {Promise<{secrets: object|null, dependencies: object|null, errors: string[]}>}
 */
export async function scanFullProject(targetPath) {
  const errors = [];

  const [secretsResult, depsResult] = await Promise.allSettled([
    runSecretScanner(targetPath),
    runDependencyAnalyzer(targetPath),
  ]);

  let secrets = null;
  let dependencies = null;

  if (secretsResult.status === 'fulfilled') {
    secrets = secretsResult.value;
  } else {
    errors.push(`Secretos: ${secretsResult.reason.message}`);
  }

  if (depsResult.status === 'fulfilled') {
    dependencies = depsResult.value;
  } else {
    errors.push(`Dependencias: ${depsResult.reason.message}`);
  }

  return { secrets, dependencies, errors };
}
