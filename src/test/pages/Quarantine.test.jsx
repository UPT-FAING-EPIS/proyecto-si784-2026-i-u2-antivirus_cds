import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Quarantine from '../../pages/Quarantine'

describe('Quarantine', () => {
  beforeEach(() => {
    delete window.electronAPI
  })

  it('renders the heading', () => {
    render(<Quarantine />)
    expect(screen.getByText('Bóveda de Cuarentena')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<Quarantine />)
    expect(screen.getByText(/Los archivos aquí han sido aislados/)).toBeInTheDocument()
  })

  it('shows empty state when no electronAPI', () => {
    render(<Quarantine />)
    // Without electronAPI, loading stays true but the component should render
    expect(screen.getByText('Bóveda de Cuarentena')).toBeInTheDocument()
  })

  it('shows loading state initially with electronAPI', () => {
    window.electronAPI = {
      getQuarantineRecords: vi.fn().mockResolvedValue([]),
    }
    render(<Quarantine />)
    expect(screen.getByText('Cargando registros...')).toBeInTheDocument()
  })

  it('shows empty quarantine message after loading', async () => {
    window.electronAPI = {
      getQuarantineRecords: vi.fn().mockResolvedValue([]),
    }
    render(<Quarantine />)
    expect(await screen.findByText('La cuarentena está vacía')).toBeInTheDocument()
  })

  it('shows quarantine records in table', async () => {
    window.electronAPI = {
      getQuarantineRecords: vi.fn().mockResolvedValue([
        {
          id: 1,
          threat_name: 'Eicar-Test',
          original_path: 'C:\\test\\malware.exe',
          quarantined_at: new Date().toISOString(),
          restored: 0,
        },
      ]),
    }
    render(<Quarantine />)
    expect(await screen.findByText('Eicar-Test')).toBeInTheDocument()
  })

  it('shows table headers when records exist', async () => {
    window.electronAPI = {
      getQuarantineRecords: vi.fn().mockResolvedValue([
        {
          id: 1,
          threat_name: 'TestVirus',
          original_path: 'C:\\test\\virus.exe',
          quarantined_at: new Date().toISOString(),
          restored: 0,
        },
      ]),
    }
    render(<Quarantine />)
    expect(await screen.findByText('Amenaza')).toBeInTheDocument()
    expect(screen.getByText('Ruta Original')).toBeInTheDocument()
    expect(screen.getByText('Fecha Aislamiento')).toBeInTheDocument()
    expect(screen.getByText('Acciones')).toBeInTheDocument()
  })

  it('filters out restored records', async () => {
    window.electronAPI = {
      getQuarantineRecords: vi.fn().mockResolvedValue([
        {
          id: 1,
          threat_name: 'ActiveThreat',
          original_path: 'C:\\test\\active.exe',
          quarantined_at: new Date().toISOString(),
          restored: 0,
        },
        {
          id: 2,
          threat_name: 'RestoredThreat',
          original_path: 'C:\\test\\restored.exe',
          quarantined_at: new Date().toISOString(),
          restored: 1,
        },
      ]),
    }
    render(<Quarantine />)
    expect(await screen.findByText('ActiveThreat')).toBeInTheDocument()
    expect(screen.queryByText('RestoredThreat')).not.toBeInTheDocument()
  })

  it('shows Desconocido for records without threat name', async () => {
    window.electronAPI = {
      getQuarantineRecords: vi.fn().mockResolvedValue([
        {
          id: 1,
          threat_name: null,
          original_path: 'C:\\test\\unknown.exe',
          quarantined_at: new Date().toISOString(),
          restored: 0,
        },
      ]),
    }
    render(<Quarantine />)
    expect(await screen.findByText('Desconocido')).toBeInTheDocument()
  })
})
