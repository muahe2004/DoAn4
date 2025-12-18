import uuid

from app.models.schemas.products.product_schemas import MultiProductCreate, ProductCreate, ProductDeleteResponse, ProductListResponse, ProductPublic, ProductQueryParams, ProductUpdate
from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.services.products import ProductServices
from typing import List

router = APIRouter()

# =========================== get all products ===========================
@router.get("")
def get_products(session: SessionDep, query: ProductQueryParams = Depends()):
    data, total = ProductServices.get_all(session=session,query=query)
    return ProductListResponse(total=total, data=data)

# =========================== add product ===========================
@router.post(
    "",
    response_model=ProductPublic,
)
def create_product(
    request: Request, session: SessionDep, data: ProductCreate
) -> ProductPublic:
    return ProductServices.create(session=session, product=data)

# =========================== create multi product ===========================
@router.post(
    "/multi",
    response_model=list[ProductPublic],
)
def create_units_multi(
    request: Request,
    session: SessionDep,
    data: MultiProductCreate
) -> list[ProductPublic]:
    return ProductServices.create_multi(session=session, data=data)

# =========================== update product ===========================
@router.patch(
    "/{id}",
    response_model=ProductPublic,
)
def update_product(
    session: SessionDep, id: uuid.UUID, data: ProductUpdate
) -> ProductPublic:
    return ProductServices.update(session=session, product_id=id, product_data=data)

# =========================== delete product ===========================
@router.delete(
    "",
    response_model=List[ProductDeleteResponse],
)
def delete_multiple_product(
    session: SessionDep, product_ids: List[uuid.UUID]
) -> List[ProductDeleteResponse]:
    return ProductServices.delete_many(session=session, product_ids=product_ids)