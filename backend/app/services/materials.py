import uuid
from datetime import datetime
import json
from app.models.schemas.products.product_schemas import ProductCreate, ProductDeleteResponse, ProductListResponse, ProductPublic, ProductQueryParams, ProductResponse, ProductUpdate
from app.enums.status import StatusEnum
from app.models.schemas.materials.material_schemas import MaterialDeleteResponse, MaterialListResponse, MaterialPublic, MaterialQueryParams, MaterialUpdate
from fastapi import HTTPException, Request
from sqlalchemy import or_
from sqlmodel import Session, select, func
from starlette import status
from typing import List, Optional, Tuple
from sqlalchemy.orm import aliased

from app.models.models import Countries, Materials, Norms, Products, Units

class MaterialServices:
    @staticmethod
    def dropdown(*, session: Session, query) -> list:
        statement = select(Materials.id, Materials.material_name)
        
        conditions = []
        
        if hasattr(query, 'status') and query.status:
            conditions.append(Materials.status == query.status)
        else:
            conditions.append(Materials.status == StatusEnum.ACTIVE)
            
        if hasattr(query, 'search') and query.search:
            conditions.append(Materials.material_name.ilike(f"%{query.search}%"))
        
        if conditions:
            statement = statement.where(*conditions)
        
        statement = (
            statement.order_by(Materials.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )
        
        raw_results = session.exec(statement).all()
        
        return [
            {"id": str(row[0]), "material_name": row[1]}
            for row in raw_results
        ]

    @staticmethod
    def get_all(*, session: Session, query: MaterialQueryParams) -> MaterialListResponse:
        statement = (
            select(
                Materials.id,
                Materials.material_code,
                Materials.material_name,
                Materials.description,
                Materials.unit_id,
                Materials.country_id,
                Materials.status,
                Materials.created_at,
                Materials.updated_at,
                Units.unit_name,
                Countries.country_name
            )
            .join(Units, Units.id == Materials.unit_id)
            .join(Countries, Countries.id == Materials.country_id)
        )

        conditions = []
        if query.status:
            conditions.append(Materials.status == query.status)
        if query.country_id:
            conditions.append(Materials.country_id == query.country_id)
        if query.unit_id:
            conditions.append(Materials.unit_id == query.unit_id)
        if query.search:
            conditions.append(
                or_(
                    Materials.material_code.ilike(f"%{query.search}%"),
                    Materials.material_name.ilike(f"%{query.search}%"),
                )
            )
        
        if conditions:
            statement = statement.where(*conditions)

        count_stmt = select(func.count()).select_from(Materials)
        if conditions:
            count_stmt = count_stmt.where(*conditions)

        total = session.exec(count_stmt).one()

        statement = (
            statement.order_by(Materials.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        results = session.exec(statement).all()

        return results, total

    @staticmethod
    def create(
        *,
        session: Session,
        material: Materials,
    ) -> MaterialPublic:
        existing = session.exec(
            select(Materials).where(Materials.material_code == material.material_code)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Material {material.material_code} already exists.",
            )
        new_material = Materials(**material.dict())
        session.add(new_material)
        session.commit()
        session.refresh(new_material)

        return MaterialPublic.model_validate(new_material)

    @staticmethod
    def update(
        *,
        session: Session,
        material_id: uuid.UUID,
        material_data: MaterialUpdate,
    ) -> MaterialPublic:
        material = session.get(Materials, material_id)
        if not material:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Material not found"
            )

        update_data = material_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(material, field, value)

        session.commit()
        return MaterialPublic.model_validate(material)

    @staticmethod
    def delete_many(
        *,
        session: Session,
        material_ids: List[uuid.UUID]
    ) -> List[MaterialDeleteResponse]:
        results = []

        try:
            for material_id in material_ids:
                material = session.get(Materials, material_id)

                if not material:
                    results.append(
                        MaterialDeleteResponse(id=str(material_id), message="Material not found")
                    )
                    continue

                if material.status == StatusEnum.ACTIVE:
                    material.status = StatusEnum.INACTIVE
                    message = "Material set to inactive"
                else:
                    message = "Material already inactive"

                results.append(MaterialDeleteResponse(id=str(material_id), message=message))

            session.commit()

        except Exception as e:
            session.rollback()
            raise e

        return results