module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
    'canvas': '<rootDir>/src/__mocks__/canvasMock.js',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: ['**/components/test/**/*.test.jsx', '**/views/**/__tests__/**/*.test.jsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!.*\\.(js|jsx|ts|tsx|mjs)$)'
  ],
  modulePathIgnorePatterns: [
    "node_modules/jsdom"
  ],
  // Set up mock global objects that would normally be in a browser
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs']
}; 