from datetime import timedelta
import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi import Response

from app.api.deps import SessionDep
from app.core import security
from app.core.config import settings
from app.models.common import UserToken, login
from app.services.login import LoginServices
from app.models.schemas.users.user_schemas import UserLoginResponse
from app.enums.status import StatusEnum

router = APIRouter()

logger = logging.getLogger(__name__)

@router.post("/access-token")
def login_access_token(
    response: Response, session: SessionDep, form_data: login
) -> UserLoginResponse:
    user = LoginServices.authenticate(
        session=session, email=form_data.email, phone_number=form_data.phone_number, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail=("Invalid email, phone number, or password"))
    elif not user.status == StatusEnum.ACTIVE:
        raise HTTPException(status_code=400, detail=("User account is not active"))
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_jwt_token(
            str(user.id), expires_delta=access_token_expires
        )
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=int(access_token_expires.total_seconds()),
    )
    return UserLoginResponse(
        message=f"logged in successfully",
        code=user.code,
        status=user.status,
        role=user.role
    )

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Successfully logged out"}
