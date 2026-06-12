import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../App'

// Mock all child components to isolate App logic
vi.mock('../components/Layout', () => ({
  default: ({ children, currentView, setCurrentView }) => (
    <div data-testid="layout" data-view={currentView}>
      <button data-testid="nav-dashboard" onClick={() => setCurrentView('dashboard')}>Dashboard</button>
      <button data-testid="nav-scan" onClick={() => setCurrentView('scan')}>Scan</button>
      <button data-testid="nav-realtime" onClick={() => setCurrentView('realtime')}>RealTime</button>
      <button data-testid="nav-quarantine" onClick={() => setCurrentView('quarantine')}>Quarantine</button>
      <button data-testid="nav-history" onClick={() => setCurrentView('history')}>History</button>
      {children}
    </div>
  ),
}))

vi.mock('../pages/Dashboard', () => ({
  default: ({ setCurrentView }) => <div data-testid="dashboard-page">Dashboard <button onClick={() => setCurrentView('scan')}>Go Scan</button></div>,
}))
vi.mock('../pages/Scan', () => ({
  default: () => <div data-testid="scan-page">Scan Page</div>,
}))
vi.mock('../pages/RealTime', () => ({
  default: () => <div data-testid="realtime-page">RealTime Page</div>,
}))
vi.mock('../pages/Quarantine', () => ({
  default: () => <div data-testid="quarantine-page">Quarantine Page</div>,
}))
vi.mock('../pages/History', () => ({
  default: () => <div data-testid="history-page">History Page</div>,
}))
vi.mock('../components/RansomwareAlertModal', () => ({
  default: ({ data, onDismiss }) =>
    data ? (
      <div data-testid="ransomware-modal">
        <span>{data.filePath}</span>
        <button data-testid="dismiss-ransomware" onClick={onDismiss}>Dismiss</button>
      </div>
    ) : null,
}))

describe('App', () => {
  beforeEach(() => {
    delete window.electronAPI
  })

  it('renders the layout with dashboard by default', () => {
    render(<App />)
    expect(screen.getByTestId('layout')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
  })

  it('navigates to scan page', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('nav-scan'))
    expect(screen.getByTestId('scan-page')).toBeInTheDocument()
  })

  it('navigates to realtime page', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('nav-realtime'))
    expect(screen.getByTestId('realtime-page')).toBeInTheDocument()
  })

  it('navigates to quarantine page', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('nav-quarantine'))
    expect(screen.getByTestId('quarantine-page')).toBeInTheDocument()
  })

  it('navigates to history page', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByTestId('nav-history'))
    expect(screen.getByTestId('history-page')).toBeInTheDocument()
  })

  it('renders default view for unknown route', async () => {
    render(<App />)
    // Default is dashboard
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
  })

  it('does not show ransomware modal when no data', () => {
    render(<App />)
    expect(screen.queryByTestId('ransomware-modal')).not.toBeInTheDocument()
  })

  it('registers ransomware alert listener when electronAPI is available', () => {
    const mockOnRansomwareAlert = vi.fn()
    window.electronAPI = {
      onRansomwareAlert: mockOnRansomwareAlert,
    }
    render(<App />)
    expect(mockOnRansomwareAlert).toHaveBeenCalledOnce()
  })

  it('shows ransomware modal when alert fires and dismisses it', async () => {
    const user = userEvent.setup()
    let alertCallback
    window.electronAPI = {
      onRansomwareAlert: (cb) => { alertCallback = cb },
    }
    render(<App />)
    
    // Simulate ransomware alert
    const { act } = await import('react')
    await act(() => {
      alertCallback({ filePath: '/test/file.txt', time: Date.now() })
    })
    
    expect(screen.getByTestId('ransomware-modal')).toBeInTheDocument()
    expect(screen.getByText('/test/file.txt')).toBeInTheDocument()
    
    // Dismiss
    await user.click(screen.getByTestId('dismiss-ransomware'))
    expect(screen.queryByTestId('ransomware-modal')).not.toBeInTheDocument()
  })

  it('navigates from dashboard to scan via setCurrentView prop', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument()
    await user.click(screen.getByText('Go Scan'))
    expect(screen.getByTestId('scan-page')).toBeInTheDocument()
  })
})
