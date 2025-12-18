from sqlmodel import Session

from app.core.security import verify_password
from app.models.models import Users
from app.services.users import UserServices

class LoginServices:
    @staticmethod
    def authenticate(
        *, session: Session, email: str | None = None, phone_number: str | None = None, password: str
    ) -> Users | None:
        db_user = UserServices.get_user_by_email_or_phone(session=session, email=email, phone_number=phone_number)
        if not db_user:
            return None
        if not verify_password(password, db_user.password):
            return None
        return db_user

