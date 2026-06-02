import React from 'react';
import { Minus, Square, X, Shield } from 'lucide-react';

export default function Titlebar() {
  const handleMinimize = () => {
    if (window.electronAPI) window.electronAPI.minimizeWindow();
  };

  const handleMaximize = () => {
    if (window.electronAPI) window.electronAPI.maximizeWindow();
  };

  const handleClose = () => {
    if (window.electronAPI) window.electronAPI.closeWindow();
  };

  return (
    <div className="h-10 bg-[var(--bg-base)] flex items-center justify-between px-4 drag-region select-none border-b border-[var(--border)] relative z-50">
      <div className="flex items-center gap-2 text-[var(--accent-primary)]">
        <Shield size={16} />
        <span className="font-display text-sm font-bold tracking-widest text-[var(--text-primary)]">RUSTGUARD</span>
      </div>
      
      <div className="flex items-center no-drag-region">
        <button 
          onClick={handleMinimize}
          className="h-10 w-12 flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-panel)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Minus size={16} />
        </button>
        <button 
          onClick={handleMaximize}
          className="h-10 w-12 flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-panel)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Square size={13} />
        </button>
        <button 
          onClick={handleClose}
          className="h-10 w-12 flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--accent-danger)] hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
