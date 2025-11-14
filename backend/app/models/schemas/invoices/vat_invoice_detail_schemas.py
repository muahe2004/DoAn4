from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, Float, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class VATInvoiceDetailBase(SQLModel):
    material_id: UUID | None = Field(default=None, foreign_key="materials.id", nullable=True)
    material_name: str = Field(sa_column=Column(String(500), nullable=False))
    product_id: UUID | None = Field(default=None, foreign_key="products.id", nullable=True)
    product_name: str = Field(sa_column=Column(String(500), nullable=False))
    unit_id: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    unit_id_2: UUID | None = Field(sa_column=Column(ForeignKey("units.id"), nullable=True))
    quantity: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    quantity_2: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    price: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    invoice_id: UUID = Field(sa_column=Column(ForeignKey("invoices.id"), nullable=False))
    status: str | None = Field(sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class VATInvoiceDetailPublic(VATInvoiceDetailBase):
    id: UUID