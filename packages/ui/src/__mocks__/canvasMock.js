// Mock Canvas implementation for Jest tests
const createCanvasMock = () => {
  // Basic implementation of canvas methods and properties
  return {
    getContext: jest.fn(() => ({
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Array(4),
      })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => []),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      translate: jest.fn(),
      transform: jest.fn(),
      fillText: jest.fn(),
      strokeText: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
      createRadialGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
      createPattern: jest.fn(() => ({})),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      bezierCurveTo: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      clip: jest.fn(),
    })),
    toDataURL: jest.fn(() => ''),
    toBlob: jest.fn(() => ''),
    width: 100,
    height: 100,
  };
};

// Create mock Canvas class
class Canvas {
  constructor() {
    return createCanvasMock();
  }
}

// Create mock CanvasRenderingContext2D class
class CanvasRenderingContext2D {}

// Create mock Image class
class Image {
  constructor() {
    this.src = '';
    this.width = 0;
    this.height = 0;
    this.onload = jest.fn();
    this.onerror = jest.fn();
  }
}

// Create mock ImageData class
class ImageData {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
}

// Create mock Path2D class
class Path2D {
  constructor() {
    return {
      addPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      bezierCurveTo: jest.fn(),
      arc: jest.fn(),
    };
  }
}

// Export all mock classes and functions
module.exports = {
  Canvas,
  createCanvas: jest.fn(() => createCanvasMock()),
  Image,
  ImageData,
  Path2D,
  CanvasRenderingContext2D,
}; 