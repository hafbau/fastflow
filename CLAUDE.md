# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Install: `pnpm install`
- Build: `pnpm build` or `pnpm build-force`
- Dev mode: `pnpm dev`
- Start app: `pnpm start`
- Lint: `pnpm lint` or `pnpm lint-fix`
- Format: `pnpm format`

## Testing
- Tests follow Jest conventions
- Run a specific test: `npx jest path/to/test.test.ts`

## Code Style
- Use TypeScript with strict typing
- Follow Prettier config (printWidth: 140, singleQuote: true, tabWidth: 4, semi: false)
- No unused imports (`unused-imports/no-unused-imports`)
- Only use console.warn, console.error, console.info (no console.log)
- Use PascalCase for components, camelCase for variables and functions
- Follow React best practices for hooks and components
- Branch naming: feature/<feature-name> or bugfix/<bug-name>

## Project Structure
- Monorepo with packages: server (Node.js), ui (React), components (integrations)
- Use absolute imports when possible
- Follow existing patterns when creating new components