import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RealTime from '../../pages/RealTime'

// Mock child components
vi.mock('../../components/LogViewer', () => ({
  default: ({ logs }) => <div data-testid="log-viewer">{logs.length} logs</div>,
}))

describe('RealTime', () => {
  beforeEach(() => {
    delete window.electronAPI
  })

  it('renders the heading', () => {
    render(<RealTime />)
    expect(screen.getByText('Protección en Tiempo Real')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<RealTime />)
    expect(screen.getByText(/Vigila y escanea automáticamente/)).toBeInTheDocument()
  })

  it('shows INACTIVO status by default', () => {
    render(<RealTime />)
    const inactivoElements = screen.getAllByText('INACTIVO')
    expect(inactivoElements.length).toBeGreaterThanOrEqual(1)
  })

  it('shows Anti-Ransomware section', () => {
    render(<RealTime />)
    expect(screen.getByText(/Anti-Ransomware/)).toBeInTheDocument()
  })

  it('renders the log viewer', () => {
    render(<RealTime />)
    expect(screen.getByTestId('log-viewer')).toBeInTheDocument()
  })

  it('renders the event log section header', () => {
    render(<RealTime />)
    expect(screen.getByText('Registro de Eventos')).toBeInTheDocument()
  })

  it('toggles realtime status without electronAPI (fallback)', async () => {
    const user = userEvent.setup()
    render(<RealTime />)
    
    // Find the first toggle button
    const toggleButtons = screen.getAllByRole('button')
    // The toggle buttons are the ones with rounded-full class
    const realtimeToggle = toggleButtons[0]
    
    await user.click(realtimeToggle)
    expect(screen.getByText('ACTIVO')).toBeInTheDocument()
  })

  it('fetches statuses from electronAPI on mount', () => {
    const mockGetRealtimeStatus = vi.fn().mockResolvedValue(false)
    const mockGetAntiransomwareStatus = vi.fn().mockResolvedValue(false)
    window.electronAPI = {
      getRealtimeStatus: mockGetRealtimeStatus,
      getAntiransomwareStatus: mockGetAntiransomwareStatus,
      onRealtimeStatusChanged: vi.fn(),
      onAntiransomwareStatusChanged: vi.fn(),
      onLogMessage: vi.fn(),
    }
    render(<RealTime />)
    expect(mockGetRealtimeStatus).toHaveBeenCalled()
    expect(mockGetAntiransomwareStatus).toHaveBeenCalled()
  })

  it('shows vulnerability message when inactive', () => {
    render(<RealTime />)
    expect(screen.getByText(/El sistema es vulnerable/)).toBeInTheDocument()
  })

  it('shows Zero Day vulnerability message when anti-ransomware is inactive', () => {
    render(<RealTime />)
    expect(screen.getByText(/Vulnerable a ataques de Día Cero/)).toBeInTheDocument()
  })
})
