# Stack Profile: vue-typescript

## Language
TypeScript

## Framework
Vue 3 + Vite

## File extension
.vue for components, .ts for composables and services

## Package manager
npm

## Install command
npm install

## Dev command
npm run dev

## Test command
npm run test:unit

## Build command
npm run build

## Dev server port
5173

## Dev server URL
http://localhost:5173

## API proxy config
Vite proxy — add to vite.config.ts:
server: { proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } } }

## Project structure
frontend/
  index.html
  vite.config.ts
  tsconfig.json
  package.json
  src/
    main.ts           ← entry point
    App.vue           ← root component + router-view
    components/       ← one .vue file per AC
    pages/            ← page-level views
    composables/      ← equivalent of hooks
    services/         ← API call functions
    assets/           ← styles, images
    router/           ← index.ts with route definitions
    __tests__/        ← test files

## Entry point pattern
main.ts must:
- createApp(App).use(router).mount('#app')
- NEVER put logic outside the mount call

## Routing library
vue-router v4

## Route pattern
- Define ALL routes in src/router/index.ts
- Use navigation guards (router.beforeEach) for auth protection
- Check localStorage.getItem('accessToken') in the guard

## Auth token key
accessToken (localStorage) — NEVER use token, auth_token, or any other key

## Component pattern
<script setup lang="ts"> with Composition API — NEVER Options API
ALWAYS use .vue extension

## State management
ref(), reactive(), composables — no Pinia needed for simple features

## Styling method (without Figma)
Scoped CSS inside <style scoped> blocks with Tailwind classes

## Styling method (with Figma)
:style binding with exact values from Visual Spec
CSS variables from Design Tokens on :root in assets/tokens.css
NEVER use arbitrary Tailwind values when Figma spec is provided

## Figma token file
Write all design tokens to src/assets/tokens.css as :root { --token: value; }
Import in main.ts: import './assets/tokens.css'

## Figma style application
:style="{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }"

## Config files to create (greenfield only)
- package.json (with vue, vue-router, vite, @vitejs/plugin-vue, typescript, vitest, @vue/test-utils)
- vite.config.ts (with vue plugin + /api proxy)
- tsconfig.json (target ESNext, jsx preserve)

## package.json dependencies
{
  "vue": "^3.4.0",
  "vue-router": "^4.2.0"
}

## package.json devDependencies
{
  "@vitejs/plugin-vue": "^5.0.0",
  "typescript": "^5.3.3",
  "vite": "^5.0.8",
  "vitest": "^1.0.0",
  "@vue/test-utils": "^2.4.0",
  "jsdom": "^23.0.0"
}

## Error handling pattern
- ALWAYS include apiError ref<string | null>(null) — show red inline div on failure
- ALWAYS include successMessage ref<string | null>(null) — show green inline div on success
- NEVER use window.alert() or window.confirm()

## API call pattern
fetch('/api/...', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
Read token fresh: localStorage.getItem('accessToken') inside the function

## Null safety
ALWAYS use data?.items ?? [] — NEVER access .length or .map() on potentially null values

## Test file location
src/__tests__/<ComponentName>.test.ts

## Test pattern
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
wrap component with router for all tests that use router-link
