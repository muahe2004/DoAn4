
from http.client import HTTPException
from sqlmodel import Session, select
from fastapi import HTTPException

from app.models.models import Users
from app.models.schemas.users.user_schemas import UserPublic
from app.core.security import get_password_hash
from app.enums.status import StatusEnum

class UserServices:
    @staticmethod
    def register(session: Session, data: UserPublic) -> UserPublic:
        existing = session.exec(select(Users).where(Users.email == data.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"User {data.email} already exists.")
        new_user = Users(
            name=data.name,
            email=data.email,
            code=data.code,
            password=get_password_hash(data.password),
            phone_number=data.phone_number,
            role=data.role,
            status=StatusEnum.ACTIVE,
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        return UserPublic.model_validate(new_user)

    @staticmethod
    def get_user_by_email_or_phone(*, session: Session, email: str, phone_number: str) -> Users | None:
        statement = select(Users).where((Users.email == email) | (Users.phone_number == phone_number))
        session_user = session.exec(statement).first()
        return session_user