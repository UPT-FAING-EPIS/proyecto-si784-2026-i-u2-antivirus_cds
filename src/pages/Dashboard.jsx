import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Activity, Clock, Zap, Search } from 'lucide-react';

export default function Dashboard({ setCurrentView }) {
  const [realtimeStatus, setRealtimeStatus] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  
  // This would ideally come from the backend, but for the MVP UI we'll use state
  const status = 'PROTECTED'; // PROTECTED, THREAT, SCANNING

  useEffect(() => {
    // Fetch initial status from backend
    if (window.electronAPI) {
      window.electronAPI.getRealtimeStatus().then(setRealtimeStatus);
      
      // Listen for realtime status changes
      window.electronAPI.onRealtimeStatusChanged((status) => {
        setRealtimeStatus(status);
      });
    }
  }, []);

  const toggleRealtime = async () => {
    if (window.electronAPI) {
      const newStatus = await window.electronAPI.toggleRealtime(!realtimeStatus);
      setRealtimeStatus(newStatus);
    } else {
      setRealtimeStatus(!realtimeStatus); // fallback for dev
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Status Card Grande */}
      <div className={`p-8 rounded-xl border flex flex-col items-center justify-center text-center transition-colors duration-500
        ${status === 'PROTECTED' ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30' : ''}
        ${status === 'THREAT' ? 'bg-[var(--accent-danger)]/10 border-[var(--accent-danger)]/30' : ''}
        ${status === 'SCANNING' ? 'bg-[var(--accent-info)]/10 border-[var(--accent-info)]/30' : ''}
      `}>
        <div className={`p-6 rounded-full mb-4 
          ${status === 'PROTECTED' ? 'bg-[var(--accent-primary)]/20 animate-pulse text-[var(--accent-primary)]' : ''}
          ${status === 'THREAT' ? 'bg-[var(--accent-danger)]/20 text-[var(--accent-danger)] animate-bounce' : ''}
          ${status === 'SCANNING' ? 'bg-[var(--accent-info)]/20 text-[var(--accent-info)] animate-spin-slow' : ''}
        `}>
          {status === 'PROTECTED' && <ShieldCheck size={80} />}
          {status === 'THREAT' && <ShieldAlert size={80} />}
          {status === 'SCANNING' && <Shield size={80} />}
        </div>
        
        <h2 className={`text-3xl font-display font-bold tracking-wider mb-2
          ${status === 'PROTECTED' ? 'text-[var(--accent-primary)]' : ''}
          ${status === 'THREAT' ? 'text-[var(--accent-danger)]' : ''}
          ${status === 'SCANNING' ? 'text-[var(--accent-info)]' : ''}
        `}>
          {status === 'PROTECTED' && 'SISTEMA PROTEGIDO'}
          {status === 'THREAT' && 'AMENAZA DETECTADA'}
          {status === 'SCANNING' && 'ESCANEO EN CURSO...'}
        </h2>
        <p className="text-[var(--text-muted)]">Todo funciona correctamente. Tu equipo está a salvo.</p>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        
        {/* Firmas */}
        <div className="bg-[var(--bg-panel)] p-5 rounded-lg border border-[var(--border)] flex items-start gap-4">
          <div className="p-3 bg-[var(--bg-card)] rounded-md text-[var(--accent-info)]">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-sm text-[var(--text-muted)] font-semibold uppercase">Firmas ClamAV</h3>
            <p className="text-lg font-medium text-[var(--text-primary)] mt-1">Actualizado</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">hace 5 min</p>
          </div>
        </div>

        {/* Último Escaneo */}
        <div className="bg-[var(--bg-panel)] p-5 rounded-lg border border-[var(--border)] flex items-start gap-4">
          <div className="p-3 bg-[var(--bg-card)] rounded-md text-[var(--accent-info)]">
            <Search size={24} />
          </div>
          <div>
            <h3 className="text-sm text-[var(--text-muted)] font-semibold uppercase">Último Escaneo</h3>
            <p className="text-lg font-medium text-[var(--text-primary)] mt-1">Rápido</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Hoy, 10:23 AM</p>
          </div>
        </div>

        {/* Tiempo Real Toggle */}
        <div className="bg-[var(--bg-panel)] p-5 rounded-lg border border-[var(--border)] flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-md transition-colors ${realtimeStatus ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'}`}>
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-sm text-[var(--text-muted)] font-semibold uppercase">Tiempo Real</h3>
              <p className={`text-lg font-medium mt-1 ${realtimeStatus ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>
                {realtimeStatus ? 'ON' : 'OFF'}
              </p>
            </div>
          </div>
          <button 
            onClick={toggleRealtime}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors mt-2 ${realtimeStatus ? 'bg-[var(--accent-primary)]' : 'bg-[var(--border)]'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${realtimeStatus ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setCurrentView('scan')}
          className="flex items-center justify-center gap-3 bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-lg transition-colors group"
        >
          <Zap className="text-[var(--accent-primary)] group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-[var(--text-primary)]">Escaneo Rápido</span>
        </button>
        
        <button 
          onClick={() => setCurrentView('scan')}
          className="flex items-center justify-center gap-3 bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-lg transition-colors group"
        >
          <Search className="text-[var(--accent-info)] group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-[var(--text-primary)]">Escaneo Completo</span>
        </button>
      </div>

    </div>
  );
}
