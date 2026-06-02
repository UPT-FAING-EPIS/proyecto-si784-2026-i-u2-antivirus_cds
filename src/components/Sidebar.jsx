import React from 'react';
import { LayoutDashboard, ScanSearch, Activity, ShieldAlert, History } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scan', label: 'Escaneo', icon: ScanSearch },
    { id: 'realtime', label: 'Tiempo Real', icon: Activity },
    { id: 'quarantine', label: 'Cuarentena', icon: ShieldAlert },
    { id: 'history', label: 'Historial', icon: History },
  ];

  return (
    <div className="w-[200px] bg-[var(--bg-panel)] h-full flex flex-col border-r border-[var(--border)]">
      <div className="flex-1 py-6 px-3 flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all text-sm font-medium
                ${isActive 
                  ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-[var(--accent-primary)]' : ''} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)] text-center">
        RustGuard v1.0.0
      </div>
    </div>
  );
}
