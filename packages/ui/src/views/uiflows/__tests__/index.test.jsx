import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import UIFlows from '../index'
import axios from 'axios'

// Mock dependencies
jest.mock('axios')
jest.mock('@/ui-component/cards/ItemCard', () => ({ title, description, actions, variant = 'card' }) => (
  <div data-testid={`item-card-${variant}`}>
    <div>{title}</div>
    <div>{description}</div>
    <div data-testid="actions">
      {actions.map((action, index) => (
        <button key={index} onClick={action.onClick}>
          {action.name}
        </button>
      ))}
    </div>
  </div>
))

// Mock theme
jest.mock('@mui/material/styles', () => ({
  useTheme: () => ({
    palette: {
      grey: { 900: '#212121' },
      customization: { isDarkMode: false }
    }
  })
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('UIFlows Component', () => {
  const mockUIFlows = [
    {
      id: '1',
      name: 'Dashboard UI',
      description: 'Main dashboard interface'
    },
    {
      id: '2',
      name: 'Settings UI',
      description: 'User settings panel'
    }
  ]
  
  beforeEach(() => {
    jest.clearAllMocks()
    axios.get.mockResolvedValue({ data: mockUIFlows })
    localStorage.setItem('uiDisplayStyle', 'card')
  })
  
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <UIFlows />
      </BrowserRouter>
    )
  }
  
  test('renders loading state initially', async () => {
    renderComponent()
    
    // Should show skeletons while loading
    expect(screen.getAllByRole('img', { hidden: true }).length).toBeGreaterThan(0)
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/v1/uiflows')
    })
  })
  
  test('renders UI flows in card view', async () => {
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard UI')).toBeInTheDocument()
      expect(screen.getByText('Settings UI')).toBeInTheDocument()
    })
    
    expect(screen.getAllByTestId('item-card-card').length).toBe(2)
  })
  
  test('renders UI flows in list view', async () => {
    localStorage.setItem('uiDisplayStyle', 'list')
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard UI')).toBeInTheDocument()
    })
    
    expect(screen.getAllByTestId('item-card-list').length).toBe(2)
  })
  
  test('filters UI flows based on search', async () => {
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getAllByTestId('item-card-card').length).toBe(2)
    })
    
    // Search for "dashboard"
    fireEvent.change(screen.getByPlaceholderText('Search Name or Category'), {
      target: { value: 'dashboard' }
    })
    
    // Should only show the Dashboard UI
    expect(screen.getByText('Dashboard UI')).toBeInTheDocument()
    expect(screen.queryByText('Settings UI')).not.toBeInTheDocument()
    
    // Clear search
    fireEvent.change(screen.getByPlaceholderText('Search Name or Category'), {
      target: { value: '' }
    })
    
    // Should show all UIs again
    expect(screen.getByText('Settings UI')).toBeInTheDocument()
  })
  
  test('navigates to create page when clicking Add New', async () => {
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByText('Add New')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Add New'))
    
    expect(mockNavigate).toHaveBeenCalledWith('/uiflows/create')
  })
  
  test('navigates to preview page when clicking Preview', async () => {
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getAllByText('Preview').length).toBe(2)
    })
    
    // Click Preview on the first UI flow
    fireEvent.click(screen.getAllByText('Preview')[0])
    
    expect(mockNavigate).toHaveBeenCalledWith('/uiflows/preview/1')
  })
  
  test('toggles between card and list view', async () => {
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard UI')).toBeInTheDocument()
    })
    
    // Toggle to list view
    const toggleButtons = screen.getAllByRole('button', { hidden: true })
    fireEvent.click(toggleButtons.find(button => button.title === 'List View'))
    
    expect(localStorage.getItem('uiDisplayStyle')).toBe('list')
    
    // Toggle back to card view
    fireEvent.click(toggleButtons.find(button => button.title === 'Card View'))
    
    expect(localStorage.getItem('uiDisplayStyle')).toBe('card')
  })
  
  test('shows empty state when no UI flows exist', async () => {
    axios.get.mockResolvedValueOnce({ data: [] })
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByText('No UIs Yet')).toBeInTheDocument()
    })
  })
  
  test('shows filtered empty state when search has no results', async () => {
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByText('Dashboard UI')).toBeInTheDocument()
    })
    
    // Search for something that won't match
    fireEvent.change(screen.getByPlaceholderText('Search Name or Category'), {
      target: { value: 'nonexistent' }
    })
    
    expect(screen.getByText('No matching UI flows found')).toBeInTheDocument()
  })
  
  test('handles API error', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch'))
    console.error = jest.fn() // Mock console.error
    
    renderComponent()
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled()
    })
  })
}) 