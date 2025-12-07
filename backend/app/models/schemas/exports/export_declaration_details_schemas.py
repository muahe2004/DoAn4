from datetime import datetime
from uuid import UUID
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, String, DateTime, Float, ForeignKey

class ExportDeclarationDetailsBase(SQLModel):
    hs_code: str = Field(sa_column=Column(String(50), nullable=False))
    export_declaration_id: UUID = Field(sa_column=Column(ForeignKey("export_declarations.id"), nullable=False))
    product_id: UUID = Field(sa_column=Column(ForeignKey("products.id"), nullable=False))
    origin_country_id: UUID = Field(sa_column=Column(ForeignKey("countries.id"), nullable=False))
    unit_id: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    unit_id_2: UUID | None = Field(default=None, sa_column=Column(ForeignKey("units.id"), nullable=True))
    quantity: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    quantity2: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    unit_price: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    unit_price_transport: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    invoice_value: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    taxable_price: float | None = Field(default=None, sa_column=Column(Float, nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class ExportDeclarationDetailsPublic(ExportDeclarationDetailsBase):
    id: UUID