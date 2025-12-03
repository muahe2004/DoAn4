from datetime import datetime
from typing import List, Optional
from app.models.schemas.common.query import BaseQueryParams
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, String, DateTime 
from uuid import UUID

class UnitBase(SQLModel):
    unit_name: str = Field(sa_column=Column(String(100), nullable=False))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    type: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class UnitPublic(UnitBase):
    id: UUID

class UnitQueryParams(BaseQueryParams):
    type: Optional[str] = Field(None)

class UnitDropdownResponse(SQLModel):
    id: UUID
    unit_name: str

class UnitCreate(UnitBase):
    pass

class UnitUpdate(SQLModel):
    unit_name: str = Field(sa_column=Column(String(100), nullable=False))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    type: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class UnitDeleteResponse(SQLModel):
    message: str
    id: UUID