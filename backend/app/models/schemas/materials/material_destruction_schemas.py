from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, Float, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class MaterialDestructionBase(SQLModel):
    material_id: UUID = Field(sa_column=Column(ForeignKey("materials.id"), nullable=False))
    unit_id: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    unit_id_2: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    quantity: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    quantity_2: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    value: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    reason: str = Field(sa_column=Column(String(500), nullable=True))
    destruction_date: datetime = Field(sa_column=Column(DateTime, nullable=False))
    licence_number: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class MaterialDestructionPublic(MaterialDestructionBase):
    id: UUID