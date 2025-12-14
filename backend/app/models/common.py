from pydantic import ConfigDict, EmailStr, model_validator
from sqlmodel import Field, SQLModel

from app.models.schemas.users.user_schemas import UserPublic


class Message(SQLModel):
    message: str


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class UserToken(Token):
    user: UserPublic


class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


class VerifyEmailPayload(SQLModel):
    token: str


class EmailPayload(SQLModel):
    email: EmailStr


class login(SQLModel):
    model_config = ConfigDict(extra="forbid")

    email: EmailStr | None = None
    phone_number: str | None = None
    password: str

    @model_validator(mode="after")
    def validate_identity(self) -> "login":
        if not self.email and not self.phone_number:
            raise ValueError("Either email or phone_number is required")
        return self
