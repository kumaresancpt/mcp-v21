# Stack Profile: mongodb-mongoose

## Database
MongoDB

## ORM
Mongoose 8

## Migration tool
N/A — MongoDB is schemaless, migrations handled via Mongoose schema versioning

## Core packages
- mongoose
- @types/mongoose (if TypeScript)

## Connection string location
.env → MONGODB_URI (NOT committed)
.env.example → MONGODB_URI="" (committed)

## Connection string format
MONGODB_URI="mongodb://localhost:27017/<db-name>"

## Connection setup
import mongoose from 'mongoose'
await mongoose.connect(process.env.MONGODB_URI)

## Entity pattern (Mongoose Schema)
const EntitySchema = new mongoose.Schema({
  field: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true })
export const EntityModel = mongoose.model('Entity', EntitySchema)

## Password hashing
bcryptjs — saltRounds 12
NEVER store plain-text passwords
NEVER return passwordHash in any API response

## No migration commands
MongoDB is schemaless — no migration tool needed
Schema changes are applied automatically via Mongoose schema updates
For data migrations, write a one-time migration script in scripts/

## Safety rules
- NEVER store credentials in any file
- NEVER return passwordHash in API responses
- Always use { timestamps: true } on schemas that track state over time
- Always add indexes on frequently queried fields: schema.index({ field: 1 })
