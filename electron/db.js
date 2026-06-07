import Database from 'better-sqlite3';
import path from 'path';
import { DB_DIR } from './paths.js';

const dbPath = path.join(DB_DIR, 'rustguard.db');
const db = new Database(dbPath);

// Activar foreign keys
db.pragma('journal_mode = WAL');

// T-17: Crear tabla scan_history
db.exec(`
  CREATE TABLE IF NOT EXISTS scan_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_type TEXT NOT NULL,
    started_at DATETIME NOT NULL,
    finished_at DATETIME,
    files_scanned INTEGER DEFAULT 0,
    threats_found INTEGER DEFAULT 0,
    log_file TEXT,
    status TEXT NOT NULL
  )
`);

// T-18: Crear tabla quarantine
db.exec(`
  CREATE TABLE IF NOT EXISTS quarantine (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    original_path TEXT NOT NULL,
    quarantine_path TEXT NOT NULL,
    threat_name TEXT,
    quarantined_at DATETIME NOT NULL,
    restored BOOLEAN DEFAULT 0
  )
`);

// --- Funciones para scan_history (T-19) ---

export function insertScanStart(scanType, logFile) {
  const stmt = db.prepare(`
    INSERT INTO scan_history (scan_type, started_at, log_file, status)
    VALUES (?, datetime('now', 'localtime'), ?, 'running')
  `);
  const info = stmt.run(scanType, logFile);
  return info.lastInsertRowid;
}

export function updateScanFinish(scanId, filesScanned, threatsFound, status) {
  const stmt = db.prepare(`
    UPDATE scan_history 
    SET finished_at = datetime('now', 'localtime'),
        files_scanned = ?,
        threats_found = ?,
        status = ?
    WHERE id = ?
  `);
  stmt.run(filesScanned, threatsFound, status, scanId);
}

export function getScanHistory() {
  return db.prepare('SELECT * FROM scan_history ORDER BY started_at DESC').all();
}

// --- Funciones para quarantine ---

export function insertQuarantineRecord(originalPath, quarantinePath, threatName) {
  const stmt = db.prepare(`
    INSERT INTO quarantine (original_path, quarantine_path, threat_name, quarantined_at, restored)
    VALUES (?, ?, ?, datetime('now', 'localtime'), 0)
  `);
  const info = stmt.run(originalPath, quarantinePath, threatName);
  return info.lastInsertRowid;
}

export function markQuarantineRestored(id) {
  const stmt = db.prepare('UPDATE quarantine SET restored = 1 WHERE id = ?');
  stmt.run(id);
}

export function getQuarantineRecords() {
  return db.prepare('SELECT * FROM quarantine ORDER BY quarantined_at DESC').all();
}

export default db;
