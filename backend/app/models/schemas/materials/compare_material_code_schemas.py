from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Boolean, Column, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class CompareProductCodeBase(SQLModel):
    material_id: UUID = Field(sa_column=Column(ForeignKey("materials.id"), nullable=False))
    internal_code: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    external_code: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class CompareProductCodePublic(CompareProductCodeBase):
    id: UUID