import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ScreenPropertiesPanel from '../ScreenPropertiesPanel'

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

describe('ScreenPropertiesPanel Component', () => {
  const mockScreen = {
    id: '1',
    path: '/home',
    title: 'Home Screen',
    description: 'Main home screen',
    queryParameters: {
      filter: {
        description: 'Filter results',
        required: true
      }
    },
    pathParameters: {
      id: {
        description: 'Item ID'
      }
    }
  }
  
  const mockOnScreenUpdate = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  const renderComponent = (props = {}) => {
    return render(
      <ScreenPropertiesPanel
        screen={mockScreen}
        onScreenUpdate={mockOnScreenUpdate}
        {...props}
      />
    )
  }
  
  test('renders screen properties correctly', () => {
    renderComponent()
    
    // Check header and save button
    expect(screen.getByText('Screen Properties')).toBeInTheDocument()
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
    
    // Check form fields have correct values
    expect(screen.getByLabelText('Path')).toHaveValue('/home')
    expect(screen.getByLabelText('Title')).toHaveValue('Home Screen')
    expect(screen.getByLabelText('Description')).toHaveValue('Main home screen')
  })
  
  test('renders existing query parameters', () => {
    renderComponent()
    
    // Check query parameters section
    expect(screen.getByText('Query Parameters')).toBeInTheDocument()
    expect(screen.getByText('filter')).toBeInTheDocument()
    expect(screen.getByText('Filter results')).toBeInTheDocument()
    expect(screen.getByText('Required')).toBeInTheDocument()
  })
  
  test('renders existing path parameters', () => {
    renderComponent()
    
    // Check path parameters section
    expect(screen.getByText('Path Parameters')).toBeInTheDocument()
    expect(screen.getByText('id')).toBeInTheDocument()
    expect(screen.getByText('Item ID')).toBeInTheDocument()
  })
  
  test('updates screen properties when fields change', () => {
    renderComponent()
    
    // Change field values
    fireEvent.change(screen.getByLabelText('Path'), { target: { value: '/dashboard' } })
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Dashboard Screen' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'User dashboard' } })
    
    // Click save button
    fireEvent.click(screen.getByText('Save Changes'))
    
    // Check if onScreenUpdate was called with updated values
    expect(mockOnScreenUpdate).toHaveBeenCalledWith(expect.objectContaining({
      path: '/dashboard',
      title: 'Dashboard Screen',
      description: 'User dashboard'
    }))
  })
  
  test('adds a new query parameter', async () => {
    renderComponent()
    
    // Fill in new query parameter fields
    fireEvent.change(screen.getAllByLabelText('Parameter Name')[0], { target: { value: 'sort' } })
    fireEvent.change(screen.getAllByLabelText('Description')[0], { target: { value: 'Sort order' } })
    
    // Click add button
    fireEvent.click(screen.getAllByText('Add')[0])
    
    // Save changes
    fireEvent.click(screen.getByText('Save Changes'))
    
    // Check if onScreenUpdate was called with new query parameter
    expect(mockOnScreenUpdate).toHaveBeenCalledWith(expect.objectContaining({
      queryParameters: expect.objectContaining({
        filter: expect.any(Object),
        sort: expect.objectContaining({
          description: 'Sort order'
        })
      })
    }))
  })
  
  test('adds a new path parameter', async () => {
    renderComponent()
    
    // Fill in new path parameter fields
    fireEvent.change(screen.getAllByLabelText('Parameter Name')[1], { target: { value: 'category' } })
    fireEvent.change(screen.getAllByLabelText('Description')[1], { target: { value: 'Category ID' } })
    
    // Click add button
    fireEvent.click(screen.getAllByText('Add')[1])
    
    // Save changes
    fireEvent.click(screen.getByText('Save Changes'))
    
    // Check if onScreenUpdate was called with new path parameter
    expect(mockOnScreenUpdate).toHaveBeenCalledWith(expect.objectContaining({
      pathParameters: expect.objectContaining({
        id: expect.any(Object),
        category: expect.objectContaining({
          description: 'Category ID'
        })
      })
    }))
  })
  
  test('removes a query parameter', () => {
    renderComponent()
    
    // Find and click the remove button for the query parameter
    const removeButtons = screen.getAllByRole('button', { name: '' })
    fireEvent.click(removeButtons[0])
    
    // Save changes
    fireEvent.click(screen.getByText('Save Changes'))
    
    // Check if onScreenUpdate was called with updated query parameters
    expect(mockOnScreenUpdate).toHaveBeenCalledWith(expect.objectContaining({
      queryParameters: {}
    }))
  })
  
  test('removes a path parameter', () => {
    renderComponent()
    
    // Find and click the remove button for the path parameter
    const removeButtons = screen.getAllByRole('button', { name: '' })
    const removePathParamButton = removeButtons[1] || removeButtons[0]
    fireEvent.click(removePathParamButton)
    
    // Save changes
    fireEvent.click(screen.getByText('Save Changes'))
    
    // Check if onScreenUpdate was called with updated path parameters
    expect(mockOnScreenUpdate).toHaveBeenCalledWith(expect.objectContaining({
      pathParameters: {}
    }))
  })
  
  test('shows empty state when no parameters are defined', () => {
    renderComponent({
      screen: {
        ...mockScreen,
        queryParameters: {},
        pathParameters: {}
      }
    })
    
    // Check empty state messages
    expect(screen.getByText('No query parameters defined.')).toBeInTheDocument()
    expect(screen.getByText('No path parameters defined.')).toBeInTheDocument()
  })
}) 