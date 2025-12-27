from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, Float, ForeignKey, String, Integer, DateTime 
from uuid import UUID

from app.models.schemas.common.query import BaseQueryParams
from app.models.schemas.imports.import_declaration_details_schemas import ImportDeclarationDetailsResponse

class ImportDeclarationBase(SQLModel):
    import_declaration_number: str | None = Field(default=None, sa_column=Column(String(50), nullable=False))
    licence_number: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    licence_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    bill_number: str = Field(sa_column=Column(String(50), nullable=True))
    exporter: str = Field(sa_column=Column(String(500), nullable=False, unique=False))
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
class ImportDeclarationQueryParams(BaseQueryParams):
    type: Optional[str] = Field(None)
    from_date: Optional[str] = Field(None)
    to_date: Optional[str] = Field(None)
    exporter_id: Optional[UUID] = Field(None)

class ImportDeclarationMaterialCreate(SQLModel):
    material_code: Optional[str] = Field(default=None, max_length=50)
    material_name: Optional[str] = Field(default=None, max_length=255)
    unit_id: Optional[UUID] = Field(default=None, foreign_key="units.id")
    unit_name: Optional[str] = Field(default=None, max_length=50)
    unit_id_2: Optional[UUID] = Field(default=None, foreign_key="units.id")
    unit_name_2: Optional[str] = Field(default=None, max_length=50)
    description: Optional[str] = Field(default=None, max_length=500)
    country_id: Optional[UUID] = Field(default=None, foreign_key="countries.id")
    country_code: Optional[str] = Field(default=None, max_length=10)
    country_name: Optional[str] = Field(default=None, max_length=100)
    quantity: Optional[float] = Field(default=None)
    quantity2: Optional[float] = Field(default=None)
    unit_price: Optional[float] = Field(default=None)
    unit_price_transport: Optional[float] = Field(default=None)
    status: Optional[str] = Field(default="active", max_length=50)

class ImportDeclarationCreate(SQLModel):
    import_declaration_number: str
    licence_number: Optional[str] = None
    licence_date: Optional[datetime] = None
    bill_number: Optional[str] = None
    exporter: str
    exporter_id: UUID
    usd_exchange_rate: Optional[float] = None
    currency_id: Optional[UUID] = None
    type_declaration: str
    type_inventory: str
    shipping_term: Optional[str] = None
    shipping_fee: Optional[float] = None
    status: Optional[str] = None
    materials: List[ImportDeclarationMaterialCreate]

class ImportDeclarationResponse(ImportDeclarationPublic):
    currency_name: str
    details: list[ImportDeclarationDetailsResponse] = Field(default_factory=list)
    # unit_name_2: Optional[str] = Field(None)

class ImportDeclarationListResponse(SQLModel):
    total: int
    data: list[ImportDeclarationResponse]
