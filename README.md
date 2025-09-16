# Project 4 - FastAPI + React + Vite + TypeScript

## Overview
This project consists of:
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) + [Alembic](https://alembic.sqlalchemy.org/) + [PostgreSQL](https://www.postgresql.org/)
- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)

The goal is to build a fullstack web application with a robust REST API (FastAPI) and a modern frontend (React + Vite + TS).

---

## Environment Configuration

Create a `.env` file inside the `DoAn4/` directory with the following content:

```env
# PostgreSQL
POSTGRES_SERVER=localhost
POSTGRES_PORT=5439
POSTGRES_DB=PROJECT4
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Secret Key
PROJECT4_SECRET_KEY=your_secret_key

# Step 1. Build Docker
# docker-compose -f docker-compose.local.yml up -d --build

# Step 2. Instal libraries
# A. Backend
# 1. python -m venv venv
# 2. .\venv\Scripts\Activate.ps1 (windown) or source venv/bin/activate (macOS)
# 3. pip install fastapi
# 4. pip install uvicorn
# 5. pip install sqlmodel
# 6. pip install dotenv
# 7. pip install pydantic_settings
# 8. pip install psycopg
# 9. pip install psycopg[binary]

# B. Frontend
# 1. npm install

# Step 3. RUN BACKEND
# 2. uvicorn app.main:app --reload

# Step 4. RUN FRONTEND
# npm run dev