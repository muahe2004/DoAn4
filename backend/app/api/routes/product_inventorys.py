from typing import List
import uuid

from fastapi import APIRouter, Depends
from app.api.deps import SessionDep
from app.services.product_inventorys import (
    ProductInventoryServices,
    ProductInventoryPublic,
    ProductInventoryQueryParams,
    ProductInventorysResponse,
    ProductInventoryCreate,
    ProductInventoryUpdate,
    ProductInventoryDeleteResponse,
    ProductInventorySummary
)

router = APIRouter()

@router.get("", response_model=ProductInventorysResponse)
def get_product_inventorys(
    session: SessionDep, 
    query: ProductInventoryQueryParams = Depends()
):
    data, total = ProductInventoryServices.get_all_with_joins(
        session=session, 
        query=query
    )
    
    return ProductInventorysResponse(
        data=data,
        total=total,
        page=(query.skip // query.limit) + 1,
        limit=query.limit
    )

@router.post("", response_model=ProductInventoryPublic)
def create_product_inventory(
    session: SessionDep,
    create_data: ProductInventoryCreate
):
    return ProductInventoryServices.create(
        session=session,
        create_data=create_data.model_dump()
    )

@router.get("/{id}", response_model=ProductInventoryPublic)
def get_product_inventory_by_id(
    session: SessionDep, 
    id: uuid.UUID
) -> ProductInventoryPublic:
    return ProductInventoryServices.get_by_id(session=session, id=id)

@router.put("/{id}", response_model=ProductInventoryPublic)
def update_product_inventory(
    session: SessionDep,
    id: uuid.UUID,
    update_data: ProductInventoryUpdate
):
    return ProductInventoryServices.update(
        session=session,
        id=id,
        update_data=update_data
    )

@router.delete("/{id}", response_model=ProductInventoryDeleteResponse)
def delete_product_inventory(
    session: SessionDep,
    id: uuid.UUID
):
    return ProductInventoryServices.delete(session=session, id=id)

@router.get("/summary", response_model=ProductInventorySummary)
def get_product_inventory_summary(session: SessionDep):
    return ProductInventoryServices.get_summary(session=session)