from datetime import datetime
from uuid import UUID

from sqlmodel import SQLModel

from app.models.schemas.common.query import BaseQueryParams


class ProductInventorySettlementQueryParams(BaseQueryParams):
    pass


class ProductInventorySettlementRow(SQLModel):
    product_id: UUID
    product_code: str
    product_name: str
    unit_name: str | None = None
    opening_quantity: float = 0
    production_quantity: float = 0
    export_quantity: float = 0
    closing_quantity: float = 0


class ProductInventorySettlementResponse(SQLModel):
    start_date: datetime
    end_date: datetime
    total: int
    data: list[ProductInventorySettlementRow]