import React, { useState } from 'react';
import { FolderSearch, KeyRound, Package, AlertTriangle, ShieldAlert, Loader2, FileCode2, ChevronDown, ChevronRight, Info } from 'lucide-react';

const SEVERITY_CONFIG = {
  CRITICAL: { color: 'var(--accent-danger)', bg: 'rgba(255,77,79,0.12)', border: 'rgba(255,77,79,0.25)', label: 'CRÍTICO' },
  HIGH: { color: '#FF7A45', bg: 'rgba(255,122,69,0.12)', border: 'rgba(255,122,69,0.25)', label: 'ALTO' },
  MEDIUM: { color: 'var(--accent-warning)', bg: 'rgba(250,173,20,0.12)', border: 'rgba(250,173,20,0.25)', label: 'MEDIO' },
  LOW: { color: 'var(--accent-info)', bg: 'rgba(64,150,255,0.12)', border: 'rgba(64,150,255,0.25)', label: 'BAJO' },
  INFO: { color: 'var(--text-muted)', bg: 'rgba(125,133,144,0.12)', border: 'rgba(125,133,144,0.25)', label: 'INFO' },
};

function SeverityBadge({ severity }) {
  const config = SEVERITY_CONFIG[severity?.toUpperCase()] || SEVERITY_CONFIG.INFO;
  return (
    <span
      style={{ color: config.color, background: config.bg, borderColor: config.border }}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold border"
    >
      {config.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[var(--bg-panel)] p-4 rounded-lg border border-[var(--border)] flex items-center gap-4">
      <div className="p-3 rounded-md" style={{ background: `${color}20`, color }}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs text-[var(--text-muted)] font-semibold uppercase">{label}</p>
        <p className="text-2xl font-display font-bold text-[var(--text-primary)] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function obfuscateSecret(text) {
  if (!text || text.length <= 8) return '••••••••';
  return text.substring(0, 4) + '••••••••' + text.substring(text.length - 4);
}

export default function ProjectAnalysis() {
  const [activeTab, setActiveTab] = useState('secrets');
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const handleSelectProject = async () => {
    if (!window.electronAPI) return;
    const folderPath = await window.electronAPI.selectFolder();
    if (!folderPath) return;

    setSelectedPath(folderPath);
    setLoading(true);
    setResults(null);
    setErrors([]);
    setExpandedRows(new Set());

    try {
      const data = await window.electronAPI.scanProject(folderPath);
      setResults(data);
      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
      }
    } catch (err) {
      setErrors([err.message || 'Error desconocido al analizar el proyecto.']);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (idx) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Compute stats
  const secretsList = results?.secrets?.findings || results?.secrets?.results || [];
  const depsList = results?.dependencies?.vulnerabilities || results?.dependencies?.results || [];

  const secretsCount = secretsList.length;
  const depsCount = depsList.length;
  const criticalCount = depsList.filter(d => d.severity?.toUpperCase() === 'CRITICAL').length;
  const highCount = depsList.filter(d => d.severity?.toUpperCase() === 'HIGH').length;

  // Empty state
  if (!selectedPath && !loading && !results) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center max-w-5xl mx-auto animate-in fade-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="p-6 bg-[var(--accent-info)]/10 rounded-2xl mb-6">
            <FileCode2 size={64} className="text-[var(--accent-info)] opacity-40" />
          </div>
          <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3">Análisis de Proyectos</h2>
          <p className="text-[var(--text-muted)] max-w-md mb-8">
            Selecciona un directorio de proyecto para buscar secretos expuestos y vulnerabilidades en dependencias.
          </p>
          <button
            onClick={handleSelectProject}
            className="flex items-center gap-3 px-6 py-3 bg-[var(--accent-primary)] text-[var(--bg-base)] rounded-lg font-semibold hover:brightness-110 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FolderSearch size={20} />
            Seleccionar Proyecto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col max-w-5xl mx-auto animate-in fade-in duration-300">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[var(--accent-info)]/20 text-[var(--accent-info)] rounded-xl">
            <FileCode2 size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Análisis de Proyecto</h1>
            {selectedPath && (
              <p className="text-[var(--text-muted)] text-sm mt-1 font-mono truncate max-w-lg" title={selectedPath}>
                {selectedPath}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleSelectProject}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-panel)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-card)] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FolderSearch size={16} />
          {loading ? 'Analizando...' : 'Cambiar Proyecto'}
        </button>
      </div>

      {/* Error alerts */}
      {errors.length > 0 && (
        <div className="mb-4 space-y-2">
          {errors.map((err, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-[var(--accent-warning)]/10 border border-[var(--accent-warning)]/30 rounded-lg text-sm">
              <AlertTriangle size={16} className="text-[var(--accent-warning)] mt-0.5 shrink-0" />
              <span className="text-[var(--accent-warning)]">{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-[var(--border)] border-t-[var(--accent-primary)] animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-[var(--text-primary)]">Analizando proyecto...</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Buscando secretos y vulnerabilidades de dependencias</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            <StatCard icon={KeyRound} label="Secretos" value={secretsCount} color="var(--accent-warning)" />
            <StatCard icon={Package} label="Vulnerabilidades" value={depsCount} color="var(--accent-info)" />
            <StatCard icon={ShieldAlert} label="Críticas" value={criticalCount} color="var(--accent-danger)" />
            <StatCard icon={AlertTriangle} label="Altas" value={highCount} color="#FF7A45" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-[var(--bg-panel)] p-1 rounded-lg border border-[var(--border)] w-fit">
            <button
              onClick={() => setActiveTab('secrets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'secrets'
                  ? 'bg-[var(--accent-warning)]/15 text-[var(--accent-warning)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <KeyRound size={15} />
              Secretos Expuestos
              {secretsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-[var(--accent-warning)]/20 text-[var(--accent-warning)]">
                  {secretsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('dependencies')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'dependencies'
                  ? 'bg-[var(--accent-info)]/15 text-[var(--accent-info)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <Package size={15} />
              Dependencias
              {depsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-[var(--accent-info)]/20 text-[var(--accent-info)]">
                  {depsCount}
                </span>
              )}
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 bg-[var(--bg-panel)] rounded-xl border border-[var(--border)] overflow-hidden flex flex-col">
            
            {/* Secrets Tab */}
            {activeTab === 'secrets' && (
              secretsList.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center text-[var(--text-muted)] p-8 text-center">
                  <KeyRound size={48} className="mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Sin secretos expuestos</h3>
                  <p className="mt-2 text-sm">No se encontraron credenciales, tokens o claves API en el proyecto.</p>
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--bg-base)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-xs sticky top-0">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Archivo</th>
                        <th className="px-5 py-3 font-semibold">Línea</th>
                        <th className="px-5 py-3 font-semibold">Tipo</th>
                        <th className="px-5 py-3 font-semibold">Contenido</th>
                        <th className="px-5 py-3 font-semibold">Severidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {secretsList.map((secret, idx) => (
                        <tr key={idx} className="hover:bg-[var(--bg-card)] transition-colors">
                          <td className="px-5 py-3 font-mono text-xs text-[var(--text-primary)] truncate max-w-[180px]" title={secret.file || secret.path}>
                            {secret.file || secret.path || '—'}
                          </td>
                          <td className="px-5 py-3 text-[var(--text-muted)] font-mono text-xs">
                            {secret.line || secret.line_number || '—'}
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)]">
                              {secret.type || secret.rule || 'Desconocido'}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-[var(--text-muted)] truncate max-w-[200px]" title="Contenido ofuscado por seguridad">
                            {obfuscateSecret(secret.match || secret.content || secret.secret)}
                          </td>
                          <td className="px-5 py-3">
                            <SeverityBadge severity={secret.severity || 'HIGH'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Dependencies Tab */}
            {activeTab === 'dependencies' && (
              depsList.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center text-[var(--text-muted)] p-8 text-center">
                  <Package size={48} className="mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Sin vulnerabilidades</h3>
                  <p className="mt-2 text-sm">No se encontraron vulnerabilidades conocidas en las dependencias del proyecto.</p>
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[var(--bg-base)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-xs sticky top-0">
                      <tr>
                        <th className="px-5 py-3 font-semibold w-8"></th>
                        <th className="px-5 py-3 font-semibold">Dependencia</th>
                        <th className="px-5 py-3 font-semibold">Versión</th>
                        <th className="px-5 py-3 font-semibold">CVE</th>
                        <th className="px-5 py-3 font-semibold">Severidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {depsList.map((dep, idx) => (
                        <React.Fragment key={idx}>
                          <tr
                            className="hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
                            onClick={() => toggleRow(idx)}
                          >
                            <td className="px-5 py-3 text-[var(--text-muted)]">
                              {dep.description || dep.chain ? (
                                expandedRows.has(idx) ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                              ) : (
                                <Info size={14} className="opacity-30" />
                              )}
                            </td>
                            <td className="px-5 py-3 font-mono text-xs text-[var(--text-primary)] font-medium">
                              {dep.dependency || dep.name || dep.artifact || '—'}
                            </td>
                            <td className="px-5 py-3 font-mono text-xs text-[var(--text-muted)]">
                              {dep.version || '—'}
                            </td>
                            <td className="px-5 py-3">
                              <span className="font-mono text-xs text-[var(--accent-danger)]">
                                {dep.cve || dep.cve_id || '—'}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <SeverityBadge severity={dep.severity} />
                            </td>
                          </tr>
                          {expandedRows.has(idx) && (dep.description || dep.chain) && (
                            <tr className="bg-[var(--bg-base)]/50">
                              <td colSpan={5} className="px-8 py-3">
                                {dep.description && (
                                  <p className="text-xs text-[var(--text-muted)] mb-2">
                                    <span className="font-semibold text-[var(--text-primary)]">Descripción: </span>
                                    {dep.description}
                                  </p>
                                )}
                                {dep.chain && (
                                  <p className="text-xs font-mono text-[var(--text-muted)]">
                                    <span className="font-semibold text-[var(--text-primary)]">Cadena: </span>
                                    {Array.isArray(dep.chain) ? dep.chain.join(' → ') : dep.chain}
                                  </p>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
