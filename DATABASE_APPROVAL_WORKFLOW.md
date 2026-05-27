# 🗄️ Database Agent Approval Workflow - Updated Feature

## Overview

The Database Agent (`07-database-agent`) now has a **mandatory user approval gate** before any database modifications occur. Users can review the complete schema plan, request changes, and only after explicit approval will the agent proceed with migrations.

---

## 📋 Complete Workflow

### **PHASE 1: Context & Planning**
```
STEP 1 → Load Context
  ├─ Read .gstack/context.md
  ├─ Read .gstack/acs.md  
  └─ Load database stack profile (PostgreSQL+EF Core, Prisma, etc.)

STEP 2-3 → Setup
  ├─ Prompt for database credentials (name, username, password)
  └─ Install ORM/migration tool packages
```

### **PHASE 2: Schema Analysis**
```
STEP 4 → Derive Entities from Requirements
  ├─ Scan Acceptance Criteria (ACs) for data entities
  ├─ Read backend source code for database references
  ├─ Build Required Entity List (deduplicated)
  └─ Write entity definition files (ORM classes)

STEP 4D → GENERATE SCHEMA PLAN (Internal)
  ├─ Existing Tables: List tables that already exist (if incremental mode)
  ├─ New Tables: Specify all tables to create with columns & types
  ├─ Modified Tables: List columns to add to existing tables
  ├─ Indexes: List new indexes to create
  ├─ Migration Details: Command to run + migration name
  └─ Connection Details: Database name, host, username, ORM version
```

### **PHASE 3: USER APPROVAL GATE** ⏳ **[MANDATORY]**

```
STEP 4E → PRESENT PLAN TO USER
  
┌────────────────────────────────────────────────────────────────┐
│ 📋 DATABASE SCHEMA PLAN — PLEASE REVIEW & APPROVE              │
│                                                                │
│ EXISTING TABLES (unchanged):                                  │
│   • users: Stores user accounts (50 existing columns)          │
│   • roles: Permission roles (5 existing columns)               │
│                                                                │
│ NEW TABLES TO CREATE:                                         │
│   • products: Product catalog                                 │
│     - id (SERIAL PRIMARY KEY)                                 │
│     - name (VARCHAR 255, NOT NULL)                            │
│     - description (TEXT)                                      │
│     - price (DECIMAL 10,2)                                    │
│     - stock_quantity (INTEGER DEFAULT 0)                      │
│     - created_at (TIMESTAMP DEFAULT NOW())                    │
│     - updated_at (TIMESTAMP DEFAULT NOW())                    │
│     - Relations: None                                         │
│                                                                │
│   • orders: Customer orders                                   │
│     - id (SERIAL PRIMARY KEY)                                 │
│     - user_id (INTEGER, FOREIGN KEY → users.id)               │
│     - total_amount (DECIMAL 10,2)                             │
│     - status (VARCHAR DEFAULT 'pending')                      │
│     - created_at (TIMESTAMP DEFAULT NOW())                    │
│     - Relations: user_id → users                              │
│                                                                │
│ MODIFIED EXISTING TABLES:                                     │
│   • users: Adding new columns                                 │
│     - phone (VARCHAR 20)                                      │
│     - last_login (TIMESTAMP)                                  │
│                                                                │
│ INDEXES:                                                      │
│   • idx_products_name: ON products(name) — Fast product search │
│   • idx_orders_user: ON orders(user_id) — User order lookups  │
│   • idx_users_email: ON users(email) — User email search      │
│                                                                │
│ MIGRATION DETAILS:                                            │
│   Database: my_app_db                                         │
│   Host: localhost (port 5432)                                 │
│   ORM: EF Core (Entity Framework)                             │
│   Mode: Fresh Create (new database)                           │
│   Command: dotnet ef database update                          │
│   Migration Name: 20260527_120000_initial_schema              │
│                                                                │
│ REPLY WITH:                                                   │
│   ✅ "Approve" → Proceed with this exact schema                │
│   ✏️ "Change: [your changes]" → I'll update the plan          │
│   ❌ "Cancel" → Halt the pipeline                              │
│                                                                │
│ ⏳ Waiting for your response...                                │
└────────────────────────────────────────────────────────────────┘
```

### **PHASE 4: User Response Handling**

```
STEP 4F → HANDLE USER RESPONSE

Option A: User replies "Approve"
  ├─ Mark plan as "✅ Approved by user"
  ├─ Store timestamp
  └─ Proceed to STEP 5 (execute migration)

Option B: User replies "Change: Add column status to orders table"
  ├─ Update the schema plan
  ├─ Add: status (VARCHAR DEFAULT 'pending') to orders table
  ├─ Re-present the UPDATED plan (same format)
  ├─ ⏳ WAIT AGAIN for user approval/changes
  └─ Loop back to Option A or B

Option C: User replies "Cancel"
  ├─ HALT PIPELINE IMMEDIATELY
  ├─ Report error:
  │   "❌ DATABASE SCHEMA REJECTED: User cancelled the schema plan."
  │   "Pipeline halted. No changes made to database."
  └─ STOP - Do NOT run any migrations

STEP 4G → STORE APPROVED PLAN
  ├─ Write to .gstack/schema-plan-approved.md
  └─ Include: approval timestamp, user confirmation, full schema details
```

### **PHASE 5: Execute (Only After User Approval)**

```
STEP 5 → Update Entry Point
  ├─ Add DB context registration to Program.cs / index.ts
  └─ Enable auto-migrate on startup (if configured)

STEP 6 → Verify Install
  └─ Run install command again to ensure all packages resolved

STEP 7 → Update Config Files
  ├─ Add connection string placeholder (committed)
  └─ Add local override with host/db only (NOT committed)

STEP 8 → RUN MIGRATION ✅ (Only if user approved)
  ├─ Run: `dotnet ef database update` (example)
  ├─ Verify command succeeded
  └─ Confirm all tables created on database
```

### **PHASE 6: Store Results in Output Folder** 📁

```
STEP 9 → WRITE SUMMARY AND COPY TO OUTPUT/

9a: Write Summary
  └─ .gstack/impl-database.md (internal tracking)

9b: Copy Approved Schema Plan
  └─ output/database-schema-approved.md
     ├─ Approved schema
     ├─ User approval timestamp
     └─ Full table/column definitions

9c: Write Migration Log
  └─ output/database-migrations-applied.md
     ├─ Migration command run: `dotnet ef database update`
     ├─ Status: ✅ Applied successfully
     ├─ Tables affected: [products, orders, users]
     ├─ Columns added: 5
     ├─ Indexes created: 3
     └─ Verification: ✅ All tables created

9d: Write Entity Definitions
  └─ output/database-entities.md
     ├─ Entity: Product
     │   ├─ Purpose: Product catalog storage
     │   ├─ Fields: id, name, description, price, stock_quantity, timestamps
     │   ├─ Relationships: None
     │   └─ Status: ✅ Created
     ├─ Entity: Order
     │   ├─ Purpose: Store customer orders
     │   ├─ Fields: id, user_id, total_amount, status, timestamps
     │   ├─ Relationships: user_id → users
     │   └─ Status: ✅ Created
     └─ Entity: User (Modified)
           ├─ Purpose: User accounts + new fields
           ├─ New Fields: phone, last_login
           ├─ Relationships: 1-to-many with orders
           └─ Status: ✅ Modified

9e: Copy Entity Source Code
  └─ output/database-entities-source-code/
     ├─ Product.cs (or .ts, .py based on stack)
     ├─ Order.cs
     ├─ User.cs
     ├─ AppDbContext.cs (ORM context file)
     └─ (All entity files for reference/documentation)

STEP 10 → Update Usage Log
  └─ .gstack/usage-log.jsonl
     ├─ agent: 07-database-agent
     ├─ status: success
     ├─ tables_created: 2
     ├─ tables_modified: 1
     ├─ user_approval: ✅ approved
     └─ migration_name: 20260527_120000_initial_schema
```

---

## 📁 Output Folder Structure (Always Available)

After the database agent completes, all results are stored in the `output/` folder:

```
output/
├─ database-schema-approved.md
│  └─ Complete approved schema with user sign-off
│     ├─ Existing tables (if incremental)
│     ├─ New tables to create
│     ├─ Modified existing tables
│     ├─ Indexes
│     └─ Migration command used
│
├─ database-migrations-applied.md
│  └─ Actual migration execution log
│     ├─ Date & time of execution
│     ├─ Migration tool used
│     ├─ Command run: `[exact command]`
│     ├─ Tables affected: [list]
│     ├─ Verification results
│     └─ Rollback info
│
├─ database-entities.md
│  └─ Reference documentation for all entities
│     ├─ Entity: ProductEntity
│     │   ├─ Purpose
│     │   ├─ All fields with types
│     │   ├─ Relationships
│     │   ├─ Indexes
│     │   └─ Created from AC: AC-123
│     └─ (Repeat for each entity)
│
└─ database-entities-source-code/
   ├─ Product.cs (ORM entity class)
   ├─ Order.cs
   ├─ User.cs
   ├─ AppDbContext.cs (or DbContext equivalent)
   └─ (All generated ORM files)
```

**These files are always available** after the database agent completes successfully, regardless of whether it's greenfield or incremental mode.

---

## 🔄 Key Features

| Feature | Before | After |
|---------|--------|-------|
| **Schema Review** | No | ✅ Full schema shown before execution |
| **User Approval** | Not required | ✅ **Mandatory gate** |
| **Change Requests** | Not supported | ✅ User can request changes, re-review |
| **Output Storage** | Limited | ✅ All results in `output/` folder |
| **Audit Trail** | Minimal | ✅ Full approval history stored |
| **Entity Reference** | Not available | ✅ Available in `output/database-entities.md` |
| **Source Code Backup** | Not available | ✅ Available in `output/database-entities-source-code/` |

---

## ✅ Approval Workflow Summary

1. **Agent generates** comprehensive schema plan
2. **User reviews** all tables, columns, relationships, indexes
3. **User decides:**
   - ✅ Approve → Agent proceeds with migration
   - ✏️ Change → Agent updates plan and re-shows it
   - ❌ Cancel → Pipeline halts, no changes to database
4. **Once approved:** Migration runs automatically
5. **Results stored** in `output/` folder for future reference

---

## 💡 Use Cases

### Use Case 1: Fresh Database
```
Agent: "Here's the schema for your new application"
User: "✅ Approve"
Result: Database created with all tables from output/database-schema-approved.md
```

### Use Case 2: Incremental with Changes
```
Agent: "I'll add 'products' table and modify 'users' table"
User: "✏️ Change: Also add a 'reviews' table"
Agent: "Updated plan now shows products + reviews (new) and users (modified)"
User: "✅ Approve"
Result: All 3 tables handled as planned
```

### Use Case 3: Existing Database (Connection validation)
```
Agent: "I'll connect to your PostgreSQL and add new schema"
User: "✅ Approve"
Result: New schema added to existing database (no data loss)
Output: Shows what was added vs. what already existed
```

---

## 📝 Files Modified

- **[07-database-agent.md](.github/agents/07-database-agent.md)** — Updated with:
  - New STEP 4D: Generate schema plan
  - New STEP 4E: Present plan to user (mandatory approval gate)
  - New STEP 4F: Handle user response (approve/change/cancel)
  - New STEP 4G: Store approved plan
  - Updated STEP 9: Copy all results to `output/` folder
  - Updated STEP 10: Enhanced usage logging with user approval status

---

## 🚀 What's Next

When the orchestrator runs the pipeline:
1. User selects tech stack + requirements source
2. **[NEW]** When database agent runs, user sees full schema plan
3. **[NEW]** User approves or requests changes
4. **[NEW]** All results automatically stored in `output/` folder
5. Pipeline continues with integration, testing, GitHub commit

