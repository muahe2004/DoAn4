from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field as PydanticField
from sqlmodel import Column, DateTime, Field, SQLModel, String


class UserBase(SQLModel):
    name: str = Field(sa_column=Column(String(100), nullable=False))  
    code: str = Field(sa_column=Column(String(50), nullable=False)) 
    phone_number: Optional[str] = Field(sa_column=Column(String(15), nullable=True))
    email: str = Field(sa_column=Column(String(100), nullable=False, unique=True))
    password: str = Field(sa_column=Column(String(200), nullable=False))
    role: str = Field(sa_column=Column(String(50), nullable=False))  

    tax_code: Optional[str] = Field(sa_column=Column(String(50), nullable=True))  
    representative: Optional[str] = Field(sa_column=Column(String(100), nullable=True))  
    position: Optional[str] = Field(sa_column=Column(String(100), nullable=True))  
    address: Optional[str] = Field(sa_column=Column(String(200), nullable=True))  
    department: Optional[str] = Field(sa_column=Column(String(100), nullable=True)) 

    status: Optional[str] = Field(default="Hoạt động", sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))


class UserCreate(BaseModel):
    name: str
    code: str
    phone_number: Optional[str] = None
    email: EmailStr
    password: str = PydanticField(min_length=8)
    role: str

    tax_code: Optional[str] = None
    representative: Optional[str] = None
    position: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = None


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    code: str
    phone_number: Optional[str] = None
    email: EmailStr
    role: str
    status: Optional[str] = None
    tax_code: Optional[str] = None
    representative: Optional[str] = None
    position: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class UserLoginResponse(BaseModel):
    id: UUID
    message: str
    code: str
    status: str
    role: str
