from typing import List
import uuid

from fastapi import HTTPException
from sqlalchemy import func
from app.models.schemas.materials.compare_material_code_schemas import CompareMaterialCodePublic
from app.models.schemas.common.query import BaseQueryParams
from sqlmodel import Session, select, SQLModel, Field
from app.models.models import CompareMaterialCodes, Materials
from starlette import status
from app.enums.status import StatusEnum


class CompareMaterialCodeCreate(SQLModel):
    material_id: uuid.UUID
    internal_code: str | None = None
    external_code: str | None = None
    description: str = ""
    status: str | None = None


class MultiCompareMaterialCodeCreate(SQLModel):
    compare_material_codes: list[CompareMaterialCodeCreate]


class CompareMaterialCodeUpdate(SQLModel):
    internal_code: str | None = None
    external_code: str | None = None
    description: str = ""
    status: str | None = None


class CompareMaterialCodeDeleteResponse(SQLModel):
    message: str
    id: uuid.UUID


class CompareMaterialCodeServices:
    @staticmethod
    def get_list(*, session: Session, query: BaseQueryParams):
        # Count total items
        count_statement = select(func.count(CompareMaterialCodes.id))
        conditions = []
        
        if query.status:
            conditions.append(CompareMaterialCodes.status == query.status)
        if query.search:
            conditions.append(
                (Materials.material_code.ilike(f"%{query.search}%")) |
                (Materials.material_name.ilike(f"%{query.search}%")) |
                (CompareMaterialCodes.internal_code.ilike(f"%{query.search}%")) |
                (CompareMaterialCodes.external_code.ilike(f"%{query.search}%"))
            )

        # Join for count
        count_statement = count_statement.join(Materials, Materials.id == CompareMaterialCodes.material_id)
        if conditions:
            count_statement = count_statement.where(*conditions)
        
        total = session.exec(count_statement).one()

        # Get data with JOIN
        statement = (
            select(
                CompareMaterialCodes,
                Materials.material_code,
                Materials.material_name
            )
            .join(Materials, Materials.id == CompareMaterialCodes.material_id)
        )
        
        if conditions:
            statement = statement.where(*conditions)

        statement = (
            statement.order_by(CompareMaterialCodes.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        results = session.exec(statement).all()
        
        # Map results
        data = []
        for row in results:
            code = row[0]
            code_dict = code.model_dump()
            code_dict['material_code'] = row[1]
            code_dict['material_name'] = row[2]
            data.append(code_dict)
        
        return {
            "data": data,
            "total": total
        }
    
    @staticmethod
    def create(
        *,
        session: Session,
        code: CompareMaterialCodeCreate,
    ) -> CompareMaterialCodePublic:
        # Check if material exists
        material = session.get(Materials, code.material_id)
        if not material:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Material not found"
            )

        # Check if already exists
        existing = session.exec(
            select(CompareMaterialCodes).where(
                CompareMaterialCodes.material_id == code.material_id
            )
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Compare code for this material already exists.",
            )

        new_code = CompareMaterialCodes(**code.model_dump())
        session.add(new_code)
        session.commit()
        session.refresh(new_code)

        return CompareMaterialCodePublic.model_validate(new_code)
    
    @staticmethod
    def create_multi(
        *,
        session: Session,
        data: MultiCompareMaterialCodeCreate
    ) -> list[CompareMaterialCodePublic]:
        to_create = []
        
        for code in data.compare_material_codes:
            # Check if material exists
            material = session.get(Materials, code.material_id)
            if not material:
                continue
            
            # Check if already exists
            existing = session.exec(
                select(CompareMaterialCodes).where(
                    CompareMaterialCodes.material_id == code.material_id
                )
            ).first()
            
            if not existing:
                to_create.append(
                    CompareMaterialCodes(
                        material_id=code.material_id,
                        internal_code=code.internal_code,
                        external_code=code.external_code,
                        description=code.description or "",
                        status=code.status or StatusEnum.ACTIVE
                    )
                )

        if not to_create:
            raise HTTPException(
                status_code=400,
                detail="All codes already exist or materials not found."
            )

        session.add_all(to_create)
        session.commit()

        for item in to_create:
            session.refresh(item)

        return [CompareMaterialCodePublic.model_validate(c) for c in to_create]
    
    @staticmethod
    def update(
        *,
        session: Session,
        code_id: uuid.UUID,
        code_data: CompareMaterialCodeUpdate,
    ) -> CompareMaterialCodePublic:
        code = session.get(CompareMaterialCodes, code_id)
        if not code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Compare code not found"
            )

        update_data = code_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(code, field, value)

        session.commit()
        return CompareMaterialCodePublic.model_validate(code)

    @staticmethod
    def delete_many(
        *,
        session: Session,
        code_ids: List[uuid.UUID]
    ) -> List[CompareMaterialCodeDeleteResponse]:
        results = []

        try:
            for code_id in code_ids:
                code = session.get(CompareMaterialCodes, code_id)

                if not code:
                    results.append(
                        CompareMaterialCodeDeleteResponse(id=str(code_id), message="Code not found")
                    )
                    continue

                if code.status == StatusEnum.ACTIVE:
                    code.status = StatusEnum.INACTIVE
                    message = "Code set to inactive"
                else:
                    message = "Code already inactive"

                results.append(CompareMaterialCodeDeleteResponse(id=str(code_id), message=message))

            session.commit()

        except Exception as e:
            session.rollback()
            raise e

        return results
