from fastapi import APIRouter
from app.api.routes import (
    healthCheck,
    products,
)

api_router = APIRouter()

api_router.include_router(healthCheck.router, prefix="/healthCheck", tags=["healthCheck"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])