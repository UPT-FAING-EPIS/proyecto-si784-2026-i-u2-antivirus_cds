import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Sidebar from '../../components/Sidebar'

describe('Sidebar', () => {
  const mockSetCurrentView = vi.fn()

  it('renders all menu items', () => {
    render(<Sidebar currentView="dashboard" setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Escaneo')).toBeInTheDocument()
    expect(screen.getByText('Tiempo Real')).toBeInTheDocument()
    expect(screen.getByText('Cuarentena')).toBeInTheDocument()
    expect(screen.getByText('Historial')).toBeInTheDocument()
  })

  it('renders version text', () => {
    render(<Sidebar currentView="dashboard" setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('RustGuard v1.0.0')).toBeInTheDocument()
  })

  it('highlights the active menu item', () => {
    render(<Sidebar currentView="scan" setCurrentView={mockSetCurrentView} />)
    const scanButton = screen.getByText('Escaneo').closest('button')
    expect(scanButton.className).toContain('text-[var(--accent-primary)]')
  })

  it('calls setCurrentView when clicking a menu item', async () => {
    const user = userEvent.setup()
    render(<Sidebar currentView="dashboard" setCurrentView={mockSetCurrentView} />)
    await user.click(screen.getByText('Escaneo'))
    expect(mockSetCurrentView).toHaveBeenCalledWith('scan')
  })

  it('calls setCurrentView with correct id for each item', async () => {
    const user = userEvent.setup()
    render(<Sidebar currentView="dashboard" setCurrentView={mockSetCurrentView} />)
    
    await user.click(screen.getByText('Tiempo Real'))
    expect(mockSetCurrentView).toHaveBeenCalledWith('realtime')
    
    await user.click(screen.getByText('Cuarentena'))
    expect(mockSetCurrentView).toHaveBeenCalledWith('quarantine')
    
    await user.click(screen.getByText('Historial'))
    expect(mockSetCurrentView).toHaveBeenCalledWith('history')
  })

  it('does not highlight inactive menu items as active', () => {
    render(<Sidebar currentView="dashboard" setCurrentView={mockSetCurrentView} />)
    const scanButton = screen.getByText('Escaneo').closest('button')
    expect(scanButton.className).toContain('text-[var(--text-muted)]')
  })

  it('renders 5 navigation buttons', () => {
    render(<Sidebar currentView="dashboard" setCurrentView={mockSetCurrentView} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)
  })
})
