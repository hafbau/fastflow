/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
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
    testMatch: ['**/__tests__/**/*.test.ts']
} 