/**
 * Custom JSDOM environment that disables canvas
 */

import { TextEncoder, TextDecoder } from 'util';
import { JSDOM } from 'jsdom';
import { TestEnvironment } from 'jest-environment-jsdom';

// Mock canvas implementation
class MockCanvas {
  getContext() { return {}; }
  toDataURL() { return ''; }
  toBlob() { return null; }
}

class CustomTestEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();
    
    // Add missing DOM globals
    if (!this.global.TextEncoder) {
      this.global.TextEncoder = TextEncoder;
    }
    if (!this.global.TextDecoder) {
      this.global.TextDecoder = TextDecoder;
    }
    
    // Mock canvas
    this.global.HTMLCanvasElement.prototype.getContext = () => ({
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: new Array(4) }),
      putImageData: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      scale: () => {},
      rotate: () => {},
      translate: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createPattern: () => ({}),
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      fill: () => {},
      stroke: () => {},
      arc: () => {},
      measureText: () => ({ width: 0 }),
    });
    this.global.HTMLCanvasElement.prototype.toDataURL = () => '';
    this.global.HTMLCanvasElement.prototype.toBlob = (cb) => cb(null);
    
    // Mock createElementNS to handle canvas creation
    const origCreateElementNS = this.global.document.createElementNS;
    this.global.document.createElementNS = function (namespaceURI, qualifiedName) {
      if (namespaceURI === 'http://www.w3.org/1999/xhtml' && qualifiedName === 'canvas') {
        const canvas = origCreateElementNS.call(this, namespaceURI, qualifiedName);
        return canvas;
      }
      return origCreateElementNS.apply(this, arguments);
    };
    
    // Mock or polyfill other required browser APIs for tests
    this.global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    
    this.global.DOMRect = class DOMRect {
      constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.top = y;
        this.right = x + width;
        this.bottom = y + height;
        this.left = x;
      }
    };
    
    // Mock matchMedia
    this.global.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  }
}

export default CustomTestEnvironment; 