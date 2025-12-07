from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, Float, String, Integer, DateTime 
from uuid import UUID

class ImportDeclarationBase(SQLModel):
    import_declaration_number: str | None = Field(default=None, sa_column=Column(String(50), nullable=False))
    licence_number: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    licence_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    bill_number: str = Field(sa_column=Column(String(50), nullable=True))
    exporter: str = Field(sa_column=Column(String(500), nullable=False, unique=True))
    exporter_id: Optional[UUID] | None = Field(default=None, foreign_key="partners.id", nullable=False)
    usd_exchange_rate: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    currency_id: Optional[UUID] | None = Field(default=None, foreign_key="currencies.id", nullable=True)
    type_declaration: str = Field(sa_column=Column(String(100), nullable=False))
    type_inventory: str = Field(sa_column=Column(String(100), nullable=False))
    shipping_term: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    shipping_fee: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class  ImportDeclarationPublic(ImportDeclarationBase):
    id: UUID