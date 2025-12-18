import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session

from app.api.deps import get_db
from app.models.common import Message
from app.models.schemas.users.user_schemas import UserCreate
from app.services.users import UserServices

router = APIRouter(tags=["users"])
logger = logging.getLogger(__name__)


class UserCreateWithConfirm(UserCreate, BaseModel):
    confirm_password: str


@router.post("/register", response_model=Message)
def register_user(payload: UserCreateWithConfirm, session: Session = Depends(get_db)):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Password and confirm password do not match")

    user_data = UserCreate.model_validate(payload.model_dump(exclude={"confirm_password"}))
    user = UserServices.register(session=session, data=user_data)
    return Message(message=f"User {user.email} registered successfully")

