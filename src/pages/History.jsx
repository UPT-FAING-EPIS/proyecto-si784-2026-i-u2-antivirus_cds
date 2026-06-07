import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Search, AlertCircle, FileText, Download, X } from 'lucide-react';
import LogViewer from '../components/LogViewer';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLog, setActiveLog] = useState(null);
  const [activeRecord, setActiveRecord] = useState(null);

  const fetchHistory = async () => {
    if (window.electronAPI) {
      setLoading(true);
      try {
        const data = await window.electronAPI.getScanHistory();
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleExport = async () => {
    if (window.electronAPI) {
      const res = await window.electronAPI.exportHistory();
      if (res.success) {
        alert('Historial exportado con éxito en: ' + res.path);
      }
    }
  };

  const handleOpenLog = async (record) => {
    if (window.electronAPI && record.log_file) {
      const content = await window.electronAPI.readLog(record.log_file);
      const parsedLogs = content.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => {
          const match = line.match(/^\[.*?\]\s+\[(.*?)\]/);
          const level = match ? match[1] : 'INFO';
          return { level, rawLine: line };
        });
      setActiveLog(parsedLogs);
      setActiveRecord(record);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">Completado</span>;
      case 'running':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-[var(--accent-info)]/10 text-[var(--accent-info)] border border-[var(--accent-info)]/20">En curso</span>;
      case 'error':
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-[var(--accent-danger)]/10 text-[var(--accent-danger)] border border-[var(--accent-danger)]/20">Error</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)]">{status}</span>;
    }
  };

  const getScanTypeLabel = (type) => {
    const labels = { 'quick': 'Rápido', 'full': 'Completo', 'file': 'Carpeta/Archivo' };
    return labels[type] || type;
  };

  return (
    <div className="p-8 h-full flex flex-col max-w-5xl mx-auto animate-in fade-in duration-300">
      
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--accent-info)] rounded-xl">
            <HistoryIcon size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Historial de Escaneos</h1>
            <p className="text-[var(--text-muted)] mt-1">
              Registro completo de todos los análisis realizados en el sistema.
            </p>
          </div>
        </div>

        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] hover:text-[var(--accent-primary)] border border-[var(--border)] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          title="Exportar como texto"
        >
          <Download size={16} /> Exportar Historial
        </button>
      </div>

      <div className="flex-1 bg-[var(--bg-panel)] rounded-xl border border-[var(--border)] overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center text-[var(--text-muted)]">
            Cargando historial...
          </div>
        ) : history.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center text-[var(--text-muted)] p-8 text-center">
            <Search size={48} className="mb-4 opacity-20" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">No hay escaneos</h3>
            <p className="mt-2 text-sm">Aún no se ha realizado ningún análisis en el sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--bg-base)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold">Inicio</th>
                  <th className="px-6 py-4 font-semibold">Fin</th>
                  <th className="px-6 py-4 font-semibold text-center">Archivos</th>
                  <th className="px-6 py-4 font-semibold text-center">Amenazas</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right">Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--bg-card)] transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                      {getScanTypeLabel(record.scan_type)}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(record.started_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-[var(--text-muted)] whitespace-nowrap">
                      {record.finished_at ? new Date(record.finished_at).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-[var(--text-primary)] font-mono">
                      {record.files_scanned.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-mono font-bold ${record.threats_found > 0 ? 'text-[var(--accent-danger)]' : 'text-[var(--accent-primary)]'}`}>
                        {record.threats_found}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 flex justify-end">
                      {record.log_file && (
                        <button 
                          onClick={() => handleOpenLog(record)}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-info)] transition-colors rounded hover:bg-[var(--accent-info)]/10"
                          title="Abrir archivo de log"
                        >
                          <FileText size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-8 animate-in fade-in">
          <div className="bg-[var(--bg-panel)] w-full max-w-4xl h-[80vh] rounded-xl border border-[var(--border)] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-[var(--border)] bg-[var(--bg-card)]">
              <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FileText size={18} className="text-[var(--accent-info)]" />
                Registro del Escaneo
              </h2>
              <button onClick={() => { setActiveLog(null); setActiveRecord(null); }} className="text-[var(--text-muted)] hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {activeRecord && (
              <div className="p-4 bg-[var(--bg-base)] border-b border-[var(--border)] grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase font-semibold tracking-wider">Tipo de Escaneo</p>
                  <p className="font-medium text-[var(--text-primary)] mt-1">{getScanTypeLabel(activeRecord.scan_type)}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase font-semibold tracking-wider">Fecha y Hora</p>
                  <p className="font-medium text-[var(--text-primary)] mt-1">{new Date(activeRecord.started_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase font-semibold tracking-wider">Archivos Analizados</p>
                  <p className="font-medium text-[var(--text-primary)] mt-1">{activeRecord.files_scanned.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] text-xs uppercase font-semibold tracking-wider">Amenazas</p>
                  <p className={`font-bold mt-1 ${activeRecord.threats_found > 0 ? 'text-[var(--accent-danger)]' : 'text-[var(--accent-primary)]'}`}>
                    {activeRecord.threats_found}
                  </p>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden p-4">
              <LogViewer logs={activeLog} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
