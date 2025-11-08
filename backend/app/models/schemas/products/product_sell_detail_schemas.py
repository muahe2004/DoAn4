from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, Float, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class ProductSellDetailBase(SQLModel):
    product_code: str = Field(sa_column=Column(String(50), nullable=False))
    product_name: str = Field(sa_column=Column(String(500), nullable=False))
    product_id: UUID = Field(sa_column=Column(ForeignKey("products.id"), nullable=False))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    invoice_id: UUID = Field(sa_column=Column(ForeignKey("invoices.id"), nullable=False))
    invoice_number: str = Field(sa_column=Column(String(50), nullable=False)) 
    invoice_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    accounting_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    document_number: str = Field(sa_column=Column(String(50), nullable=False)) 
    document_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    export_declaration_id: UUID = Field(sa_column=Column(ForeignKey("export_declarations.id"), nullable=False))
    export_declaration_number: str | None = Field(default=None, sa_column=Column(String(50), nullable=False))
    partner_id: UUID = Field(sa_column=Column(ForeignKey("partners.id"), nullable=False))
    debit_account: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    credit_account: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    vat_value: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    discount: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    transport_value: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    storee_fee: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    customs_fee: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    price: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    exchange_rate: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    unit_id: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    unit_id_2: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    quantity: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    quantity_2: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    sales_revenue: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    sales_revenue_2: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    return_quantity: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    return_value: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class ProductSellDetailPublic(ProductSellDetailBase):
    id: UUID