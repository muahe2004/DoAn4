from datetime import datetime
from uuid import UUID

from sqlmodel import SQLModel

from app.models.schemas.common.query import BaseQueryParams


class MaterialInventorySettlementQueryParams(BaseQueryParams):
    start_date: datetime | None = None
    end_date: datetime | None = None


class MaterialInventorySettlementRow(SQLModel):
    material_id: UUID
    material_code: str
    material_name: str
    unit_name: str | None = None
    opening_quantity: float = 0
    import_quantity: float = 0
    export_quantity: float = 0
    closing_quantity: float = 0


class MaterialInventorySettlementResponse(SQLModel):
    start_date: datetime
    end_date: datetime
    total: int
    data: list[MaterialInventorySettlementRow]
