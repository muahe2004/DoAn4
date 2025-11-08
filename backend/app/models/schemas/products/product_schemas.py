from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Boolean, Column, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class ProductBase(SQLModel):
    product_code: str = Field(sa_column=Column(String(50), nullable=False))
    product_name: str = Field(sa_column=Column(String(100), nullable=False))
    unit_id: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    unit_id_2: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    norm_id: UUID = Field(sa_column=Column(ForeignKey("norms.id"), nullable=False))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    is_semi_product: bool = Field(default=True, sa_column=Column(Boolean, nullable=False))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class ProductPublic(ProductBase):
    id: UUID