from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlmodel import SQLModel, Field

from app.models.schemas.common.query import BaseQueryParams


class ExportDeclarationDetailPayload(SQLModel):
    hs_code: str
    product_code: str
    product_name: Optional[str] = None
    origin_country_id: Optional[UUID] = None
    origin_country_name: Optional[str] = None
    origin_country_code: Optional[str] = None
    unit_id: Optional[UUID] = None
    unit_name: Optional[str] = None
    unit_id_2: Optional[UUID] = None
    unit_name_2: Optional[str] = None
    quantity: Optional[float] = None
    quantity2: Optional[float] = None
    unit_price: Optional[float] = None
    unit_price_transport: Optional[float] = None
    invoice_value: Optional[float] = None
    taxable_price: Optional[float] = None
    status: Optional[str] = Field(default="draft")


class ExportDeclarationCreate(SQLModel):
    export_declaration_number: str
    licence_number: Optional[str] = None
    licence_date: Optional[datetime] = None
    bill_number: Optional[str] = None
    importer: Optional[str] = None
    importer_id: Optional[UUID] = None
    usd_exchange_rate: Optional[float] = None
    currency_id: Optional[UUID] = None
    type_declaration: str
    type_inventory: str
    shipping_term: Optional[str] = None
    status: Optional[str] = Field(default="draft")
    details: List[ExportDeclarationDetailPayload]


class ExportDeclarationUpdate(SQLModel):
    export_declaration_number: Optional[str] = None
    licence_number: Optional[str] = None
    licence_date: Optional[datetime] = None
    bill_number: Optional[str] = None
    importer: Optional[str] = None
    importer_id: Optional[UUID] = None
    usd_exchange_rate: Optional[float] = None
    currency_id: Optional[UUID] = None
    type_declaration: Optional[str] = None
    type_inventory: Optional[str] = None
    shipping_term: Optional[str] = None
    status: Optional[str] = None
    details: Optional[List[ExportDeclarationDetailPayload]] = None


class ExportDeclarationDetailResponse(SQLModel):
    id: UUID
    hs_code: str
    product_code: str
    product_name: str
    origin_country_name: Optional[str] = None
    quantity: Optional[float] = None
    quantity2: Optional[float] = None
    unit_price: Optional[float] = None
    unit_price_transport: Optional[float] = None
    invoice_value: Optional[float] = None
    taxable_price: Optional[float] = None
    unit_name: Optional[str] = None
    unit_name_2: Optional[str] = None
    status: Optional[str] = None


class ExportDeclarationHeaderResponse(SQLModel):
    id: UUID
    export_declaration_number: str
    licence_number: Optional[str] = None
    licence_date: Optional[datetime] = None
    bill_number: Optional[str] = None
    importer: Optional[str] = None
    importer_id: Optional[UUID] = None
    usd_exchange_rate: Optional[float] = None
    currency_id: Optional[UUID] = None
    type_declaration: str
    type_inventory: str
    shipping_term: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ExportDeclarationDetailView(SQLModel):
    header: ExportDeclarationHeaderResponse
    details: List[ExportDeclarationDetailResponse]


class ExportDeclarationListItem(SQLModel):
    export_detail_id: UUID
    export_declaration_id: UUID
    export_declaration_number: str
    bill_number: Optional[str] = None
    licence_date: Optional[datetime] = None
    importer: Optional[str] = None
    type_declaration: str
    type_inventory: str
    shipping_term: Optional[str] = None
    status: Optional[str] = None
    usd_exchange_rate: Optional[float] = None
    currency_id: Optional[UUID] = None
    hs_code: str
    product_code: str
    product_name: str
    origin_country_name: Optional[str] = None
    quantity: Optional[float] = None
    quantity2: Optional[float] = None
    unit_price: Optional[float] = None
    unit_price_transport: Optional[float] = None
    invoice_value: Optional[float] = None
    taxable_price: Optional[float] = None
    unit_name: Optional[str] = None
    unit_name_2: Optional[str] = None


class ExportDeclarationListResponse(SQLModel):
    total: int
    data: List[ExportDeclarationListItem]


class ExportDeclarationImportRequest(SQLModel):
    declarations: List[ExportDeclarationCreate]


class ExportDeclarationQueryParams(BaseQueryParams):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    export_declaration_number: Optional[str] = None
    product_code: Optional[str] = None
