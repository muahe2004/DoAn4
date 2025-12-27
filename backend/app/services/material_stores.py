from typing import List
import uuid

from fastapi import HTTPException
from sqlalchemy import func
from app.models.schemas.stores.material_store_schemas import MaterialStorePublic
from app.models.schemas.common.query import BaseQueryParams
from sqlmodel import Session, select, SQLModel, Field
from app.models.models import MaterialStores, Materials, Stores, CompareMaterialCodes
from starlette import status
from app.enums.status import StatusEnum


class MaterialStoreCreate(SQLModel):
    material_id: uuid.UUID
    unit_id: uuid.UUID | None = None
    store_id: uuid.UUID
    quantity_on_hand: float | None = None
    reorder_level: float | None = None
    safety_stock: float | None = None
    status: str | None = None


class MultiMaterialStoreCreate(SQLModel):
    material_stores: list[MaterialStoreCreate]


class MaterialStoreUpdate(SQLModel):
    quantity_on_hand: float | None = None
    reorder_level: float | None = None
    safety_stock: float | None = None
    status: str | None = None


class MaterialStoreDeleteResponse(SQLModel):
    message: str
    id: uuid.UUID


class MaterialStoreServices:
    @staticmethod
    def get_list(*, session: Session, query: BaseQueryParams):
        # Count total items
        count_statement = select(func.count(MaterialStores.id))
        conditions = []
        
        if query.status:
            conditions.append(MaterialStores.status == query.status)
        if query.search:
            conditions.append(
                (Materials.material_code.ilike(f"%{query.search}%")) |
                (Materials.material_name.ilike(f"%{query.search}%"))
            )

        # Join for count
        count_statement = count_statement.join(Materials, Materials.id == MaterialStores.material_id)
        if conditions:
            count_statement = count_statement.where(*conditions)
        
        total = session.exec(count_statement).one()

        # Get data with JOIN
        statement = (
            select(
                MaterialStores,
                Materials.material_code,
                Materials.material_name,
                Materials.unit_id,
                Stores.store_name,
                CompareMaterialCodes.internal_code,
                CompareMaterialCodes.external_code
            )
            .join(Materials, Materials.id == MaterialStores.material_id)
            .join(Stores, Stores.id == MaterialStores.store_id)
            .outerjoin(CompareMaterialCodes, CompareMaterialCodes.material_id == Materials.id)
        )
        
        if conditions:
            statement = statement.where(*conditions)

        statement = (
            statement.order_by(MaterialStores.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        results = session.exec(statement).all()
        
        # Map results
        data = []
        for row in results:
            store = row[0]
            store_dict = store.model_dump()
            store_dict['material_code'] = row[1]
            store_dict['material_name'] = row[2]
            store_dict['unit_id'] = row[3]
            store_dict['store_name'] = row[4]
            store_dict['internal_code'] = row[5]
            store_dict['external_code'] = row[6]
            
            # Get unit_name if unit_id exists
            if row[3]:
                from app.models.models import Units
                unit = session.get(Units, row[3])
                store_dict['unit_name'] = unit.unit_name if unit else None
            else:
                store_dict['unit_name'] = None
            
            data.append(store_dict)
        
        return {
            "data": data,
            "total": total
        }
    
    @staticmethod
    def create(
        *,
        session: Session,
        store: MaterialStoreCreate,
    ) -> MaterialStorePublic:
        # Check if material exists
        material = session.get(Materials, store.material_id)
        if not material:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Material not found"
            )

        # Check if store exists
        store_obj = session.get(Stores, store.store_id)
        if not store_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )

        # Check if already exists
        existing = session.exec(
            select(MaterialStores).where(
                MaterialStores.material_id == store.material_id,
                MaterialStores.store_id == store.store_id
            )
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Material store already exists.",
            )

        new_store = MaterialStores(**store.model_dump(exclude={'unit_id'}))
        session.add(new_store)
        session.commit()
        session.refresh(new_store)

        return MaterialStorePublic.model_validate(new_store)
    
    @staticmethod
    def create_multi(
        *,
        session: Session,
        data: MultiMaterialStoreCreate
    ) -> list[MaterialStorePublic]:
        to_create = []
        
        for store in data.material_stores:
            # Check if material and store exist
            material = session.get(Materials, store.material_id)
            store_obj = session.get(Stores, store.store_id)
            
            if not material or not store_obj:
                continue
            
            # Check if already exists
            existing = session.exec(
                select(MaterialStores).where(
                    MaterialStores.material_id == store.material_id,
                    MaterialStores.store_id == store.store_id
                )
            ).first()
            
            if not existing:
                to_create.append(
                    MaterialStores(
                        material_id=store.material_id,
                        store_id=store.store_id,
                        quantity_on_hand=store.quantity_on_hand,
                        reorder_level=store.reorder_level,
                        safety_stock=store.safety_stock,
                        status=store.status or StatusEnum.ACTIVE
                    )
                )

        if not to_create:
            raise HTTPException(
                status_code=400,
                detail="All stores already exist or materials/stores not found."
            )

        session.add_all(to_create)
        session.commit()

        for item in to_create:
            session.refresh(item)

        return [MaterialStorePublic.model_validate(s) for s in to_create]
    
    @staticmethod
    def update(
        *,
        session: Session,
        store_id: uuid.UUID,
        store_data: MaterialStoreUpdate,
    ) -> MaterialStorePublic:
        store = session.get(MaterialStores, store_id)
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Material store not found"
            )

        update_data = store_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(store, field, value)

        session.commit()
        return MaterialStorePublic.model_validate(store)

    @staticmethod
    def delete_many(
        *,
        session: Session,
        store_ids: List[uuid.UUID]
    ) -> List[MaterialStoreDeleteResponse]:
        results = []

        try:
            for store_id in store_ids:
                store = session.get(MaterialStores, store_id)

                if not store:
                    results.append(
                        MaterialStoreDeleteResponse(id=str(store_id), message="Store not found")
                    )
                    continue

                if store.status == StatusEnum.ACTIVE:
                    store.status = StatusEnum.INACTIVE
                    message = "Store set to inactive"
                else:
                    message = "Store already inactive"

                results.append(MaterialStoreDeleteResponse(id=str(store_id), message=message))

            session.commit()

        except Exception as e:
            session.rollback()
            raise e

        return results
