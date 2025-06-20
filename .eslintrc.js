module.exports = {
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'prettier'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    env: {
        node: true,
        es6: true
    },
    plugins: ['markdown'],
    ignorePatterns: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
        '**/terraform/**',
        '**/patches/**',
        'pnpm-lock.yaml'
    ],
    rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { 
            vars: 'all', 
            varsIgnorePattern: '^_', 
            args: 'after-used', 
            argsIgnorePattern: '^_' 
        }],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-console': [process.env.CI ? 'error' : 'warn', { allow: ['warn', 'error', 'info'] }]
    },
    overrides: [
        {
            files: ['*.md'],
            processor: 'markdown/markdown'
        },
        {
            files: ['**/*.md/*.js'],
            rules: {
                '@typescript-eslint/no-unused-vars': 'off',
                'no-undef': 'off',
                'no-console': 'off'
            }
        }
    ]
}