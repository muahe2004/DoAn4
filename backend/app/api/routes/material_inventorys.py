from typing import List
import uuid

from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from app.api.deps import SessionDep
from app.services.material_inventorys import (
    MaterialInventoryServices,
    MaterialInventoryPublic,
    MaterialInventoryQueryParams,
    MaterialInventorysResponse,
    MaterialInventoryCreate,
    MaterialInventoryUpdate,
    MaterialInventoryDeleteResponse
)

router = APIRouter()

@router.get("", response_model=MaterialInventorysResponse)
def get_material_inventorys(
    session: SessionDep, 
    query: MaterialInventoryQueryParams = Depends()
):
    """
    Lấy danh sách tồn kho nguyên vật liệu với thông tin JOIN từ nhiều bảng
    Hiển thị: STT, Mã nội bộ, Mã hải quan, Tên nguyên vật liệu, Đơn vị tính, Số lượng, Giá trị, Kho, Trạng thái
    """
    data, total = MaterialInventoryServices.get_all_with_joins(
        session=session, 
        query=query
    )
    
    return MaterialInventorysResponse(
        data=data,
        total=total,
        page=(query.skip // query.limit) + 1,
        limit=query.limit
    )

@router.get("/{id}", response_model=MaterialInventoryPublic)
def get_material_inventory_by_id(
    session: SessionDep, 
    id: uuid.UUID
) -> MaterialInventoryPublic:
    """
    Lấy chi tiết một tồn kho nguyên vật liệu theo ID
    """
    return MaterialInventoryServices.get_by_id(session=session, id=id)

@router.post("", response_model=MaterialInventoryPublic)
def create_material_inventory(
    session: SessionDep,
    material_inventory: MaterialInventoryCreate
) -> MaterialInventoryPublic:
    """
    Tạo mới tồn kho nguyên vật liệu
    """
    return MaterialInventoryServices.create(
        session=session, 
        material_inventory=material_inventory
    )

@router.put("/{id}", response_model=MaterialInventoryPublic)
def update_material_inventory(
    session: SessionDep,
    id: uuid.UUID,
    material_inventory: MaterialInventoryUpdate
) -> MaterialInventoryPublic:
    """
    Cập nhật tồn kho nguyên vật liệu
    """
    return MaterialInventoryServices.update(
        session=session, 
        id=id, 
        material_inventory=material_inventory
    )

@router.delete("/{id}", response_model=MaterialInventoryDeleteResponse)
def delete_material_inventory(
    session: SessionDep,
    id: uuid.UUID
) -> MaterialInventoryDeleteResponse:
    """
    Xóa tồn kho nguyên vật liệu
    """
    return MaterialInventoryServices.delete(session=session, id=id)

@router.get("/health")
def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "module": "material-inventorys",
        "version": "1.0.0"
    }

@router.post("/seed-test-data")
def seed_test_data(session: SessionDep):
    """
    Tạo dữ liệu test cho material_stores từ materials và stores có sẵn
    """
    from app.models.models import Materials, Stores, MaterialStores
    from datetime import datetime
    
    # Get materials and stores
    materials = session.exec(select(Materials).limit(5)).all()
    stores = session.exec(select(Stores).limit(3)).all()
    
    if not materials:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No materials found in database"
        )
        
    if not stores:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No stores found in database"
        )
    
    created_count = 0
    
    for i, material in enumerate(materials):
        for j, store in enumerate(stores):
            # Check if combination already exists
            existing = session.exec(
                select(MaterialStores).where(
                    MaterialStores.material_id == material.id,
                    MaterialStores.store_id == store.id
                )
            ).first()
            
            if not existing:
                material_store = MaterialStores(
                    material_id=material.id,
                    store_id=store.id,
                    quantity_on_hand=float(100 + (i * 50) + (j * 25)),
                    reorder_level=50.0,
                    safety_stock=25.0,
                    status="ACTIVE",
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                session.add(material_store)
                created_count += 1
    
    session.commit()
    
    return {
        "message": f"Created {created_count} material inventory records",
        "materials_count": len(materials),
        "stores_count": len(stores),
        "created_records": created_count
    }