# Stack Profile: postgresql-prisma

## Database
PostgreSQL

## ORM
Prisma 5

## Migration tool
Prisma CLI (npx prisma)

## Core packages
- prisma (devDependency)
- @prisma/client

## Schema file
backend/prisma/schema.prisma

## Connection string location
.env → DATABASE_URL (NOT committed)
.env.example → DATABASE_URL="" (committed)

## Connection string format
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<db-name>"

## Prisma client registration
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()

## Entity pattern (schema.prisma)
model EntityName {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

## Migration commands (greenfield)
npx prisma migrate dev --name InitialCreate
npx prisma generate

## Migration commands (incremental — new feature)
npx prisma migrate dev --name Add<FeatureName>
npx prisma generate

## Migration commands (incremental — fresh machine)
npx prisma migrate deploy
npx prisma generate

## Password hashing
bcryptjs — saltRounds 12
NEVER store plain-text passwords
NEVER return passwordHash in any API response

## Safety rules
- NEVER drop or modify existing tables in incremental mode
- NEVER store credentials in any file
- NEVER return passwordHash in API responses
- NEVER run migrations without user approval of schema plan
- Always run prisma generate after every migration
