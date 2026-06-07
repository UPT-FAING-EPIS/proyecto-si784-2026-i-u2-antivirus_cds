import fs from 'fs';
import path from 'path';
import { BrowserWindow } from 'electron';
import { LOGS_DIR } from './paths.js';

let currentLogStream = null;
let currentLogFilePath = null;

/**
 * Initializes a new log file for the current session/scan.
 * Format: YYYY-MM-DD_HH-MM-SS.log
 */
export function initSessionLog() {

  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const filename = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.log`;
  
  currentLogFilePath = path.join(LOGS_DIR, filename);
  
  // Close previous stream if open
  if (currentLogStream) {
    currentLogStream.end();
  }

  currentLogStream = fs.createWriteStream(currentLogFilePath, { flags: 'a' });
  return currentLogFilePath;
}

/**
 * Writes a log line to the file and emits it to the renderer process (T-14).
 * @param {string} level - 'INFO', 'SUCCESS', 'WARNING', 'DANGER'
 * @param {string} message - The actual log message
 */
export function writeLog(level, message) {
  if (!currentLogStream) {
    initSessionLog();
  }

  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const timestamp = `[${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}]`;
  
  const logLine = `${timestamp} [${level}] ${message}`;
  
  // Write to file (T-13)
  currentLogStream.write(logLine + '\n');
  
  // Emit to renderer via IPC (T-14)
  const windows = BrowserWindow.getAllWindows();
  windows.forEach(win => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('log-message', {
        timestamp,
        level,
        message,
        rawLine: logLine
      });
    }
  });
}

/**
 * Helper to retrieve the current log file path
 */
export function getCurrentLogFilePath() {
  return currentLogFilePath;
}
