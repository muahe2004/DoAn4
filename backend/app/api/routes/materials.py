import uuid

from app.models.schemas.products.product_schemas import ProductCreate, ProductDeleteResponse, ProductListResponse, ProductPublic, ProductQueryParams, ProductUpdate
from app.models.schemas.materials.material_schemas import MaterialCreate, MaterialDeleteResponse, MaterialListResponse, MaterialPublic, MaterialQueryParams, MaterialUpdate
from app.services.materials import MaterialServices
from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.services.products import ProductServices
from typing import List

router = APIRouter()

# =========================== get all materials ===========================
@router.get("")
def get_materials(session: SessionDep, query: MaterialQueryParams = Depends()):
    data, total = MaterialServices.get_all(session=session,query=query)
    return MaterialListResponse(total=total, data=data)

# =========================== add material ===========================
@router.post(
    "",
    response_model=MaterialPublic,
)
def create_material(
    request: Request, session: SessionDep, data: MaterialCreate
) -> MaterialPublic:
    return MaterialServices.create(session=session, material=data)

# =========================== update material ===========================
@router.patch(
    "/{id}",
    response_model=MaterialPublic,
)
def update_material(
    session: SessionDep, id: uuid.UUID, data: MaterialUpdate
) -> MaterialPublic:
    return MaterialServices.update(session=session, material_id=id, material_data=data)

# =========================== delete material ===========================
@router.delete(
    "",
    response_model=List[MaterialDeleteResponse],
)
def delete_multiple_material(
    session: SessionDep, material_ids: List[uuid.UUID]
) -> List[MaterialDeleteResponse]:
    return MaterialServices.delete_many(session=session, material_ids=material_ids)