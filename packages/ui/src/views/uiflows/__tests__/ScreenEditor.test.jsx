import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ScreenEditor from '../ScreenEditor'

// Mock ReactFlow and related components
jest.mock('reactflow', () => {
  const ReactFlowMock = ({ children, onInit, onDrop, onDragOver, nodes }) => (
    <div data-testid="react-flow-canvas" onDrop={onDrop} onDragOver={onDragOver}>
      {children}
      <div data-testid="node-count">{nodes.length}</div>
      <button onClick={() => onInit({ screenToFlowPosition: () => ({ x: 100, y: 100 }) })}>
        Initialize
      </button>
    </div>
  )
  
  ReactFlowMock.Background = () => <div data-testid="react-flow-background" />
  ReactFlowMock.Controls = () => <div data-testid="react-flow-controls" />
  ReactFlowMock.Panel = ({ children }) => <div data-testid="react-flow-panel">{children}</div>
  
  return {
    __esModule: true,
    default: ReactFlowMock,
    useNodesState: () => [[], jest.fn(), jest.fn()],
    useEdgesState: () => [[], jest.fn(), jest.fn()],
    addEdge: jest.fn(),
    Background: ReactFlowMock.Background,
    Controls: ReactFlowMock.Controls,
    Panel: ReactFlowMock.Panel,
    MarkerType: { Arrow: 'arrow' }
  }
})

// Mock components
jest.mock('../DraggableComponentList', () => () => <div data-testid="draggable-component-list" />)
jest.mock('../ScreenPropertiesPanel', () => ({ screen, onScreenUpdate }) => (
  <div data-testid="screen-properties-panel">
    <button data-testid="update-screen-props" onClick={() => onScreenUpdate({ ...screen, title: 'Updated Title' })}>
      Update Properties
    </button>
  </div>
))
jest.mock('../../canvas/CanvasNode', () => () => <div data-testid="canvas-node" />)

describe('ScreenEditor Component', () => {
  const mockScreen = {
    id: '1',
    path: '/',
    title: 'Home',
    description: 'Home screen',
    queryParameters: {},
    pathParameters: {},
    components: [
      {
        id: 'component-1',
        type: 'TextDisplay',
        position: { x: 100, y: 100 },
        properties: { text: 'Hello World' },
        style: {}
      }
    ]
  }
  
  const mockOnScreenUpdate = jest.fn()
  
  const renderComponent = (props = {}) => {
    return render(
      <ScreenEditor 
        screen={mockScreen} 
        onScreenUpdate={mockOnScreenUpdate} 
        {...props} 
      />
    )
  }
  
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  test('renders the ScreenEditor with tabs', () => {
    renderComponent()
    
    expect(screen.getByText('Canvas')).toBeInTheDocument()
    expect(screen.getByText('Properties')).toBeInTheDocument()
  })
  
  test('switches between Canvas and Properties tabs', () => {
    renderComponent()
    
    // Default is Canvas tab
    expect(screen.getByTestId('draggable-component-list')).toBeInTheDocument()
    expect(screen.getByTestId('react-flow-canvas')).toBeInTheDocument()
    
    // Click Properties tab
    fireEvent.click(screen.getByText('Properties'))
    
    // Should show properties panel
    expect(screen.getByTestId('screen-properties-panel')).toBeInTheDocument()
    expect(screen.queryByTestId('draggable-component-list')).not.toBeInTheDocument()
  })
  
  test('changes view mode', () => {
    renderComponent()
    
    // Test changing to tablet view
    fireEvent.click(screen.getAllByRole('button')[1]) // Tablet button
    
    // Now change to mobile view
    fireEvent.click(screen.getAllByRole('button')[2]) // Mobile button
    
    // And back to desktop
    fireEvent.click(screen.getAllByRole('button')[0]) // Desktop button
  })
  
  test('updates screen when properties are changed', async () => {
    renderComponent()
    
    // Switch to properties tab
    fireEvent.click(screen.getByText('Properties'))
    
    // Update screen properties
    fireEvent.click(screen.getByTestId('update-screen-props'))
    
    // Check if onScreenUpdate was called with updated title
    await waitFor(() => {
      expect(mockOnScreenUpdate).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Updated Title'
      }))
    })
  })
  
  test('handles component drop', async () => {
    renderComponent()
    
    // Initialize ReactFlow
    fireEvent.click(screen.getByText('Initialize'))
    
    // Mock component drop
    const componentData = {
      type: 'TextDisplay',
      defaultProps: { text: 'Dropped text' }
    }
    
    // Create mock drop event
    const dropEvent = {
      preventDefault: jest.fn(),
      dataTransfer: {
        getData: jest.fn().mockReturnValue(JSON.stringify(componentData)),
        dropEffect: 'none'
      },
      clientX: 200,
      clientY: 200
    }
    
    // Trigger drop
    fireEvent.drop(screen.getByTestId('react-flow-canvas'), dropEvent)
    
    // Check if drop was handled
    expect(dropEvent.preventDefault).toHaveBeenCalled()
  })
  
  test('handles drag over event', () => {
    renderComponent()
    
    // Create mock dragover event
    const dragOverEvent = {
      preventDefault: jest.fn(),
      dataTransfer: { dropEffect: 'none' }
    }
    
    // Trigger drag over
    fireEvent.dragOver(screen.getByTestId('react-flow-canvas'), dragOverEvent)
    
    // Check if drag over was handled
    expect(dragOverEvent.preventDefault).toHaveBeenCalled()
    expect(dragOverEvent.dataTransfer.dropEffect).toBe('move')
  })
}) 