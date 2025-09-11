from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine
router = APIRouter()

@router.get("/health")
def health_check():
    try:
        with Session(engine) as session:
            session.exec(text("SELECT 1")) 
        return {"status": "ok", "message": "Service and Database are running"}
    except Exception as e:
        return {"status": "error", "message": f"Database connection failed: {str(e)}"}