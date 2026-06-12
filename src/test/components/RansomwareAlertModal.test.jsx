import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import RansomwareAlertModal from '../../components/RansomwareAlertModal'

describe('RansomwareAlertModal', () => {
  const mockData = {
    filePath: '/home/user/honeypot/decoy.txt',
    time: new Date('2026-01-15T10:30:00').getTime(),
  }

  it('renders nothing when data is null', () => {
    const { container } = render(
      <RansomwareAlertModal data={null} onDismiss={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders modal when data is provided', () => {
    render(<RansomwareAlertModal data={mockData} onDismiss={vi.fn()} />)
    expect(screen.getByText('¡ALERTA CRÍTICA DE RANSOMWARE!')).toBeInTheDocument()
  })

  it('displays the affected file path', () => {
    render(<RansomwareAlertModal data={mockData} onDismiss={vi.fn()} />)
    expect(screen.getByText('/home/user/honeypot/decoy.txt')).toBeInTheDocument()
  })

  it('displays the detection time', () => {
    render(<RansomwareAlertModal data={mockData} onDismiss={vi.fn()} />)
    // The time will be formatted by toLocaleString
    const dateText = new Date(mockData.time).toLocaleString()
    expect(screen.getByText(dateText)).toBeInTheDocument()
  })

  it('shows recommended actions list', () => {
    render(<RansomwareAlertModal data={mockData} onDismiss={vi.fn()} />)
    expect(screen.getByText(/Apague su equipo inmediatamente/)).toBeInTheDocument()
    expect(screen.getByText(/Desconecte el cable de red/)).toBeInTheDocument()
    expect(screen.getByText(/Verifique los procesos activos/)).toBeInTheDocument()
  })

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnDismiss = vi.fn()
    render(<RansomwareAlertModal data={mockData} onDismiss={mockOnDismiss} />)
    await user.click(screen.getByText('Entendido - Proceder con precaución'))
    expect(mockOnDismiss).toHaveBeenCalledOnce()
  })

  it('shows the detection message', () => {
    render(<RansomwareAlertModal data={mockData} onDismiss={vi.fn()} />)
    expect(screen.getByText('Se ha detectado comportamiento de cifrado masivo.')).toBeInTheDocument()
  })

  it('shows the actions header', () => {
    render(<RansomwareAlertModal data={mockData} onDismiss={vi.fn()} />)
    expect(screen.getByText('Acciones Recomendadas Inmediatas:')).toBeInTheDocument()
  })
})
