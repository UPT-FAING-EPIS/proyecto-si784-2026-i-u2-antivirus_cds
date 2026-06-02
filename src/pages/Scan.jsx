import React, { useState, useEffect } from 'react';
import { Zap, Search, FolderSearch, Loader2, XCircle } from 'lucide-react';
import LogViewer from '../components/LogViewer';
import ThreatModal from '../components/ThreatModal';

export default function Scan() {
  const [logs, setLogs] = useState([]);
  const [activeScanType, setActiveScanType] = useState(null);
  const [activeThreat, setActiveThreat] = useState(null);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onLogMessage((log) => {
        setLogs(prev => [...prev, log]);
      });

      // Also listen to real-time threats here if needed, or handle in Layout.
      // But for Scan view, threats found during manual scan are just logged.
      // We can also trigger the modal if we want.
      window.electronAPI.onThreatDetected((threat) => {
        setActiveThreat(threat);
      });
    }
  }, []);

  const handleCancelScan = async () => {
    if (window.electronAPI) {
      const canceled = await window.electronAPI.cancelScan();
      if (canceled) {
        setActiveScanType(null);
      }
    }
  };

  const handleScanQuick = async () => {
    if (activeScanType) return;
    setActiveScanType('quick');
    setLogs([]);
    try {
      if (window.electronAPI) {
        await window.electronAPI.scanQuick();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActiveScanType(null);
    }
  };

  const handleScanFull = async () => {
    if (activeScanType) return;
    setActiveScanType('full');
    setLogs([]);
    try {
      if (window.electronAPI) {
        await window.electronAPI.scanFull();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActiveScanType(null);
    }
  };

  const handleScanFolder = async () => {
    if (activeScanType) return;
    if (window.electronAPI) {
      const folderPath = await window.electronAPI.selectFolder();
      if (!folderPath) return;

      setActiveScanType('folder');
      setLogs([]);
      try {
        await window.electronAPI.scanTarget(folderPath);
      } catch (err) {
        console.error(err);
      } finally {
        setActiveScanType(null);
      }
    }
  };

  const handleQuarantine = async (threat) => {
    if (window.electronAPI) {
      await window.electronAPI.quarantineFile(threat.file, threat.threatName);
    }
    setActiveThreat(null);
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-5xl mx-auto animate-in fade-in duration-300">
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--accent-primary)] mb-2">Centro de Escaneo</h1>
          <p className="text-[var(--text-muted)]">Analiza tu sistema en busca de malware y amenazas ocultas.</p>
        </div>
        {activeScanType && (
          <button 
            onClick={handleCancelScan}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-danger)]/10 text-[var(--accent-danger)] border border-[var(--accent-danger)]/30 hover:bg-[var(--accent-danger)] hover:text-[var(--bg-base)] rounded-lg font-semibold transition-all animate-in fade-in"
          >
            <XCircle size={20} />
            Detener Escaneo
          </button>
        )}
      </div>

      {/* Acciones de escaneo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button 
          onClick={handleScanQuick}
          disabled={!!activeScanType}
          className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
        >
          {activeScanType === 'quick' ? <Loader2 className="animate-spin text-[var(--accent-primary)]" size={32} /> : <Zap className="text-[var(--accent-primary)] group-hover:scale-110 transition-transform" size={32} />}
          <div className="text-center">
            <h3 className="font-semibold text-[var(--text-primary)]">Escaneo Rápido</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Áreas críticas</p>
          </div>
        </button>

        <button 
          onClick={handleScanFull}
          disabled={!!activeScanType}
          className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
        >
          {activeScanType === 'full' ? <Loader2 className="animate-spin text-[var(--accent-info)]" size={32} /> : <Search className="text-[var(--accent-info)] group-hover:scale-110 transition-transform" size={32} />}
          <div className="text-center">
            <h3 className="font-semibold text-[var(--text-primary)]">Escaneo Completo</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Todo el sistema</p>
          </div>
        </button>

        <button 
          onClick={handleScanFolder}
          disabled={!!activeScanType}
          className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
        >
          {activeScanType === 'folder' ? <Loader2 className="animate-spin text-[var(--accent-warning)]" size={32} /> : <FolderSearch className="text-[var(--accent-warning)] group-hover:scale-110 transition-transform" size={32} />}
          <div className="text-center">
            <h3 className="font-semibold text-[var(--text-primary)]">Escanear Carpeta</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Seleccionar destino</p>
          </div>
        </button>
      </div>

      {/* Log Viewer */}
      <div className="flex-1 min-h-[300px]">
        <LogViewer logs={logs} />
      </div>

      <ThreatModal 
        threat={activeThreat} 
        onQuarantine={handleQuarantine} 
        onIgnore={() => setActiveThreat(null)} 
      />

    </div>
  );
}
