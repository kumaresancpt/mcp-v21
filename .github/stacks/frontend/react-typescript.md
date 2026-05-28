# Stack Profile: react-typescript

## Language
TypeScript

## Framework
React 18 + Vite

## File extension
.tsx for components, .ts for hooks and services

## Package manager
npm

## Install command
npm install

## Dev command
npm run dev

## Test command
npm test -- --watchAll=false

## Build command
tsc && vite build

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
  jest.config.cjs
  package.json
  src/
    main.tsx          ← entry point
    App.tsx           ← router + routes
    components/       ← one file per AC
    pages/            ← page-level components
    hooks/            ← custom hooks
    services/         ← API call functions
    styles/           ← globals.css, tokens.css
    __tests__/        ← test files

## Entry point pattern
main.tsx must:
- call ReactDOM.createRoot(document.getElementById('root')!)
- wrap App in React.StrictMode
- NEVER put logic outside the render call

## Routing library
react-router-dom v6

## Route pattern
- Define ALL routes unconditionally in App.tsx
- Use ProtectedRoute component that reads localStorage.getItem('accessToken')
- Wrap Router in ErrorBoundary class component

## Auth token key
accessToken (localStorage) — NEVER use token, auth_token, or any other key

## Component pattern
Functional components with hooks — NEVER class components
ALWAYS use .tsx extension — NEVER .jsx

## State management
useState, useEffect, custom hooks — no external state library needed

## Styling method (without Figma)
Tailwind CSS utility classes

## Styling method (with Figma)
Inline styles with exact values from Visual Spec
CSS variables from Design Tokens on :root
NEVER use arbitrary Tailwind values when Figma spec is provided

## Figma token file
Write all design tokens to src/styles/tokens.css as :root { --token: value; }
Write base reset to src/styles/globals.css
Import both in main.tsx ONLY after verifying files exist on disk

## Figma style application
style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }}

## Config files to create (greenfield only)
- package.json (with react, react-dom, react-router-dom, vite, typescript, jest, ts-jest, @testing-library/react)
- vite.config.ts (with /api proxy)
- tsconfig.json (target ES2020, jsx react-jsx, strict true)
- jest.config.cjs (preset ts-jest, testEnvironment jsdom, moduleNameMapper for CSS)
- src/setupTests.js (import @testing-library/jest-dom)

## package.json dependencies
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0"
}

## package.json devDependencies
{
  "@types/react": "^18.2.43",
  "@types/react-dom": "^18.2.17",
  "@vitejs/plugin-react": "^4.2.1",
  "typescript": "^5.3.3",
  "vite": "^5.0.8",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.4",
  "@testing-library/user-event": "^14.5.1",
  "jest": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0",
  "ts-jest": "^29.1.1",
  "@types/jest": "^29.5.11",
  "identity-obj-proxy": "^3.0.0"
}

## Error handling pattern
- ALWAYS include apiError (string | null) state — show red inline banner on failure
- ALWAYS include successMessage (string | null) state — show green inline banner on success
- NEVER use window.alert() or window.confirm()
- NEVER use console.log for success

## API call pattern
fetch('/api/...', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
Read token fresh: localStorage.getItem('accessToken') inside the function — NEVER capture at module level

## Null safety
ALWAYS use data?.items ?? [] — NEVER access .length or .map() on potentially null values

## Test file location
src/__tests__/<ComponentName>.test.tsx

## Test pattern
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
wrap component in MemoryRouter for all tests
