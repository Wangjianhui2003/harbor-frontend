# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 real-time chat application (harbor-frontend) featuring:
- **Real-time messaging** via WebSocket with friend/group chat
- **WebRTC video/voice calling** with peer-to-peer connections
- **Modern stack**: Vue 3 + TypeScript + Vite + Tailwind CSS v4
- **UI libraries**: shadcn-vue (component library) + PrimeVue (UI toolkit)
- **State management**: Pinia stores with composable patterns
- **Form validation**: Vee-Validate with Zod schemas
- **API client**: Axios with custom interceptors
- **Styling**: Tailwind CSS v4 with OKLCH color system, custom theme with dark/light modes
- **Development tools**: Vue DevTools, auto-import of PrimeVue components, VueUse utilities

## Development Commands

```bash
# Install dependencies (uses pnpm - lockfile present)
npm install  # or pnpm install

# Start development server
npm run dev

# Build for production
npm run build          # Runs type-check and build in parallel
npm run build-only    # Build without type-check

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint          # Runs oxlint and ESLint with auto-fix

# Format code
npm run format        # Prettier on src/ directory

# Testing
npm run test:unit     # Vitest unit tests
npm run test:e2e      # Playwright end-to-end tests
# Run specific test: npm run test:unit -- --run <test-file>

# E2E test options (from README)
# Install browsers: npx playwright install
# Run on Chromium only: npm run test:e2e --project=chromium
# Run specific file: npm run test:e2e tests/example.spec.ts
# Debug mode: npm run test:e2e --debug
```

## Environment Configuration

Environment variables (in `.env.development` / `.env.production`):
```env
VITE_API_URL=http://localhost:8100/api      # Backend API base URL
VITE_WEBSOCKET_URL=ws://localhost:8101/im   # WebSocket server URL
```

## Development Environment

- **Package manager**: Uses pnpm (lockfile: `pnpm-lock.yaml`). `npm install` will respect the lockfile.
- **Node.js version**: `^20.19.0 || >=22.12.0` (see `engines` in package.json)
- **Module system**: ES Modules (`"type": "module"` in package.json)
- **VS Code extensions**: Recommended extensions in `.vscode/extensions.json`:
  - Vue Volar, Vitest Explorer, Playwright, ESLint, EditorConfig, Oxc, Prettier

## Architecture & Key Patterns

### Folder Structure
```
src/
├── api/              # API service modules (axios instances, endpoints)
├── assets/           # Static assets (images, styles)
├── components/       # Vue components
│   ├── layouts/     # Layout components (navigation, float elements)
│   └── ui/          # shadcn-vue components (when added)
├── composable/       # Composition functions (useVideoCall, useAuth, etc.)
├── event/           # Event bus (mitt) and RTC event definitions
├── lib/             # Utilities (cn() for class merging, constants)
├── router/          # Vue Router configuration
├── stores/          # Pinia stores (user, chat, friend, group, WebRTC)
├── types/           # TypeScript interfaces and types
├── utils/           # Helper functions (enums, message utils, WebSocket client)
└── views/           # Page components (Login, Home, Chat, Friend, etc.)
```

### Key Architectural Patterns

1. **State Management**: Pinia stores follow composable pattern (`defineStore` with ref/computed). Main store (`stores/index.ts`) coordinates loading of all substores.

2. **API Layer**: Axios-based services in `src/api/` with typed responses. Uses environment variable `VITE_API_URL`. WebSocket client in `utils/websocket-utils.ts` manages connection lifecycle.

3. **Real-time Communication**:
   - WebSocket for chat messages, friend/group updates, system notifications
   - WebRTC for peer-to-peer video/voice calls using `RTCPeerConnection`
   - Event bus (mitt) for cross-component RTC signaling

4. **UI Component Architecture**:
   - **PrimeVue**: Auto-imported via `unplugin-vue-components` with `PrimeVueResolver`
   - **shadcn-vue**: Configured via `components.json`; uses `cn()` utility from `lib/utils.ts`
   - **Tailwind CSS v4**: Custom theme defined in `assets/styles/tailwind.css` with OKLCH colors
   - **PrimeVue Theme**: Custom preset in `primevue-preset.ts` based on Aura theme

5. **Routing**: Nested routes with layout (`HomePage` contains `NaviBar` and child views). Authentication guards may be implemented in router.

6. **Composables**: Reusable logic for WebRTC calls (`useVideoCall`, `useVoiceCall`), authentication (`useAuth`), and cached data.

7. **Type Safety**: Comprehensive TypeScript definitions in `src/types/`. Enums in `utils/enums.ts` for message types, RTC states, etc.

### Development Notes

- **Aliases**: `@/*` maps to `src/*` (configured in `vite.config.ts` and `tsconfig.json`)
- **Auto-imports**: PrimeVue components are auto-imported; no need to manually import them
- **Styling**: Uses Tailwind CSS v4 with `@theme` directive. Custom properties defined for shadcn-vue compatibility
- **Dark mode**: Controlled via `@vueuse/core` `useColorMode` with `dark-mode` CSS class
- **Code quality**: ESLint config disables `vue/multi-word-component-names`. Oxlint for fast linting
- **Testing**: Vitest with jsdom for unit tests; Playwright for e2e
- **Build system**: Uses `npm-run-all2` for parallel execution (type-check and build run in parallel)

### Important Files to Understand

- `src/main.ts` – App initialization, PrimeVue theme, plugin registration
- `src/primevue-preset.ts` – PrimeVue theme customization
- `src/router/router.ts` – Route definitions
- `src/stores/` – State management (user, chat, friend, group, WebRTC)
- `src/utils/websocket-utils.ts` – WebSocket client with reconnection logic
- `src/composable/useVideoCall.ts` – WebRTC video call logic
- `src/assets/styles/tailwind.css` – Tailwind v4 theme and design tokens
- `vite.config.ts` – Build configuration with plugins
- `components.json` – shadcn-vue configuration

### Adding New shadcn-vue Components

Use the shadcn-vue CLI (if installed) or manually:
1. Run `npx shadcn-vue@latest add [component]`
2. Components will be added to `src/components/ui/`
3. Use `cn()` utility for class merging

### Working with WebRTC

- RTC signaling travels via WebSocket messages with type `MESSAGE_TYPE.RTC_*`
- Peer connection state managed in stores and composables
- Event bus (`mitter`) relays signaling between components

### Deployment

- Build output goes to `dist/`
- Requires Node.js `^20.19.0 || >=22.12.0` (see `engines` in package.json)
- Environment variables must be set for production API/WebSocket URLs
- For E2E testing on CI: must build the project first (`npm run build`) before running tests