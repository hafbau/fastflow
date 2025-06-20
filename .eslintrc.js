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
                '@typescript-eslint/recommended'
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
            processor: 'markdown/markdown'
        },
        {
            files: ['**/*.md/*.js'],
            rules: {
                'no-unused-vars': 'off',
                'no-undef': 'off',
                'no-console': 'off'
            }
        }
    ]
}