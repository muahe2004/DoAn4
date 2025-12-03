from typing import List
import uuid
from app.services.norms import NormServices
from app.models.schemas.common.query import BaseQueryParams
from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.models.schemas.norms.norm_schemas import MultiNormCreate, NormCreate, NormDeleteResponse, NormPublic, NormUpdate

router = APIRouter()

# =========================== dropdown norms ===========================
@router.get("/drop-down")
def dropdown_norm(session: SessionDep, query: BaseQueryParams = Depends()):
    return NormServices.dropdown(session=session, query=query)

# =========================== create norm ===========================
@router.post(
    "",
    response_model=NormPublic,
)
def create_norm(
    request: Request, session: SessionDep, data: NormCreate
) -> NormPublic:
    return NormServices.create(session=session, norm=data)

# =========================== create multi unit ===========================
@router.post(
    "/multi",
    response_model=list[NormPublic],
)
def create_norms_multi(
    request: Request,
    session: SessionDep,
    data: MultiNormCreate
) -> list[NormPublic]:
    return NormServices.create_multi(session=session, data=data)

# =========================== update norm ===========================
@router.patch(
    "/{id}",
    response_model=NormPublic,
)
def update_norm(
    session: SessionDep, id: uuid.UUID, data: NormUpdate
) -> NormPublic:
    return NormServices.update(session=session, norm_id=id, norm_data=data)

# =========================== delete norm ===========================
@router.delete(
    "",
    response_model=List[NormDeleteResponse],
)
def delete_multiple_norm(
    session: SessionDep, norm_ids: List[uuid.UUID]
) -> List[NormDeleteResponse]:
    return NormServices.delete_many(session=session, norm_ids=norm_ids)