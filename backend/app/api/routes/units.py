from typing import List
import uuid
from app.models.schemas.units.unit_schemas import MultiUnitCreate, UnitCreate, UnitDeleteResponse, UnitPublic, UnitQueryParams, UnitUpdate
from app.services.units import UnitServices
from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep

router = APIRouter()

# =========================== get units list ===========================
@router.get("")
def get_units(session: SessionDep, query: UnitQueryParams = Depends()):
    return UnitServices.get_list(session=session, query=query)

# =========================== dropdown units ===========================
@router.get("/drop-down")
def dropdown_unit(session: SessionDep, query: UnitQueryParams = Depends()):
    return UnitServices.dropdown(session=session, query=query)

# =========================== create unit ===========================
@router.post(
    "",
    response_model=UnitPublic,
)
def create_unit(
    request: Request, session: SessionDep, data: UnitCreate
) -> UnitPublic:
    return UnitServices.create(session=session, unit=data)

# =========================== create multi unit ===========================
@router.post(
    "/multi",
    response_model=list[UnitPublic],
)
def create_units_multi(
    request: Request,
    session: SessionDep,
    data: MultiUnitCreate
) -> list[UnitPublic]:
    return UnitServices.create_multi(session=session, data=data)

# =========================== update unit ===========================
@router.patch(
    "/{id}",
    response_model=UnitPublic,
)
def update_unit(
    session: SessionDep, id: uuid.UUID, data: UnitUpdate
) -> UnitPublic:
    return UnitServices.update(session=session, unit_id=id, unit_data=data)

# =========================== delete unit ===========================
@router.delete(
    "/{id}",
    response_model=UnitDeleteResponse,
)
def delete_unit(
    session: SessionDep, id: uuid.UUID
) -> UnitDeleteResponse:
    return UnitServices.delete(session=session, unit_id=id)

@router.delete(
    "",
    response_model=List[UnitDeleteResponse],
)
def delete_multiple_unit(
    session: SessionDep, unit_ids: List[uuid.UUID]
) -> List[UnitDeleteResponse]:
    return UnitServices.delete_many(session=session, unit_ids=unit_ids)