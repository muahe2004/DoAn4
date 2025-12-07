from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, Float, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class MaterialSemiProductBase(SQLModel):
    material_id: UUID = Field(sa_column=Column(ForeignKey("materials.id"), nullable=False))
    partner_id: UUID = Field(sa_column=Column(ForeignKey("partners.id"), nullable=False))
    contract_id: UUID= Field(sa_column=Column(ForeignKey("contracts.id"), nullable=False))
    quantity_end: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    quantity_end_2: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    checked_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class MaterialSemiProductPublic(MaterialSemiProductBase):
    id: UUID