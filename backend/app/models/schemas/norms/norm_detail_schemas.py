from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Boolean, Column, Float, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class NormDetailBase(SQLModel):
    unit_id: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    norm_id: UUID = Field(sa_column=Column(ForeignKey("norms.id"), nullable=False))
    material_id: UUID = Field(sa_column=Column(ForeignKey("materials.id"), nullable=False))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    norm_value: float = Field(sa_column=Column(Float, nullable=False))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class NormDetailPublic(NormDetailBase):
    id: UUID

class NormDetailCreate(SQLModel):
    unit_id: UUID
    material_id: UUID
    description: Optional[str] = None
    norm_value: float
    status: Optional[str] = None

class NormDetailUpdate(SQLModel):
    unit_id: UUID | None = None
    material_id: UUID | None = None
    description: str | None = None
    norm_value: float | None = None
    status: str | None = None