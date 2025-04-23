import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import UIFlowCreation from '../UIFlowCreation'
import axios from 'axios'

// Mock dependencies
jest.mock('axios')
jest.mock('../ScreenEditor', () => ({ screen, onScreenUpdate }) => (
  <div data-testid="screen-editor">
    <button onClick={() => onScreenUpdate({ ...screen, title: 'Updated Title' })}>
      Update Screen
    </button>
  </div>
))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('UIFlowCreation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    axios.post.mockResolvedValue({ data: { id: '123' } })
  })

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <UIFlowCreation />
      </BrowserRouter>
    )
  }

  test('renders UIFlowCreation form', () => {
    renderComponent()
    
    expect(screen.getByText('Back to UI Flows')).toBeInTheDocument()
    expect(screen.getByText('Save UI Flow')).toBeInTheDocument()
    expect(screen.getByLabelText('UI Flow Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByText('Screens')).toBeInTheDocument()
  })

  test('validates required fields on save', async () => {
    renderComponent()
    
    // Try to save without a name
    fireEvent.click(screen.getByText('Save UI Flow'))
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('UI Flow Name'), { target: { value: 'Test UI Flow' } })
    fireEvent.click(screen.getByText('Save UI Flow'))
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/v1/uiflows', expect.any(Object))
      expect(mockNavigate).toHaveBeenCalledWith('/uiflows')
    })
  })

  test('allows adding a new screen', async () => {
    renderComponent()
    
    // Click add screen button
    fireEvent.click(screen.getByText('Add Screen'))
    
    // Fill in screen details
    await waitFor(() => {
      expect(screen.getByText('Add New Screen')).toBeInTheDocument()
    })
    
    fireEvent.change(screen.getByLabelText('Path'), { target: { value: '/details' } })
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Details Page' } })
    fireEvent.click(screen.getByText('Add Screen'))
    
    // Check if new screen is added to the select dropdown
    await waitFor(() => {
      expect(screen.getByText('Details Page (/details)')).toBeInTheDocument()
    })
  })

  test('validates screen fields when adding a new screen', async () => {
    renderComponent()
    
    // Click add screen button
    fireEvent.click(screen.getByText('Add Screen'))
    
    // Try to add without required fields
    await waitFor(() => {
      expect(screen.getByText('Add New Screen')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Add Screen'))
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Path is required')).toBeInTheDocument()
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
  })

  test('navigates back when clicking cancel', () => {
    renderComponent()
    
    fireEvent.click(screen.getByText('Back to UI Flows'))
    
    expect(mockNavigate).toHaveBeenCalledWith('/uiflows')
  })

  test('handles API error on save', async () => {
    const errorMessage = 'Server error'
    axios.post.mockRejectedValueOnce(new Error(errorMessage))
    console.error = jest.fn() // Mock console.error
    
    renderComponent()
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('UI Flow Name'), { target: { value: 'Test UI Flow' } })
    fireEvent.click(screen.getByText('Save UI Flow'))
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/v1/uiflows', expect.any(Object))
      expect(console.error).toHaveBeenCalledWith('Error creating UI flow:', expect.any(Error))
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
}) 