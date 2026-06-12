import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Scan from '../../pages/Scan'

// Mock child components
vi.mock('../../components/LogViewer', () => ({
  default: ({ logs }) => (
    <div data-testid="log-viewer">
      {logs.map((l, i) => <div key={i}>{l.rawLine}</div>)}
    </div>
  ),
}))
vi.mock('../../components/ThreatModal', () => ({
  default: ({ threat, onQuarantine, onIgnore }) =>
    threat ? (
      <div data-testid="threat-modal">
        <span>{threat.threatName}</span>
        <button data-testid="quarantine-btn" onClick={() => onQuarantine(threat)}>Quarantine</button>
        <button data-testid="ignore-btn" onClick={onIgnore}>Ignore</button>
      </div>
    ) : null,
}))

describe('Scan', () => {
  beforeEach(() => {
    delete window.electronAPI
  })

  it('renders the scan center heading', () => {
    render(<Scan />)
    expect(screen.getByText('Centro de Escaneo')).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<Scan />)
    expect(screen.getByText('Analiza tu sistema en busca de malware y amenazas ocultas.')).toBeInTheDocument()
  })

  it('renders three scan buttons', () => {
    render(<Scan />)
    expect(screen.getByText('Escaneo Rápido')).toBeInTheDocument()
    expect(screen.getByText('Escaneo Completo')).toBeInTheDocument()
    expect(screen.getByText('Escanear Carpeta')).toBeInTheDocument()
  })

  it('renders scan button descriptions', () => {
    render(<Scan />)
    expect(screen.getByText('Áreas críticas')).toBeInTheDocument()
    expect(screen.getByText('Todo el sistema')).toBeInTheDocument()
    expect(screen.getByText('Seleccionar destino')).toBeInTheDocument()
  })

  it('renders the log viewer', () => {
    render(<Scan />)
    expect(screen.getByTestId('log-viewer')).toBeInTheDocument()
  })

  it('does not show cancel button when no scan is running', () => {
    render(<Scan />)
    expect(screen.queryByText('Detener Escaneo')).not.toBeInTheDocument()
  })

  it('does not show threat modal by default', () => {
    render(<Scan />)
    expect(screen.queryByTestId('threat-modal')).not.toBeInTheDocument()
  })

  it('registers log and threat listeners when electronAPI is available', () => {
    const mockOnLogMessage = vi.fn()
    const mockOnThreatDetected = vi.fn()
    window.electronAPI = {
      onLogMessage: mockOnLogMessage,
      onThreatDetected: mockOnThreatDetected,
    }
    render(<Scan />)
    expect(mockOnLogMessage).toHaveBeenCalledOnce()
    expect(mockOnThreatDetected).toHaveBeenCalledOnce()
  })

  it('starts quick scan and shows cancel button with electronAPI', async () => {
    const user = userEvent.setup()
    let resolvePromise
    const scanPromise = new Promise(r => { resolvePromise = r })
    window.electronAPI = {
      onLogMessage: vi.fn(),
      onThreatDetected: vi.fn(),
      scanQuick: () => scanPromise,
      cancelScan: vi.fn().mockResolvedValue(true),
    }
    render(<Scan />)
    await user.click(screen.getByText('Escaneo Rápido'))
    expect(screen.getByText('Detener Escaneo')).toBeInTheDocument()
    resolvePromise()
  })
})
