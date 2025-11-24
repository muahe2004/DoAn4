from datetime import datetime
from typing import Optional
from uuid import UUID
from sqlmodel import SQLModel, Field, Column, String, DateTime

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

    status: Optional[str] = Field(sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class UserPublic(UserBase):
    id: UUID