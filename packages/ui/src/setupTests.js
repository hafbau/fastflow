// This is a fallback setup file that delegates to jest.setup.cjs
// This exists only for backward compatibility if any tests import or reference it
require('../jest.setup.cjs');

// Setup @testing-library/jest-dom extensions
require('@testing-library/jest-dom');

// Mock window object for tests
if (typeof window !== 'undefined') {
  // Setup ResizeObserver mock
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock IntersectionObserver
  window.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }));
}

// Mock canvas module
jest.mock('canvas', () => require('./__mocks__/canvasMock.js')); 