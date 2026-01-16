# Kernelift Playground - Agent Guidelines

This file contains essential information for agentic coding agents working on this Vue 3 + TypeScript playground project.

## Project Overview

This is a Kernelift Playground application built with Vue 3, TypeScript, Vite, and PrimeVue. It demonstrates various tools and features including AI chat, markdown editor, encryption utilities, and color utilities.

## Build & Development Commands

### Core Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production (runs type-check and build-only)
- `pnpm build-only` - Build without type checking
- `pnpm preview` - Preview production build

### Code Quality

- `pnpm lint` - Run all linting (oxlint and eslint) with auto-fix
- `pnpm lint:oxlint` - Run oxlint with auto-fix
- `pnpm lint:eslint` - Run eslint with auto-fix
- `pnpm format` - Format code with prettier
- `pnpm type-check` - Run TypeScript type checking

### Testing

This project currently does not have test commands configured. Consider adding:

- `pnpm test` - Run tests
- `pnpm test:unit` - Run unit tests
- `pnpm test:e2e` - Run end-to-end tests

## Code Style Guidelines

### Formatting (Prettier)

- Use single quotes
- Add semicolons
- Print width: 100 characters
- No trailing commas

### Editor Configuration

- Indentation: 2 spaces
- End of line: LF
- Insert final new line: true
- Trim trailing whitespace: true
- Max line length: 100 characters

### TypeScript & Vue

- Use Composition API with `<script setup>`
- Explicitly set `lang="ts"` on script tags
- Use `defineOptions()` for component names when needed
- Prefer type annotations for function parameters and returns
- Use `const` for variables that won't be reassigned

### Import Organization

```typescript
// 1. Vue imports
import { ref, computed, onMounted } from 'vue';

// 2. Third-party libraries
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

// 3. Local imports (use @ alias)
import { useChat } from '@/views/ai-chat/use-chat';
import { CHAT_BASE_URL } from '@/constants';
```

### Component Structure

- Use semantic HTML5 elements
- Follow PrimeVue component patterns
- Use Tailwind CSS classes for styling
- Keep styles scoped when component-specific
- Add responsive design considerations

### State Management

- Use Pinia stores for global state
- Use `@vueuse/core` utilities for localStorage and browser APIs
- Keep component state local when possible

### Error Handling

- Use try-catch blocks for async operations
- Provide meaningful error messages
- Use Toast notifications for user feedback
- Handle API errors gracefully

### Naming Conventions

- Components: PascalCase (e.g., `AiChat`, `MarkdownEditor`)
- Files: kebab-case for directories, PascalCase for Vue files
- Functions/Variables: camelCase
- Constants: SCREAMING_SNAKE_CASE
- CSS classes: kebab-case with Tailwind utilities

### File Organization

```
src/
├── views/           # Page components
│   ├── ai-chat/    # Feature-specific modules
│   └── home-view.vue
├── utils/           # Utility functions
├── stores/          # Pinia stores
├── assets/          # Static assets
└── router/          # Vue Router configuration
```

## Development Notes

### Environment

- Node.js: ^20.19.0 || >=22.12.0
- Package manager: pnpm
- Uses workspace configuration with `pnpm-workspace.yaml`

### Build Tools

- Vite (beta version) for bundling
- Vue DevTools plugin enabled in development
- Tailwind CSS v4 with PrimeUI integration
- TypeScript strict mode enabled

### Dependencies

- Vue 3.5+ with Composition API
- PrimeVue 4.5+ for UI components
- Kernelift packages for specialized functionality
- Vue Router 4 for navigation
- Pinia for state management

## Linting Configuration

The project uses both oxlint (fast) and ESLint (comprehensive):

- Vue 3 recommended rules
- TypeScript recommended rules
- Prettier integration to avoid formatting conflicts
- Auto-fix enabled for both linters

## Testing Strategy (To Be Implemented)

When adding tests, consider:

- Unit tests for utilities and store logic
- Component tests for Vue components
- E2E tests for critical user flows
- Testing library: Vitest for unit/integration, Playwright for E2E

## Performance Considerations

- Lazy load route components
- Use `v-if` vs `v-show` appropriately
- Optimize PrimeVue component imports
- Use Vite's code splitting features
- Implement proper error boundaries

## Security Notes

- API keys stored in localStorage (consider more secure alternatives)
- Use environment variables for sensitive data
- Validate user inputs in encryption utilities
- Implement proper CSP headers in production
