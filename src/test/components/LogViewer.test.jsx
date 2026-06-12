import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LogViewer from '../../components/LogViewer'

describe('LogViewer', () => {
  let mockWriteText

  beforeEach(() => {
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
    
    mockWriteText = vi.fn().mockResolvedValue(undefined)
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true
    })
  })

  it('shows "Esperando eventos..." when logs are empty', () => {
    render(<LogViewer logs={[]} />)
    expect(screen.getByText('Esperando eventos...')).toBeInTheDocument()
  })

  it('renders log entries', () => {
    const logs = [
      { level: 'INFO', rawLine: '[2026-01-15] [INFO] Scan started' },
      { level: 'CLEAN', rawLine: '[2026-01-15] [CLEAN] File is clean' },
    ]
    render(<LogViewer logs={logs} />)
    expect(screen.getByText('[2026-01-15] [INFO] Scan started')).toBeInTheDocument()
    expect(screen.getByText('[2026-01-15] [CLEAN] File is clean')).toBeInTheDocument()
  })

  it('applies correct color class for CLEAN level', () => {
    const logs = [{ level: 'CLEAN', rawLine: 'Clean file' }]
    render(<LogViewer logs={logs} />)
    const logEntry = screen.getByText('Clean file')
    expect(logEntry.className).toContain('text-[var(--accent-primary)]')
  })

  it('applies correct color class for THREAT level', () => {
    const logs = [{ level: 'THREAT', rawLine: 'Threat detected' }]
    render(<LogViewer logs={logs} />)
    const logEntry = screen.getByText('Threat detected')
    expect(logEntry.className).toContain('text-[var(--accent-danger)]')
  })

  it('applies correct color class for WARNING level', () => {
    const logs = [{ level: 'WARNING', rawLine: 'Warning message' }]
    render(<LogViewer logs={logs} />)
    const logEntry = screen.getByText('Warning message')
    expect(logEntry.className).toContain('text-[var(--accent-warning)]')
  })

  it('applies correct color class for INFO level', () => {
    const logs = [{ level: 'INFO', rawLine: 'Info message' }]
    render(<LogViewer logs={logs} />)
    const logEntry = screen.getByText('Info message')
    expect(logEntry.className).toContain('text-[var(--accent-info)]')
  })

  it('applies correct color class for SUCCESS level', () => {
    const logs = [{ level: 'SUCCESS', rawLine: 'Success message' }]
    render(<LogViewer logs={logs} />)
    const logEntry = screen.getByText('Success message')
    expect(logEntry.className).toContain('text-[var(--accent-primary)]')
  })

  it('applies correct color class for DANGER level', () => {
    const logs = [{ level: 'DANGER', rawLine: 'Danger message' }]
    render(<LogViewer logs={logs} />)
    const logEntry = screen.getByText('Danger message')
    expect(logEntry.className).toContain('text-[var(--accent-danger)]')
  })

  it('applies default color class for unknown level', () => {
    const logs = [{ level: 'UNKNOWN', rawLine: 'Unknown message' }]
    render(<LogViewer logs={logs} />)
    const logEntry = screen.getByText('Unknown message')
    expect(logEntry.className).toContain('text-[var(--accent-info)]')
  })



  it('renders the header with "Registro en vivo"', () => {
    render(<LogViewer logs={[]} />)
    expect(screen.getByText('Registro en vivo')).toBeInTheDocument()
  })
})
