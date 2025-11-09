from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, Float, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class ProductStoreBase(SQLModel):
    product_id: UUID = Field(sa_column=Column(ForeignKey("products.id"), nullable=False))
    store_id: UUID = Field(sa_column=Column(ForeignKey("stores.id"), nullable=False))
    quantity_on_hand: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    quantity_on_hand_2: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    reorder_level: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    safety_stock: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class ProductStorePublic(ProductStoreBase):
    id: UUID