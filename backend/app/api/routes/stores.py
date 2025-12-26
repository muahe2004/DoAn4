from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.api.deps import SessionDep
from app.models.models import Stores

router = APIRouter()

@router.get("")
def get_stores(session: SessionDep, limit: int = 1000):
    """
    Get stores for dropdown
    """
    stores = session.exec(
        select(Stores).limit(limit)
    ).all()
    
    return {
        "data": [
            {
                "id": store.id,
                "store_code": store.store_code,
                "store_name": store.store_name
            }
            for store in stores
        ]
    }

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "module": "stores",
        "version": "1.0.0"
    }