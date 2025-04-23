/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
    'canvas': '<rootDir>/src/__mocks__/canvasMock.js'
  },
  testMatch: ['**/components/test/**/*.test.jsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!.*\\.(js|jsx|ts|tsx|mjs)$)'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js']
}; 