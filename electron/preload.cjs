const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onLogMessage: (callback) => ipcRenderer.on('log-message', (_event, data) => callback(data)),
  
  // Scan methods
  cancelScan: () => ipcRenderer.invoke('cancel-scan'),
  scanQuick: () => ipcRenderer.invoke('scan-quick'),
  scanFull: () => ipcRenderer.invoke('scan-full'),
  scanTarget: (targetPath) => ipcRenderer.invoke('scan-target', targetPath),
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  // Quarantine methods
  quarantineFile: (originalPath, threatName) => ipcRenderer.invoke('quarantine-file', originalPath, threatName),
  restoreFile: (id) => ipcRenderer.invoke('restore-file', id),
  deleteQuarantineFile: (id) => ipcRenderer.invoke('delete-quarantine-file', id),
  getQuarantineRecords: () => ipcRenderer.invoke('get-quarantine-records'),

  // History methods
  getScanHistory: () => ipcRenderer.invoke('get-scan-history'),
  exportHistory: () => ipcRenderer.invoke('export-history'),
  openLog: (logPath) => ipcRenderer.invoke('open-log', logPath),
  readLog: (logPath) => ipcRenderer.invoke('read-log', logPath),
  
  // Real-time methods
  toggleRealtime: (enable) => ipcRenderer.invoke('toggle-realtime', enable),
  getRealtimeStatus: () => ipcRenderer.invoke('get-realtime-status'),
  onThreatDetected: (callback) => ipcRenderer.on('threat-detected', (_event, data) => callback(data)),
  onRealtimeStatusChanged: (callback) => ipcRenderer.on('realtime-status-changed', (_event, data) => callback(data)),

  // Anti-Ransomware methods
  toggleAntiransomware: (enable) => ipcRenderer.invoke('toggle-antiransomware', enable),
  getAntiransomwareStatus: () => ipcRenderer.invoke('get-antiransomware-status'),
  onRansomwareAlert: (callback) => ipcRenderer.on('ransomware-alert', (_event, data) => callback(data)),
  onAntiransomwareStatusChanged: (callback) => ipcRenderer.on('antiransomware-status-changed', (_event, data) => callback(data)),

  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
});
