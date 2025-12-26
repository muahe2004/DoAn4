from datetime import datetime
from typing import List, Optional
from app.models.schemas.common.query import BaseQueryParams
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class PartnerBase(SQLModel):
    partner_code: str = Field(sa_column=Column(String(10), nullable=False))
    partner_name: str = Field(sa_column=Column(String(100), nullable=False))
    phone_number: str = Field(sa_column=Column(String(10), nullable=True))
    email: str = Field(sa_column=Column(String(50), nullable=False, unique=True))
    description: str = Field(sa_column=Column(String(500), nullable=False))
    country_id: UUID = Field(sa_column=Column(ForeignKey("countries.id"), nullable=False))
    partner_type: str = Field(sa_column=Column(String(50), nullable=False))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class  PartnerPublic(PartnerBase):
    id: UUID

class PartnerQueryParams(BaseQueryParams):
    pass

class PartnerDropdownResponse(SQLModel):
    id: UUID
    partner_name: str
