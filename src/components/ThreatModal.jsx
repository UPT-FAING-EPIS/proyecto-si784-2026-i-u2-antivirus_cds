import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ThreatModal({ threat, onQuarantine, onIgnore }) {
  if (!threat) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-panel)] border border-[var(--accent-danger)] rounded-lg shadow-xl shadow-red-900/20 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-red-950/30 px-4 py-3 border-b border-[var(--border)] flex items-center gap-3">
          <div className="bg-[var(--accent-danger)]/20 p-2 rounded-full">
            <AlertTriangle className="text-[var(--accent-danger)]" size={24} />
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] font-semibold">Amenaza Detectada</h3>
            <p className="text-xs text-[var(--text-muted)]">El sistema requiere tu atención inmediata</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <span className="block text-xs font-semibold uppercase text-[var(--text-muted)] mb-1">Nombre de la amenaza:</span>
            <span className="font-mono text-sm text-[var(--accent-danger)] bg-red-950/30 px-2 py-1 rounded inline-block">
              {threat.threatName}
            </span>
          </div>
          
          <div>
            <span className="block text-xs font-semibold uppercase text-[var(--text-muted)] mb-1">Archivo afectado:</span>
            <span className="block font-mono text-xs text-[var(--text-primary)] break-all bg-[var(--bg-base)] p-2 rounded border border-[var(--border)]">
              {threat.file}
            </span>
          </div>

          <p className="text-sm text-[var(--text-primary)] mt-4">
            Se recomienda mover este archivo a la cuarentena para evitar daños en el sistema.
          </p>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 bg-[var(--bg-base)] border-t border-[var(--border)] flex justify-end gap-3">
          <button 
            onClick={onIgnore}
            className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] border border-[var(--border)] rounded transition-colors"
          >
            Ignorar
          </button>
          <button 
            onClick={() => onQuarantine(threat)}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent-danger)] hover:bg-red-600 rounded transition-colors"
          >
            Mover a Cuarentena
          </button>
        </div>

      </div>
    </div>
  );
}
