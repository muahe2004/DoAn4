from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.api.deps import get_db
from app.models.schemas.reports.material_inventory_report_schemas import (
    MaterialInventorySettlementQueryParams,
    MaterialInventorySettlementResponse,
)
from app.models.schemas.reports.product_inventory_report_schemas import (
    ProductInventorySettlementQueryParams,
    ProductInventorySettlementResponse,
)
from app.services.material_inventory_report import MaterialInventoryReportServices
from app.services.product_inventory_report import ProductInventoryReportServices

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


@router.get(
    "/product-inventory",
    response_model=ProductInventorySettlementResponse,
)
def get_product_inventory_report(
    query: ProductInventorySettlementQueryParams = Depends(),
    session: Session = Depends(get_db),
) -> ProductInventorySettlementResponse:
    return ProductInventoryReportServices.get_product_inventory_report(
        session, query
    )
