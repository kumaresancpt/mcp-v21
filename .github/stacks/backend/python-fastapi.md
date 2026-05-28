# Stack Profile: python-fastapi

## Language
Python 3.11

## Framework
FastAPI

## Package manager
pip + requirements.txt

## Install command
pip install -r requirements.txt

## Run command
uvicorn main:app --reload --port 8000

## Build command
N/A (interpreted language)

## Test command
pytest

## Dev server port
8000

## Dev server URL
http://localhost:8000

## API docs URL
http://localhost:8000/docs (FastAPI built-in Swagger)

## Project file
requirements.txt

## Project structure
backend/
  main.py               ← entry point, FastAPI app, router mounts
  requirements.txt
  .env                  ← NOT committed
  .env.example          ← committed, empty values
  routers/              ← equivalent of Controllers
    auth.py
    users.py
  services/             ← business logic
    auth_service.py
  models/               ← Pydantic models (request/response)
    user.py
  schemas/              ← DB schemas (SQLAlchemy models)
    user_schema.py
  database.py           ← DB connection and session
  config.py             ← settings via pydantic-settings

## Route pattern
- APIRouter in routers/<resource>.py
- Mount in main.py: app.include_router(resource_router, prefix="/api/<resource>")
- Use async def for all route handlers
- Dependency injection via Depends()

## Service pattern
- Functions or classes in services/<name>_service.py
- Inject via Depends() in route handlers

## Model pattern
- Pydantic BaseModel for request/response in models/
- SQLAlchemy declarative models in schemas/

## Config pattern
- pydantic-settings BaseSettings class in config.py
- .env file for real values (NOT committed)
- .env.example for template (committed)
- NEVER hardcode secrets

## Auth pattern
JWT via python-jose
- Package: python-jose[cryptography]
- Package: passlib[bcrypt] (password hashing)
- OAuth2PasswordBearer for token extraction
- Store in localStorage key: accessToken (frontend)

## Password hashing
passlib with bcrypt — rounds 12
NEVER store plain-text passwords
NEVER return password_hash in any API response

## Swagger
FastAPI generates Swagger automatically at /docs
ALWAYS available in ALL environments — no guard needed

## Error response format
raise HTTPException(status_code=400, detail="error message")
FastAPI returns: { "detail": "error message" }
ALWAYS use "detail" — matches frontend expectations automatically

## CORS pattern
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=[...], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

## Core pip packages
fastapi
uvicorn[standard]
sqlalchemy
alembic
psycopg2-binary
python-jose[cryptography]
passlib[bcrypt]
pydantic-settings
python-dotenv
pytest
httpx

## Naming conventions
- Files: snake_case (auth_service.py, user_router.py)
- Classes: PascalCase
- Functions and variables: snake_case
- JSON response fields: snake_case (FastAPI default)
- Database columns: snake_case
