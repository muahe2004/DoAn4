from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, Float, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class ConvertSemiProductBase(SQLModel):
    material_id: UUID = Field(sa_column=Column(ForeignKey("materials.id"), nullable=False))
    semi_product_id: UUID = Field(sa_column=Column(ForeignKey("semi_products.id"), nullable=False))
    conversion: float | None = Field(default=None, sa_column=Column(Float, nullable=False))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class ConvertSemiProductPublic(ConvertSemiProductBase):
    id: UUID