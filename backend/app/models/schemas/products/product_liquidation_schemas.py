from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Boolean, Column, Float, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class ProductLiquidationBase(SQLModel):
    product_id: UUID = Field(sa_column=Column(ForeignKey("products.id"), nullable=False))
    product_name: str = Field(sa_column=Column(String(100), nullable=False))
    liquidation_date: datetime = Field(sa_column=Column(DateTime, nullable=False))
    quantity_on_hand: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    quantity_on_hand_2: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    value: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    reason: str = Field(sa_column=Column(String(500), nullable=True))
    licence_number: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    licence_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class ProductLiquidationPublic(ProductLiquidationBase):
    id: UUID