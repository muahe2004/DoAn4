from fastapi import APIRouter
from app.api.routes import (healthCheck)

api_router = APIRouter()
# include router
api_router.include_router(healthCheck.router, prefix="/healthCheck", tags=["healthCheck"])
