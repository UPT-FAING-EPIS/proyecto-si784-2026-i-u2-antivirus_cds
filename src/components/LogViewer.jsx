import React, { useEffect, useRef, useState } from 'react';
import { Copy } from 'lucide-react';

export default function LogViewer({ logs }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const copyLogs = () => {
    const text = logs.map(l => l.rawLine).join('\n');
    navigator.clipboard.writeText(text);
  };

  const getLineColor = (level) => {
    switch (level) {
      case 'CLEAN':
      case 'SUCCESS':
        return 'text-[var(--accent-primary)]'; // --accent-primary
      case 'THREAT':
      case 'DANGER':
        return 'text-[var(--accent-danger)]'; // --accent-danger
      case 'WARNING':
        return 'text-[var(--accent-warning)]'; // --accent-warning
      case 'INFO':
      default:
        return 'text-[var(--accent-info)]'; // --accent-info
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-[var(--bg-base)] border border-[var(--border)] rounded-md overflow-hidden">
      {/* Header / Actions */}
      <div className="flex justify-between items-center px-4 py-2 bg-[var(--bg-panel)] border-b border-[var(--border)]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Registro en vivo</span>
        <button 
          onClick={copyLogs}
          className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded hover:bg-[var(--bg-card)]"
          title="Copiar log"
        >
          <Copy size={14} /> Copiar
        </button>
      </div>

      {/* Log Output */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-[var(--text-muted)] italic">Esperando eventos...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={`break-words ${getLineColor(log.level)}`}>
              {log.rawLine}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
