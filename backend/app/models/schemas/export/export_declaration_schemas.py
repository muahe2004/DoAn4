from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, String, Integer, DateTime 
from uuid import UUID

class ExportDeclarationBase(SQLModel):
    # full_name: str = Field(sa_column=Column(String(100), nullable=False))
    # user_name: str = Field(sa_column=Column(String(50), nullable=False, unique=True))
    # phone_number: str = Field(sa_column=Column(String(10), nullable=True))
    # email: str = Field(sa_column=Column(String(50), nullable=False, unique=True))
    # department: str = Field(sa_column=Column(String(50), nullable=True))
    export_declaration_number: str | None = Field(default=None, sa_column=Column(String(50), nullable=False))
    export_licence_number: str = Field(sa_column=Column(String(50), nullable=False))
    # password: str = Field(sa_column=Column(String(100), nullable=False))
    shipping_term: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class  ExportDeclarationPublic(ExportDeclarationBase):
    id: UUID

# Chưa xong