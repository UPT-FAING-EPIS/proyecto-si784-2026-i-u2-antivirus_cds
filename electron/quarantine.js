import fs from 'fs';
import path from 'path';
import { insertQuarantineRecord, markQuarantineRestored, getQuarantineRecords } from './db.js';
import { writeLog } from './logger.js';
import { QUARANTINE_DIR } from './paths.js';

/**
 * Mueve un archivo a la carpeta de cuarentena y registra la acción (T-20, T-21)
 */
export function quarantineFile(originalPath, threatName) {
  try {
    if (!fs.existsSync(originalPath)) {
      throw new Error(`El archivo original no existe: ${originalPath}`);
    }

    const filename = path.basename(originalPath);
    const quarantineFilename = `${Date.now()}_${filename}.quar`;
    const quarantinePath = path.join(QUARANTINE_DIR, quarantineFilename);

    // Mover archivo
    fs.renameSync(originalPath, quarantinePath);

    // Registrar en BD (T-21)
    const id = insertQuarantineRecord(originalPath, quarantinePath, threatName);
    
    writeLog('WARNING', `Archivo movido a cuarentena: ${originalPath} -> ${quarantineFilename}`);
    return { success: true, id };
  } catch (error) {
    writeLog('ERROR', `Error al poner en cuarentena ${originalPath}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Restaura un archivo desde la cuarentena a su ruta original (T-23)
 */
export function restoreFile(id) {
  try {
    const records = getQuarantineRecords();
    const record = records.find(r => r.id === id);

    if (!record) {
      throw new Error('Registro de cuarentena no encontrado');
    }

    if (record.restored) {
      throw new Error('El archivo ya ha sido restaurado');
    }

    if (!fs.existsSync(record.quarantine_path)) {
      throw new Error('El archivo en cuarentena no existe en disco');
    }

    // Mover archivo de vuelta
    fs.renameSync(record.quarantine_path, record.original_path);

    // Actualizar BD
    markQuarantineRestored(id);

    writeLog('INFO', `Archivo restaurado desde cuarentena: ${record.original_path}`);
    return { success: true };
  } catch (error) {
    writeLog('ERROR', `Error al restaurar archivo (ID: ${id}): ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Elimina un archivo permanentemente de la cuarentena (T-24)
 */
export function deletePermanently(id) {
  try {
    const records = getQuarantineRecords();
    const record = records.find(r => r.id === id);

    if (!record) {
      throw new Error('Registro de cuarentena no encontrado');
    }

    if (fs.existsSync(record.quarantine_path)) {
      fs.unlinkSync(record.quarantine_path);
    }

    // Actualizar BD para indicar que fue "eliminado" marcándolo como restaurado (o eliminar el registro)
    // Para historial, es mejor marcarlo como restaurado o crear un campo eliminado.
    // Usaremos markQuarantineRestored temporalmente, aunque un DELETE FROM o flag is_deleted sería ideal.
    // Como el schema no tiene is_deleted, y restored indica que ya no está en cuarentena.
    // Lo eliminaremos físicamente y actualizaremos restored = 1 para que desaparezca de la vista activa.
    markQuarantineRestored(id);

    writeLog('INFO', `Archivo eliminado permanentemente: ${record.original_path}`);
    return { success: true };
  } catch (error) {
    writeLog('ERROR', `Error al eliminar permanentemente archivo (ID: ${id}): ${error.message}`);
    return { success: false, error: error.message };
  }
}
