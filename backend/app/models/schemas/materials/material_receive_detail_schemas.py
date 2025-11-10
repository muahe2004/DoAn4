from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, Float, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class MaterialReceiveDetailBase(SQLModel):
    material_code: str = Field(sa_column=Column(String(50), nullable=False))
    material_name: str = Field(sa_column=Column(String(500), nullable=False))
    material_id: UUID = Field(sa_column=Column(ForeignKey("materials.id"), nullable=False))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    invoice_id: UUID = Field(sa_column=Column(ForeignKey("invoices.id"), nullable=False))
    invoice_number: str = Field(sa_column=Column(String(50), nullable=False)) 
    invoice_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    accounting_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    document_number: str = Field(sa_column=Column(String(50), nullable=False)) 
    document_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    licence_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    licence_number: str = Field(sa_column=Column(String(50), nullable=False)) 
    import_declaration_id: UUID = Field(sa_column=Column(ForeignKey("import_declarations.id"), nullable=False))
    import_declaration_number: str | None = Field(default=None, sa_column=Column(String(50), nullable=False))
    partner_id: UUID = Field(sa_column=Column(ForeignKey("partners.id"), nullable=False))
    debit_account: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    credit_account: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    vat_value: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    import_tax_value: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    discount: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    transport_value: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    storee_fee: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    customs_fee: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    unit_price: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    exchange_rate: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    unit_id: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    unit_id_2: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    quantity: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    quantity_2: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class MaterialReceiveDetailPublic(MaterialReceiveDetailBase):
    id: UUID