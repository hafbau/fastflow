module.exports = {
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    env: {
        node: true,
        es6: true
    },
    ignorePatterns: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/coverage/**',
        '**/terraform/**',
        '**/patches/**',
        'pnpm-lock.yaml',
        '**/*.md',
        '**/*.json',
        'core/**'  // Don't lint upstream Flowise code
    ],
    rules: {
        'no-unused-vars': ['warn', { 
            vars: 'all', 
            varsIgnorePattern: '^_', 
            args: 'after-used', 
            argsIgnorePattern: '^_' 
        }],
        'no-console': [process.env.CI ? 'error' : 'warn', { allow: ['warn', 'error', 'info'] }]
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint'],
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended'
            ],
            rules: {
                '@typescript-eslint/no-unused-vars': ['warn', { 
                    vars: 'all', 
                    varsIgnorePattern: '^_', 
                    args: 'after-used', 
                    argsIgnorePattern: '^_' 
                }],
                'no-unused-vars': 'off'
            }
        },
        {
            files: ['*.md'],
            rules: {
                'no-unused-vars': 'off',
                'no-undef': 'off',
                'no-console': 'off'
            }
        }
    ]
}