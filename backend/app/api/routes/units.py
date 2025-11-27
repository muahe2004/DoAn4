from app.models.schemas.units.unit_schemas import UnitQueryParams
from app.services.units import UnitServices
from fastapi import APIRouter, Depends
from app.api.deps import SessionDep

router = APIRouter()

# =========================== dropdown units ===========================
@router.get("/drop-down")
def dropdown_unit(session: SessionDep, query: UnitQueryParams = Depends()):
    return UnitServices.dropdown(session=session, query=query)