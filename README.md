# Project 4 - FastAPI + React + Vite + TypeScript

## Overview
This project consists of:
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) + [Alembic](https://alembic.sqlalchemy.org/) + [PostgreSQL](https://www.postgresql.org/)
- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)

The goal is to build a fullstack web application with a robust REST API (FastAPI) and a modern frontend (React + Vite + TS).

---

## Environment Configuration

Create a `.env` file inside the `backend/` directory with the following content:

```env
# PostgreSQL
POSTGRES_SERVER=localhost
POSTGRES_PORT=5439
POSTGRES_DB=PROJECT4
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Secret Key
PROJECT4_SECRET_KEY=your_secret_key

# RUN BACKEND
# 1. source venv/bin/activate
# 2. uvicorn app.main:app --reload

# RUN FRONTEND
# npm run dev