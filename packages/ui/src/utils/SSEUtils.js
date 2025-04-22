/**
 * Server-Sent Events (SSE) utilities
 */

/**
 * Create a new SSE connection with advanced options like reconnection
 * 
 * @param {string} url - The URL to connect to
 * @param {Object} options - Configuration options
 * @param {Function} [options.onOpen] - Function to call when connection is opened
 * @param {Function} [options.onClose] - Function to call when connection is closed
 * @param {Function} [options.onError] - Function to call when an error occurs
 * @param {Function} [options.onMessage] - Function to call when a message is received
 * @param {Object} [options.eventHandlers] - Custom event handlers for specific event types
 * @param {boolean} [options.autoReconnect=true] - Whether to automatically reconnect on errors
 * @param {number} [options.maxReconnectAttempts=Infinity] - Maximum number of reconnection attempts
 * @param {number} [options.initialReconnectDelay=1000] - Initial delay before reconnection (in ms)
 * @param {number} [options.maxReconnectDelay=30000] - Maximum delay for reconnection (in ms)
 * @returns {Object} Connection object with eventSource and close method
 */
export function createSSEConnection(url, options = {}) {
  let eventSource = null;
  let reconnectAttempts = 0;
  let reconnectTimeout = null;
  
  const {
    onOpen,
    onClose,
    onError,
    onMessage,
    eventHandlers = {},
    autoReconnect = true,
    maxReconnectAttempts = Infinity,
    initialReconnectDelay = 1000,
    maxReconnectDelay = 30000
  } = options;
  
  // Clean up function
  const close = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    
    if (reconnectTimeout) {
      window.clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };
  
  // Connect function
  const connect = () => {
    // Clean up any existing connection
    close();
    
    try {
      // Create new EventSource
      eventSource = new EventSource(url);
      
      // Add general event listeners
      if (onOpen) {
        eventSource.onopen = () => {
          reconnectAttempts = 0;
          onOpen();
        };
      }
      
      if (onMessage) {
        eventSource.onmessage = onMessage;
      }
      
      // Handle errors and reconnection
      eventSource.onerror = (error) => {
        if (onError) {
          onError(error);
        }
        
        close();
        
        if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
          // Exponential backoff for reconnection
          const delay = Math.min(
            initialReconnectDelay * Math.pow(2, reconnectAttempts),
            maxReconnectDelay
          );
          
          reconnectAttempts++;
          
          console.log(`SSE connection error. Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
          
          reconnectTimeout = window.setTimeout(() => {
            connect();
          }, delay);
        } else if (onClose) {
          onClose();
        }
      };
      
      // Add custom event handlers
      Object.entries(eventHandlers).forEach(([eventName, handler]) => {
        eventSource.addEventListener(eventName, handler);
      });
      
    } catch (error) {
      console.error('Failed to create EventSource connection:', error);
      
      if (onError && error instanceof Event) {
        onError(error);
      }
      
      if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(
          initialReconnectDelay * Math.pow(2, reconnectAttempts),
          maxReconnectDelay
        );
        
        reconnectAttempts++;
        
        reconnectTimeout = window.setTimeout(() => {
          connect();
        }, delay);
      } else if (onClose) {
        onClose();
      }
    }
  };
  
  // Initial connection
  connect();
  
  return {
    get eventSource() {
      return eventSource;
    },
    close
  };
}

/**
 * Send a user interaction event to the server
 * 
 * @param {string} baseURL - The base API URL
 * @param {string} uiFlowId - The ID of the UI flow
 * @param {string} componentId - The ID of the component that triggered the interaction
 * @param {string} eventType - The type of event
 * @param {any} data - The data to send with the interaction
 * @returns {Promise<any>} The server response
 */
export async function sendInteractionEvent(
  baseURL,
  uiFlowId,
  componentId,
  eventType,
  data
) {
  try {
    const interactionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (username && password) {
      headers['Authorization'] = `Basic ${btoa(`${username}:${password}`)}`;
    }
    
    const response = await fetch(`${baseURL}/api/v1/uiflows/${uiFlowId}/preview/interaction`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        interactionId,
        componentId,
        eventType,
        data
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending interaction event:', error);
    throw error;
  }
}

export default {
  createSSEConnection,
  sendInteractionEvent
}; 