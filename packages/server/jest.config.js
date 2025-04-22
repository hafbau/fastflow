/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: 'ts-jest/presets/js-with-ts-esm',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^langchain/(.*)$': '<rootDir>/../../node_modules/langchain/dist/$1',
        '^@langchain/(.*)$': '<rootDir>/../../node_modules/@langchain/$1/dist/$1'
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.json',
                useESM: true
            }
        ]
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx', '.mts', '.cts'],
    transformIgnorePatterns: [
        'node_modules/(?!(langchain|@langchain|fastflow-components)/)'
    ],
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    collectCoverage: true,
    coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
} 