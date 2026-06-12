import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Dashboard from '../../pages/Dashboard'

describe('Dashboard', () => {
  const mockSetCurrentView = vi.fn()

  beforeEach(() => {
    delete window.electronAPI
    mockSetCurrentView.mockClear()
  })

  it('renders the SISTEMA PROTEGIDO status', () => {
    render(<Dashboard setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('SISTEMA PROTEGIDO')).toBeInTheDocument()
  })

  it('renders stat cards', () => {
    render(<Dashboard setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('Firmas ClamAV')).toBeInTheDocument()
    expect(screen.getByText('Último Escaneo')).toBeInTheDocument()
    expect(screen.getByText('Tiempo Real')).toBeInTheDocument()
  })

  it('renders quick action buttons', () => {
    render(<Dashboard setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('Escaneo Rápido')).toBeInTheDocument()
    expect(screen.getByText('Escaneo Completo')).toBeInTheDocument()
  })

  it('navigates to scan view on quick scan click', async () => {
    const user = userEvent.setup()
    render(<Dashboard setCurrentView={mockSetCurrentView} />)
    await user.click(screen.getByText('Escaneo Rápido'))
    expect(mockSetCurrentView).toHaveBeenCalledWith('scan')
  })

  it('navigates to scan view on full scan click', async () => {
    const user = userEvent.setup()
    render(<Dashboard setCurrentView={mockSetCurrentView} />)
    await user.click(screen.getByText('Escaneo Completo'))
    expect(mockSetCurrentView).toHaveBeenCalledWith('scan')
  })

  it('shows Tiempo Real OFF by default when no electronAPI', () => {
    render(<Dashboard setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('OFF')).toBeInTheDocument()
  })

  it('toggles realtime status when toggle button is clicked (no electronAPI)', async () => {
    const user = userEvent.setup()
    render(<Dashboard setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('OFF')).toBeInTheDocument()
    
    const header = screen.getByText('Tiempo Real')
    const container = header.parentElement.parentElement.parentElement
    const toggleButton = container.querySelector('button')
    await user.click(toggleButton)
    
    expect(await screen.findByText('ON')).toBeInTheDocument()
  })

  it('fetches realtime status from electronAPI on mount', () => {
    const mockGetRealtimeStatus = vi.fn().mockResolvedValue(true)
    const mockOnRealtimeStatusChanged = vi.fn()
    window.electronAPI = {
      getRealtimeStatus: mockGetRealtimeStatus,
      onRealtimeStatusChanged: mockOnRealtimeStatusChanged,
    }
    render(<Dashboard setCurrentView={mockSetCurrentView} />)
    expect(mockGetRealtimeStatus).toHaveBeenCalled()
  })

  it('renders the status message', () => {
    render(<Dashboard setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('Todo funciona correctamente. Tu equipo está a salvo.')).toBeInTheDocument()
  })

  it('shows Actualizado for ClamAV signatures', () => {
    render(<Dashboard setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('Actualizado')).toBeInTheDocument()
  })

  it('shows Rápido for last scan type', () => {
    render(<Dashboard setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('Rápido')).toBeInTheDocument()
  })
})
