import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ThreatModal from '../../components/ThreatModal'

describe('ThreatModal', () => {
  const mockThreat = {
    threatName: 'Eicar-Test-Signature',
    file: 'C:\\Users\\test\\Downloads\\eicar.com',
  }

  it('renders nothing when threat is null', () => {
    const { container } = render(
      <ThreatModal threat={null} onQuarantine={vi.fn()} onIgnore={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders modal when threat is provided', () => {
    render(
      <ThreatModal threat={mockThreat} onQuarantine={vi.fn()} onIgnore={vi.fn()} />
    )
    expect(screen.getByText('Amenaza Detectada')).toBeInTheDocument()
  })

  it('displays threat name', () => {
    render(
      <ThreatModal threat={mockThreat} onQuarantine={vi.fn()} onIgnore={vi.fn()} />
    )
    expect(screen.getByText('Eicar-Test-Signature')).toBeInTheDocument()
  })

  it('displays affected file path', () => {
    render(
      <ThreatModal threat={mockThreat} onQuarantine={vi.fn()} onIgnore={vi.fn()} />
    )
    expect(screen.getByText('C:\\Users\\test\\Downloads\\eicar.com')).toBeInTheDocument()
  })

  it('calls onIgnore when Ignorar button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnIgnore = vi.fn()
    render(
      <ThreatModal threat={mockThreat} onQuarantine={vi.fn()} onIgnore={mockOnIgnore} />
    )
    await user.click(screen.getByText('Ignorar'))
    expect(mockOnIgnore).toHaveBeenCalledOnce()
  })

  it('calls onQuarantine with threat data when quarantine button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnQuarantine = vi.fn()
    render(
      <ThreatModal threat={mockThreat} onQuarantine={mockOnQuarantine} onIgnore={vi.fn()} />
    )
    await user.click(screen.getByText('Mover a Cuarentena'))
    expect(mockOnQuarantine).toHaveBeenCalledWith(mockThreat)
  })

  it('shows recommendation text', () => {
    render(
      <ThreatModal threat={mockThreat} onQuarantine={vi.fn()} onIgnore={vi.fn()} />
    )
    expect(screen.getByText(/Se recomienda mover este archivo/)).toBeInTheDocument()
  })

  it('renders the subtitle text', () => {
    render(
      <ThreatModal threat={mockThreat} onQuarantine={vi.fn()} onIgnore={vi.fn()} />
    )
    expect(screen.getByText('El sistema requiere tu atención inmediata')).toBeInTheDocument()
  })
})
