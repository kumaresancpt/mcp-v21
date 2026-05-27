# Stack Profile: next-js

## Language
TypeScript

## Framework
Next.js 14 (App Router)

## File extension
.tsx for components and pages, .ts for utilities and services

## Package manager
npm

## Install command
npm install

## Dev command
npm run dev

## Test command
npm test

## Build command
npm run build

## Dev server port
3000

## Dev server URL
http://localhost:3000

## API proxy config
Next.js handles API routes natively — no proxy needed
Backend API calls use NEXT_PUBLIC_API_URL env variable
Add to .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000

## Project structure
frontend/
  next.config.ts
  tsconfig.json
  package.json
  .env.local           ← NOT committed
  .env.example         ← committed, empty values
  src/
    app/               ← App Router pages
      layout.tsx       ← root layout
      page.tsx         ← home page
      (auth)/          ← route group for auth pages
        login/
          page.tsx
      dashboard/
        page.tsx
    components/        ← shared components
    hooks/             ← custom hooks
    services/          ← API call functions
    styles/            ← globals.css, tokens.css
    __tests__/         ← test files

## Entry point pattern
app/layout.tsx is the root layout — wraps all pages
NEVER use pages/ directory — always use app/ directory (App Router)

## Routing
File-based routing via app/ directory
Use next/navigation: useRouter(), redirect(), notFound()
Auth protection via middleware.ts at project root

## Auth token key
accessToken (localStorage or httpOnly cookie) — NEVER use token or auth_token

## Component pattern
Server Components by default
Add 'use client' directive ONLY when component needs useState, useEffect, or browser APIs
ALWAYS use .tsx extension

## State management
useState, useEffect for client components
Server-side data fetching with async/await in Server Components

## Styling method (without Figma)
Tailwind CSS utility classes

## Styling method (with Figma)
Inline styles with exact values from Visual Spec on client components
CSS variables from Design Tokens on :root in styles/tokens.css
NEVER use arbitrary Tailwind values when Figma spec is provided

## Figma token file
Write all design tokens to src/styles/tokens.css as :root { --token: value; }
Import in app/layout.tsx: import '../styles/tokens.css'

## Figma style application
style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)' }}

## Config files to create (greenfield only)
- package.json (with next, react, react-dom, typescript, jest, @testing-library/react)
- next.config.ts
- tsconfig.json (target ES2017, lib ES2017 DOM, jsx preserve)
- jest.config.cjs (with next/jest transform)

## package.json dependencies
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}

## package.json devDependencies
{
  "typescript": "^5.3.3",
  "@types/react": "^18.2.43",
  "@types/node": "^20.0.0",
  "jest": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.4"
}

## Error handling pattern
- ALWAYS include apiError state — show red inline div on failure
- ALWAYS include successMessage state — show green inline div on success
- NEVER use window.alert() or window.confirm()

## API call pattern
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/...`, { ... })
Read token fresh inside the function — NEVER capture at module level

## Null safety
ALWAYS use data?.items ?? [] — NEVER access .length or .map() on potentially null values

## Test file location
src/__tests__/<ComponentName>.test.tsx

## Test pattern
import { render, screen } from '@testing-library/react'
Use jest + @testing-library/react
Mock next/navigation with jest.mock('next/navigation')
