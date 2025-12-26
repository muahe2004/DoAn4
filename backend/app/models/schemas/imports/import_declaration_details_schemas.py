from datetime import datetime
from typing import Optional
from uuid import UUID
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String, DateTime, Float, ForeignKey

from app.models.schemas.common.query import BaseQueryParams

class ImportDeclarationDetailsBase(SQLModel):
    hs_code: str = Field(sa_column=Column(String(50), nullable=False))
    import_declaration_id: UUID = Field(sa_column=Column(ForeignKey("import_declarations.id"), nullable=False))
    material_id: UUID = Field(sa_column=Column(ForeignKey("materials.id"), nullable=False))
    origin_country_id: UUID = Field(sa_column=Column(ForeignKey("countries.id"), nullable=False))
    unit_id: UUID | None = Field(default=None, sa_column=Column(ForeignKey("units.id"), nullable=True))
    unit_id_2: UUID | None = Field(default=None, sa_column=Column(ForeignKey("units.id"), nullable=True))
    quantity: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    quantity2: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    unit_price: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    unit_price_transport: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class ImportDeclarationDetailsPublic(ImportDeclarationDetailsBase):
    id: UUID

class ImportDeclarationDetailCreate(ImportDeclarationDetailsBase):
    pass

class ImportDeclarationDetailsQueryParams(BaseQueryParams):
    exporter_id: Optional[UUID] = Field(None)

class ImportDeclarationDetailsResponse(ImportDeclarationDetailsPublic):
    unit_name: Optional[str] = Field(None)
    unit_name_2: Optional[str] = Field(None)
    country_name: Optional[str] = Field(None)
    material_name: Optional[str] = Field(None)
    country_name: Optional[str] = Field(None)
    material_name: Optional[str] = Field(None)

class ImportDeclarationDetailsListResponse(SQLModel):
    total: int
    data: list[ImportDeclarationDetailsResponse]
