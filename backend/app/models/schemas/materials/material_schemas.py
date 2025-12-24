from datetime import datetime
from typing import List, Optional
from app.models.schemas.common.query import BaseQueryParams
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class MaterialBase(SQLModel):
    material_code: str = Field(sa_column=Column(String(50), nullable=False))
    material_name: str = Field(sa_column=Column(String(500), nullable=False))
    unit_id: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    country_id: Optional[UUID] | None = Field(default=None, foreign_key="countries.id")
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class MaterialPublic(MaterialBase):
    id: UUID

class MaterialQueryParams(BaseQueryParams):
    unit_id: Optional[UUID] = Field(None)
    country_id: Optional[UUID] = Field(None)

class MaterialResponse(MaterialPublic):
    unit_name: str
    country_name: str | None = None

class MaterialListResponse(SQLModel):
    total: int
    data: list[MaterialResponse]

class MaterialCreate(MaterialBase):
    pass

class MaterialUpdate(SQLModel):
    material_code: Optional[str] = Field(sa_column=Column(String(50), nullable=False))
    material_name: Optional[str] = Field(sa_column=Column(String(500), nullable=False))
    unit_id: Optional[UUID] = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    description: Optional[str] = Field(sa_column=Column(String(500), nullable=True))
    country_id: Optional[UUID] | None = Field(default=None, foreign_key="countries.id")
    status: Optional[str] | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class MaterialDeleteResponse(SQLModel):
    message: str
    id: UUID
