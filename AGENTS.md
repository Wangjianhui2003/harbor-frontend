# Repository Guidelines

## Project Structure & Module Organization
This repository is a Vue 3 + Vite frontend. Application code lives in `src/`: page-level views in `src/views`, shared UI in `src/components`, Pinia stores in `src/stores`, API clients in `src/api`, composables in `src/composable`, and reusable helpers in `src/utils` and `src/lib`. Static assets that must be served as-is belong in `public/`; bundled assets such as icons and styles live in `src/assets`. End-to-end tests live in `e2e`, and unit tests sit beside source files under `src/**/__tests__`.

## Build, Test, and Development Commands
Use `pnpm` to match the checked-in `pnpm-lock.yaml`.

- `pnpm install` installs dependencies. Use Node `^20.19.0 || >=22.12.0`.
- `pnpm dev` starts the Vite dev server on the default local port.
- `pnpm build` runs `vue-tsc` and the production build.
- `pnpm preview` serves the built app locally.
- `pnpm test:unit` runs Vitest in the `jsdom` environment.
- `pnpm test:e2e` runs Playwright against the local app.
- `pnpm lint` runs Oxlint and ESLint with autofix.
- `pnpm format` formats `src/` with Prettier.

## Coding Style & Naming Conventions
Prefer TypeScript and Vue single-file components with the Composition API (`<script setup lang="ts">`). Follow existing formatting: 2-space indentation, no semicolons, single quotes, and a 100-character print width. Use the `@/` alias for imports from `src`. Name Vue components in PascalCase (`LoginPage.vue`, `ChatWindow.vue`), composables with a `use` prefix (`useCaptcha.ts`), stores with a `Store` suffix (`userStore.ts`), and helpers/modules in camelCase.

## Testing Guidelines
Write unit tests next to the code they cover with `*.spec.ts` files under `__tests__`. Keep Playwright specs in `e2e` using `*.spec.ts` or `*.test.ts`; the current suite follows `e2e/vue.spec.ts`. No coverage threshold is enforced in config, so contributors should add tests for new logic, API flows, and UI behavior they change. Run `pnpm test:unit` and `pnpm test:e2e` before opening a PR for user-facing changes.

## Commit & Pull Request Guidelines
Recent history follows short conventional-style subjects such as `feat: ...`, `refactor: ...`, and `test: ...`. Keep commits focused and imperative, and prefer one logical change per commit. Pull requests should include a clear summary, linked issue or task when applicable, screenshots or recordings for UI changes, and notes about test coverage or manual verification.
