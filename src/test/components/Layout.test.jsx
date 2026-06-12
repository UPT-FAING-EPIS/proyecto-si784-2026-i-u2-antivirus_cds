import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Layout from '../../components/Layout'

// Mock child components
vi.mock('../../components/Titlebar', () => ({
  default: () => <div data-testid="titlebar">Titlebar</div>,
}))
vi.mock('../../components/Sidebar', () => ({
  default: ({ currentView, setCurrentView }) => (
    <div data-testid="sidebar" data-view={currentView}>
      <button onClick={() => setCurrentView('scan')}>Nav</button>
    </div>
  ),
}))

describe('Layout', () => {
  it('renders titlebar, sidebar and children', () => {
    render(
      <Layout currentView="dashboard" setCurrentView={vi.fn()}>
        <div data-testid="child-content">Hello</div>
      </Layout>
    )
    expect(screen.getByTestId('titlebar')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('passes currentView to sidebar', () => {
    render(
      <Layout currentView="history" setCurrentView={vi.fn()}>
        <div>Content</div>
      </Layout>
    )
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-view', 'history')
  })

  it('renders correct structural layout classes', () => {
    const { container } = render(
      <Layout currentView="dashboard" setCurrentView={vi.fn()}>
        <div>Content</div>
      </Layout>
    )
    const root = container.firstChild
    expect(root).toHaveClass('flex', 'flex-col', 'h-screen')
  })

  it('renders main content area', () => {
    render(
      <Layout currentView="dashboard" setCurrentView={vi.fn()}>
        <p>Test content here</p>
      </Layout>
    )
    expect(screen.getByText('Test content here')).toBeInTheDocument()
  })
})
