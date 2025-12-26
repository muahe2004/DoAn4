from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.api.deps import get_db
from app.models.schemas.reports.material_inventory_report_schemas import (
    MaterialInventorySettlementQueryParams,
    MaterialInventorySettlementResponse,
)
from app.services.material_inventory_report import MaterialInventoryReportServices

router = APIRouter()


@router.get(
    "/material-inventory",
    response_model=MaterialInventorySettlementResponse,
)
def get_material_inventory_report(
    query: MaterialInventorySettlementQueryParams = Depends(),
    session: Session = Depends(get_db),
) -> MaterialInventorySettlementResponse:
    return MaterialInventoryReportServices.get_material_inventory_report(
        session, query
    )
