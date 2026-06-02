import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

export default function Quarantine() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    if (window.electronAPI) {
      setLoading(true);
      try {
        const data = await window.electronAPI.getQuarantineRecords();
        // Filtrar los que no están restaurados/eliminados
        setRecords(data.filter(r => r.restored === 0));
      } catch (err) {
        console.error("Error cargando cuarentena:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleRestore = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas restaurar este archivo infectado? El sistema volverá a ser vulnerable.')) return;
    
    if (window.electronAPI) {
      const res = await window.electronAPI.restoreFile(id);
      if (res.success) {
        fetchRecords();
      } else {
        alert('Error al restaurar: ' + res.error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar permanentemente este archivo? Esta acción no se puede deshacer.')) return;
    
    if (window.electronAPI) {
      const res = await window.electronAPI.deleteQuarantineFile(id);
      if (res.success) {
        fetchRecords();
      } else {
        alert('Error al eliminar: ' + res.error);
      }
    }
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-5xl mx-auto animate-in fade-in duration-300">
      
      <div className="mb-6 flex items-start gap-4">
        <div className="p-3 bg-[var(--accent-warning)]/20 text-[var(--accent-warning)] rounded-xl">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Bóveda de Cuarentena</h1>
          <p className="text-[var(--text-muted)] mt-1">
            Los archivos aquí han sido aislados y encriptados para evitar que dañen tu sistema.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-[var(--bg-panel)] rounded-xl border border-[var(--border)] overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center text-[var(--text-muted)]">
            Cargando registros...
          </div>
        ) : records.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center text-[var(--text-muted)] p-8 text-center">
            <AlertTriangle size={48} className="mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">La cuarentena está vacía</h3>
            <p className="mt-2 text-sm">No hay amenazas aisladas actualmente en tu sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-base)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Amenaza</th>
                  <th className="px-6 py-4 font-semibold">Ruta Original</th>
                  <th className="px-6 py-4 font-semibold">Fecha Aislamiento</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--bg-card)] transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-red-500/10 text-[var(--accent-danger)] border border-red-500/20">
                        {record.threat_name || 'Desconocido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[var(--text-primary)] truncate max-w-[200px]" title={record.original_path}>
                      {record.original_path}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(record.quarantined_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleRestore(record.id)}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-warning)] hover:bg-[var(--accent-warning)]/10 rounded transition-colors"
                        title="Restaurar al sistema"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(record.id)}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-danger)] hover:bg-[var(--accent-danger)]/10 rounded transition-colors"
                        title="Eliminar permanentemente"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
