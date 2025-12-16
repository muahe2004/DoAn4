
from sqlalchemy import or_
from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.models import Users
from app.models.schemas.users.user_schemas import UserCreate, UserPublic
from app.core.security import get_password_hash
from app.enums.status import StatusEnum
from app.utils import validate_phone_number

class UserServices:
    @staticmethod
    def register(session: Session, data: UserCreate) -> UserPublic:

        if data.phone_number and not validate_phone_number(data.phone_number):
            raise HTTPException(status_code=400, detail="Invalid phone number")
        
        filters = [Users.email == data.email]
        if data.phone_number:
            filters.append(Users.phone_number == data.phone_number)
        existing_user = session.exec(select(Users).where(or_(*filters))).first()
        if existing_user:
            if existing_user.email == data.email:
                raise HTTPException(status_code=400, detail=f"Email đã tồn tại.")
            if data.phone_number and existing_user.phone_number == data.phone_number:
                raise HTTPException(status_code=400, detail=f"Số điện thoại đã tồn tại.")
            
        new_user = Users(
            name=data.name,
            email=data.email,
            code=data.code,
            password=get_password_hash(data.password),
            phone_number=data.phone_number,
            role=data.role,
            status=StatusEnum.ACTIVE,
            tax_code=data.tax_code,
            representative=data.representative,
            position=data.position,
            address=data.address,
            department=data.department,
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        return UserPublic.model_validate(new_user)

    @staticmethod
    def get_user_by_email_or_phone(*, session: Session, email: str | None, phone_number: str | None) -> Users | None:
        filters = []
        if email:
            filters.append(Users.email == email)
        if phone_number:
            filters.append(Users.phone_number == phone_number)
        if not filters:
            return None

        statement = select(Users).where(or_(*filters))
        return session.exec(statement).first()
