from typing import List
import uuid
from app.models.schemas.stores.material_store_schemas import MaterialStorePublic
from app.models.schemas.common.query import BaseQueryParams
from app.services.material_stores import (
    MaterialStoreServices,
    MaterialStoreCreate,
    MultiMaterialStoreCreate,
    MaterialStoreUpdate,
    MaterialStoreDeleteResponse
)
from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep

router = APIRouter()

# =========================== get material stores list ===========================
@router.get("")
def get_material_stores(session: SessionDep, query: BaseQueryParams = Depends()):
    return MaterialStoreServices.get_list(session=session, query=query)

# =========================== create material store ===========================
@router.post(
    "",
    response_model=MaterialStorePublic,
)
def create_material_store(
    request: Request, session: SessionDep, data: MaterialStoreCreate
) -> MaterialStorePublic:
    return MaterialStoreServices.create(session=session, store=data)

# =========================== create multi material stores ===========================
@router.post(
    "/multi",
    response_model=list[MaterialStorePublic],
)
def create_material_stores_multi(
    request: Request,
    session: SessionDep,
    data: MultiMaterialStoreCreate
) -> list[MaterialStorePublic]:
    return MaterialStoreServices.create_multi(session=session, data=data)

# =========================== update material store ===========================
@router.patch(
    "/{id}",
    response_model=MaterialStorePublic,
)
def update_material_store(
    session: SessionDep, id: uuid.UUID, data: MaterialStoreUpdate
) -> MaterialStorePublic:
    return MaterialStoreServices.update(session=session, store_id=id, store_data=data)

# =========================== delete material stores ===========================
@router.delete(
    "",
    response_model=List[MaterialStoreDeleteResponse],
)
def delete_multiple_material_stores(
    session: SessionDep, store_ids: List[uuid.UUID]
) -> List[MaterialStoreDeleteResponse]:
    return MaterialStoreServices.delete_many(session=session, store_ids=store_ids)
