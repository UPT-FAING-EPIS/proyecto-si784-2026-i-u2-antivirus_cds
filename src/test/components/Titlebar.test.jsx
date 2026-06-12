import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Titlebar from '../../components/Titlebar'

describe('Titlebar', () => {
  beforeEach(() => {
    delete window.electronAPI
  })

  it('renders the brand name RUSTGUARD', () => {
    render(<Titlebar />)
    expect(screen.getByText('RUSTGUARD')).toBeInTheDocument()
  })

  it('renders minimize, maximize and close buttons', () => {
    render(<Titlebar />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })

  it('calls electronAPI.minimizeWindow on minimize click', async () => {
    const user = userEvent.setup()
    const mockMinimize = vi.fn()
    window.electronAPI = {
      minimizeWindow: mockMinimize,
      maximizeWindow: vi.fn(),
      closeWindow: vi.fn(),
    }
    render(<Titlebar />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    expect(mockMinimize).toHaveBeenCalledOnce()
  })

  it('calls electronAPI.maximizeWindow on maximize click', async () => {
    const user = userEvent.setup()
    const mockMaximize = vi.fn()
    window.electronAPI = {
      minimizeWindow: vi.fn(),
      maximizeWindow: mockMaximize,
      closeWindow: vi.fn(),
    }
    render(<Titlebar />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[1])
    expect(mockMaximize).toHaveBeenCalledOnce()
  })

  it('calls electronAPI.closeWindow on close click', async () => {
    const user = userEvent.setup()
    const mockClose = vi.fn()
    window.electronAPI = {
      minimizeWindow: vi.fn(),
      maximizeWindow: vi.fn(),
      closeWindow: mockClose,
    }
    render(<Titlebar />)
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[2])
    expect(mockClose).toHaveBeenCalledOnce()
  })

  it('does not crash when electronAPI is not available', async () => {
    const user = userEvent.setup()
    render(<Titlebar />)
    const buttons = screen.getAllByRole('button')
    // Should not throw
    await user.click(buttons[0])
    await user.click(buttons[1])
    await user.click(buttons[2])
  })

  it('has the correct drag region class', () => {
    const { container } = render(<Titlebar />)
    expect(container.firstChild).toHaveClass('drag-region')
  })
})
