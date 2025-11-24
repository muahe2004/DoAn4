import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.api.deps import get_db
from app.models.schemas.users.user_schemas import UserPublic
from app.models.common import Message
from app.services.users import UserServices
from app.core.security import create_jwt_token
from app.core.config import settings

router = APIRouter(prefix="/users", tags=["users"])
logger = logging.getLogger(__name__)

@router.post("/register", response_model=Message)
def register_user(
    payload: UserPublic,
    session: Session = Depends(get_db)
):
    """
    Register user and issue verification token
    """
    try:
        user = UserServices.register(session=session, data=payload)
        
        logger.info(f"Verification token created for: {user.email}")

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Error during registration process for {payload.email}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during registration")
