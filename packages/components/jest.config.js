/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/__tests__/',
        '/dist/'
    ],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json'
        }
    }
} 