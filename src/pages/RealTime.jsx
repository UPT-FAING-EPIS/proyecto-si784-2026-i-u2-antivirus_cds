import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Activity } from 'lucide-react';
import LogViewer from '../components/LogViewer';

export default function RealTime() {
  const [realtimeStatus, setRealtimeStatus] = useState(false);
  const [antiRansomwareStatus, setAntiRansomwareStatus] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getRealtimeStatus().then(setRealtimeStatus);
      window.electronAPI.getAntiransomwareStatus().then(setAntiRansomwareStatus);
      
      window.electronAPI.onRealtimeStatusChanged((status) => {
        setRealtimeStatus(status);
      });

      window.electronAPI.onAntiransomwareStatusChanged((status) => {
        setAntiRansomwareStatus(status);
      });

      // Capture logs relevant to real-time (we will capture all logs for simplicity, 
      // but they are prefixed in watcher.js)
      window.electronAPI.onLogMessage((log) => {
        setLogs(prev => [...prev, log]);
      });
    }
  }, []);

  const handleToggle = async () => {
    if (window.electronAPI) {
      const newStatus = await window.electronAPI.toggleRealtime(!realtimeStatus);
      setRealtimeStatus(newStatus);
    } else {
      setRealtimeStatus(!realtimeStatus);
    }
  };

  const handleAntiransomwareToggle = async () => {
    if (window.electronAPI) {
      const newStatus = await window.electronAPI.toggleAntiransomware(!antiRansomwareStatus);
      setAntiRansomwareStatus(newStatus);
    } else {
      setAntiRansomwareStatus(!antiRansomwareStatus);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-5xl mx-auto animate-in fade-in duration-300">
      
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-[var(--accent-primary)] mb-2">Protección en Tiempo Real</h1>
        <p className="text-[var(--text-muted)]">Vigila y escanea automáticamente los archivos nuevos o modificados en áreas críticas.</p>
      </div>

      {/* Control Panel */}
      <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border)] p-8 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-full transition-colors duration-500 ${realtimeStatus ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'}`}>
            {realtimeStatus ? <ShieldCheck size={48} /> : <ShieldAlert size={48} />}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Estado: <span className={realtimeStatus ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}>
                {realtimeStatus ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {realtimeStatus 
                ? 'Monitoreando las descargas y el escritorio continuamente.' 
                : 'El sistema es vulnerable a nuevas descargas. Se recomienda activarlo.'}
            </p>
          </div>
        </div>

        <button 
          onClick={handleToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${realtimeStatus ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border)]'}`}
        >
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${realtimeStatus ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border)] p-8 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-full transition-colors duration-500 ${antiRansomwareStatus ? 'bg-red-500/20 text-red-500' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'}`}>
            {antiRansomwareStatus ? <ShieldCheck size={48} /> : <ShieldAlert size={48} />}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Anti-Ransomware (Heurística): <span className={antiRansomwareStatus ? 'text-red-500' : 'text-[var(--text-muted)]'}>
                {antiRansomwareStatus ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {antiRansomwareStatus 
                ? 'Vigilando archivos señuelo para detectar cifrado masivo en tiempo real.' 
                : 'Protección avanzada desactivada. Vulnerable a ataques de Día Cero.'}
            </p>
          </div>
        </div>

        <button 
          onClick={handleAntiransomwareToggle}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${antiRansomwareStatus ? 'bg-red-500' : 'bg-[var(--border)]'}`}
        >
          <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${antiRansomwareStatus ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3 px-2">
        <Activity size={16} className="text-[var(--text-muted)]" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Registro de Eventos</h3>
      </div>

      {/* Log Viewer */}
      <div className="flex-1 min-h-[300px]">
        <LogViewer logs={logs} />
      </div>

    </div>
  );
}
