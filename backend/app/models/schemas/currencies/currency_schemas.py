from datetime import datetime
from app.models.schemas.common.query import BaseQueryParams
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, String, DateTime 
from uuid import UUID

class CurrencyBase(SQLModel):
    currency_name: str = Field(sa_column=Column(String(100), nullable=False))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class CurrencyPublic(CurrencyBase):
    id: UUID

class CurrencyQueryParams(BaseQueryParams):
    pass

class CurrencyDropdownResponse(SQLModel):
    id: UUID
    currency_name: str
