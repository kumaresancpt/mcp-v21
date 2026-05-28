# Stack Profile: node-express

## Language
TypeScript (Node.js)

## Framework
Express.js 4

## Package manager
npm

## Install command
npm install

## Run command
npm run dev (nodemon) or npm start (ts-node)

## Build command
npm run build (tsc)

## Test command
npm test

## Dev server port
8000

## Dev server URL
http://localhost:8000

## API docs URL
http://localhost:8000/api-docs (Swagger UI via swagger-ui-express)

## Project file
package.json + tsconfig.json

## Project structure
backend/
  package.json
  tsconfig.json
  .env                  ← NOT committed
  .env.example          ← committed, empty values
  src/
    index.ts            ← entry point, Express app setup
    routes/             ← one file per resource (equivalent of Controllers)
    services/           ← business logic
    models/             ← TypeScript interfaces and types
    middleware/         ← auth, error handling, validation
    config/             ← config loader (dotenv)
    db/                 ← database connection

## Route pattern
- Express Router in routes/<resource>.routes.ts
- Mount in index.ts: app.use('/api/<resource>', resourceRouter)
- Use async/await with try/catch in every handler

## Service pattern
- Class-based services in services/<Name>.service.ts
- Import and instantiate in route files

## Model pattern
- TypeScript interfaces in models/<Name>.model.ts
- Zod schemas for request validation

## Config pattern
- dotenv — load .env file
- .env for real values (NOT committed)
- .env.example for template (committed)
- Access via process.env.KEY
- NEVER hardcode secrets

## Auth pattern
JWT via jsonwebtoken
- Package: jsonwebtoken
- Package: bcryptjs (password hashing)
- Middleware: src/middleware/auth.middleware.ts
- Read token from Authorization header: Bearer <token>
- Store in localStorage key: accessToken

## Password hashing
bcryptjs — saltRounds 12
NEVER store plain-text passwords
NEVER return passwordHash in any API response

## Swagger
swagger-jsdoc + swagger-ui-express
ALWAYS enable in ALL environments

## Error response format
res.status(400).json({ detail: 'error message' });
ALWAYS use "detail" as the error field name

## CORS pattern
cors npm package
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));

## Core npm packages
- express
- typescript
- ts-node
- nodemon
- jsonwebtoken
- bcryptjs
- cors
- dotenv
- zod
- swagger-jsdoc
- swagger-ui-express
- @types/express
- @types/jsonwebtoken
- @types/bcryptjs
- @types/cors

## Naming conventions
- Files: kebab-case (auth.service.ts, user.routes.ts)
- Classes: PascalCase
- Functions and variables: camelCase
- JSON response fields: camelCase
- Database columns: snake_case
