import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import History from '../../pages/History'

// Mock child components
vi.mock('../../components/LogViewer', () => ({
  default: ({ logs }) => <div data-testid="log-viewer">{logs.length} logs</div>,
}))

describe('History', () => {
  beforeEach(() => {
    delete window.electronAPI
  })

  it('renders the heading', () => {
    render(<History />)
    expect(screen.getByText('Historial de Escaneos')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<History />)
    expect(screen.getByText(/Registro completo de todos los análisis/)).toBeInTheDocument()
  })

  it('renders export button', () => {
    render(<History />)
    expect(screen.getByText('Exportar Historial')).toBeInTheDocument()
  })

  it('shows loading state initially with electronAPI', () => {
    window.electronAPI = {
      getScanHistory: vi.fn().mockResolvedValue([]),
    }
    render(<History />)
    expect(screen.getByText('Cargando historial...')).toBeInTheDocument()
  })

  it('shows empty state message after loading', async () => {
    window.electronAPI = {
      getScanHistory: vi.fn().mockResolvedValue([]),
    }
    render(<History />)
    expect(await screen.findByText('No hay escaneos')).toBeInTheDocument()
  })

  it('shows empty state subtitle', async () => {
    window.electronAPI = {
      getScanHistory: vi.fn().mockResolvedValue([]),
    }
    render(<History />)
    expect(await screen.findByText('Aún no se ha realizado ningún análisis en el sistema.')).toBeInTheDocument()
  })

  it('renders history records in table', async () => {
    window.electronAPI = {
      getScanHistory: vi.fn().mockResolvedValue([
        {
          id: 1,
          scan_type: 'quick',
          started_at: new Date().toISOString(),
          finished_at: new Date().toISOString(),
          files_scanned: 1234,
          threats_found: 0,
          status: 'completed',
          log_file: null,
        },
      ]),
    }
    render(<History />)
    expect(await screen.findByText('Rápido')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('shows correct status badges', async () => {
    window.electronAPI = {
      getScanHistory: vi.fn().mockResolvedValue([
        {
          id: 1,
          scan_type: 'full',
          started_at: new Date().toISOString(),
          finished_at: new Date().toISOString(),
          files_scanned: 5000,
          threats_found: 2,
          status: 'completed',
          log_file: null,
        },
      ]),
    }
    render(<History />)
    expect(await screen.findByText('Completado')).toBeInTheDocument()
    expect(screen.getByText('Completo')).toBeInTheDocument()
  })

  it('renders table headers when data is present', async () => {
    window.electronAPI = {
      getScanHistory: vi.fn().mockResolvedValue([
        {
          id: 1,
          scan_type: 'quick',
          started_at: new Date().toISOString(),
          finished_at: null,
          files_scanned: 100,
          threats_found: 0,
          status: 'running',
          log_file: null,
        },
      ]),
    }
    render(<History />)
    expect(await screen.findByText('Tipo')).toBeInTheDocument()
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Fin')).toBeInTheDocument()
    expect(screen.getByText('Archivos')).toBeInTheDocument()
    expect(screen.getByText('Amenazas')).toBeInTheDocument()
    expect(screen.getByText('Estado')).toBeInTheDocument()
  })

  it('shows dash for missing finished_at', async () => {
    window.electronAPI = {
      getScanHistory: vi.fn().mockResolvedValue([
        {
          id: 1,
          scan_type: 'quick',
          started_at: new Date().toISOString(),
          finished_at: null,
          files_scanned: 100,
          threats_found: 0,
          status: 'running',
          log_file: null,
        },
      ]),
    }
    render(<History />)
    expect(await screen.findByText('-')).toBeInTheDocument()
  })

  it('renders scan type label for file type', async () => {
    window.electronAPI = {
      getScanHistory: vi.fn().mockResolvedValue([
        {
          id: 1,
          scan_type: 'file',
          started_at: new Date().toISOString(),
          finished_at: new Date().toISOString(),
          files_scanned: 50,
          threats_found: 1,
          status: 'completed',
          log_file: null,
        },
      ]),
    }
    render(<History />)
    expect(await screen.findByText('Carpeta/Archivo')).toBeInTheDocument()
  })
})
