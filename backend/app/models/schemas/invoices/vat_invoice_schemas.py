from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, Float, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class VATInvoiceBase(SQLModel):
    description: str = Field(sa_column=Column(String(500), nullable=True))
    invoice_type: str = Field(sa_column=Column(String(50), nullable=False)) 
    partner_id: UUID = Field(sa_column=Column(ForeignKey("partners.id"), nullable=False))
    invoice_number: str = Field(sa_column=Column(String(50), nullable=False)) 
    invoice_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    usd_exchange_rate: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    vat_license_number: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    serial_number: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    file_url: str | None = Field(default=None, sa_column=Column(String(250), nullable=True))
    status: str = Field(sa_column=Column(String(50), nullable=False))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class VATInvoicePublic(VATInvoiceBase):
    id: UUID