import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DraggableComponentList from '../DraggableComponentList'

// Mock theme
jest.mock('@mui/material/styles', () => ({
  useTheme: () => ({
    palette: {
      primary: { main: '#1976d2' },
      grey: { 100: '#f5f5f5', 300: '#e0e0e0', 900: '#212121' },
      text: { primary: '#000000', secondary: '#757575' }
    }
  })
}))

describe('DraggableComponentList Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
  })
  
  test('renders component categories', () => {
    render(<DraggableComponentList />)
    
    // Check if all categories are rendered
    expect(screen.getByText('Container')).toBeInTheDocument()
    expect(screen.getByText('Form')).toBeInTheDocument()
    expect(screen.getByText('Display')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })
  
  test('renders component items for each category', () => {
    render(<DraggableComponentList />)
    
    // Check some components from each category
    expect(screen.getByText('Flex Container')).toBeInTheDocument()
    expect(screen.getByText('Grid Container')).toBeInTheDocument()
    expect(screen.getByText('Text Input')).toBeInTheDocument()
    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('Text')).toBeInTheDocument()
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Submit Button')).toBeInTheDocument()
  })
  
  test('filters components based on search term', () => {
    render(<DraggableComponentList />)
    
    // Search for "input"
    fireEvent.change(screen.getByPlaceholderText('Search components...'), {
      target: { value: 'input' }
    })
    
    // Should show Text Input and SelectInput but not Button
    expect(screen.getByText('Text Input')).toBeInTheDocument()
    expect(screen.getByText('Select Input')).toBeInTheDocument()
    expect(screen.queryByText('Button')).not.toBeInTheDocument()
    
    // Clear search
    fireEvent.change(screen.getByPlaceholderText('Search components...'), {
      target: { value: '' }
    })
    
    // All components should be visible again
    expect(screen.getByText('Button')).toBeInTheDocument()
  })
  
  test('shows "No components match" message when search has no results', () => {
    render(<DraggableComponentList />)
    
    // Search for a term that won't match any components
    fireEvent.change(screen.getByPlaceholderText('Search components...'), {
      target: { value: 'nonexistent' }
    })
    
    // Should show no matches message
    expect(screen.getByText('No components match your search.')).toBeInTheDocument()
  })
  
  test('sets drag data when dragging component', () => {
    render(<DraggableComponentList />)
    
    // Find a component item
    const textInput = screen.getByText('Text Input')
    const listItem = textInput.closest('div[role="button"]')
    
    // Mock dataTransfer object
    const dataTransfer = {
      setData: jest.fn(),
      effectAllowed: null
    }
    
    // Trigger dragStart event
    fireEvent.dragStart(listItem, { dataTransfer })
    
    // Check if drag data was set correctly
    expect(dataTransfer.setData).toHaveBeenCalledWith(
      'application/reactflow',
      expect.any(String)
    )
    
    // Parse the data to verify it contains the right component info
    const data = JSON.parse(dataTransfer.setData.mock.calls[0][1])
    expect(data.type).toBe('TextInput')
    expect(data.label).toBe('Text Input')
    expect(data.defaultProps).toBeDefined()
    
    // Check drag effect
    expect(dataTransfer.effectAllowed).toBe('move')
  })
}) 