from typing import List
import uuid
from app.models.schemas.materials.compare_material_code_schemas import CompareMaterialCodePublic
from app.models.schemas.common.query import BaseQueryParams
from app.services.compare_material_codes import (
    CompareMaterialCodeServices,
    CompareMaterialCodeCreate,
    MultiCompareMaterialCodeCreate,
    CompareMaterialCodeUpdate,
    CompareMaterialCodeDeleteResponse
)
from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep

router = APIRouter()

# =========================== get compare material codes list ===========================
@router.get("")
def get_compare_material_codes(session: SessionDep, query: BaseQueryParams = Depends()):
    return CompareMaterialCodeServices.get_list(session=session, query=query)

# =========================== create compare material code ===========================
@router.post(
    "",
    response_model=CompareMaterialCodePublic,
)
def create_compare_material_code(
    request: Request, session: SessionDep, data: CompareMaterialCodeCreate
) -> CompareMaterialCodePublic:
    return CompareMaterialCodeServices.create(session=session, code=data)

# =========================== create multi compare material codes ===========================
@router.post(
    "/multi",
    response_model=list[CompareMaterialCodePublic],
)
def create_compare_material_codes_multi(
    request: Request,
    session: SessionDep,
    data: MultiCompareMaterialCodeCreate
) -> list[CompareMaterialCodePublic]:
    return CompareMaterialCodeServices.create_multi(session=session, data=data)

# =========================== update compare material code ===========================
@router.patch(
    "/{id}",
    response_model=CompareMaterialCodePublic,
)
def update_compare_material_code(
    session: SessionDep, id: uuid.UUID, data: CompareMaterialCodeUpdate
) -> CompareMaterialCodePublic:
    return CompareMaterialCodeServices.update(session=session, code_id=id, code_data=data)

# =========================== delete compare material codes ===========================
@router.delete(
    "",
    response_model=List[CompareMaterialCodeDeleteResponse],
)
def delete_multiple_compare_material_codes(
    session: SessionDep, code_ids: List[uuid.UUID]
) -> List[CompareMaterialCodeDeleteResponse]:
    return CompareMaterialCodeServices.delete_many(session=session, code_ids=code_ids)
