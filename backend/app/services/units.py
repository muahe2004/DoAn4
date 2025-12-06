from typing import List
import uuid

from fastapi import HTTPException
from sqlalchemy import func
from app.models.schemas.units.unit_schemas import MultiUnitCreate, UnitCreate, UnitDeleteResponse, UnitDropdownResponse, UnitPublic, UnitQueryParams, UnitUpdate
from sqlmodel import Session, select
from app.models.models import Units
from starlette import status
from app.enums.status import StatusEnum

class UnitServices:
    @staticmethod
    def dropdown(*, session: Session, query: UnitQueryParams) -> list[UnitDropdownResponse]:
        statement = select(Units.id, Units.unit_name)

        conditions = []
        if query.status:
            conditions.append(Units.status == query.status)
        if query.type:
            conditions.append(Units.type == query.type)
        if query.search:
            conditions.append(Units.unit_name.ilike(f"%{query.search}%"))

        if conditions:
            statement = statement.where(*conditions)

        statement = (
            statement.order_by(Units.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        raw_results = session.exec(statement).all()

        return [
            UnitDropdownResponse(id=row[0], unit_name=row[1])
            for row in raw_results
        ]
    
    @staticmethod
    def create(
        *,
        session: Session,
        unit: UnitCreate,
    ) -> UnitPublic:
        normalized_name = unit.unit_name.strip().upper()

        existing = session.exec(
            select(Units).where(func.upper(Units.unit_name) == normalized_name)
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unit: '{unit.unit_name}' already exists.",
            )

        new_unit = Units(**unit.model_dump())
        session.add(new_unit)
        session.commit()
        session.refresh(new_unit)

        return UnitPublic.model_validate(new_unit)
    
    def create_multi(
        *,
        session: Session,
        data: MultiUnitCreate
    ) -> list[UnitPublic]:

        normalized_map = {
            u.unit_name.strip().upper(): u.unit_name
            for u in data.units
        }

        normalized_names = list(normalized_map.keys())

        existing_units = session.exec(
            select(Units).where(
                func.upper(Units.unit_name).in_(normalized_names)
            )
        ).all()

        existing_normalized = {
            u.unit_name.strip().upper()
            for u in existing_units
        }

        to_create = []
        for normalized_name, original_name in normalized_map.items():
            if normalized_name not in existing_normalized:
                to_create.append(
                    Units(
                        unit_name=original_name,
                        description="",
                        type="",
                        status=StatusEnum.ACTIVE
                    )
                )

        if not to_create:
            raise HTTPException(
                status_code=400,
                detail="All units already exist."
            )

        session.add_all(to_create)
        session.commit()

        for item in to_create:
            session.refresh(item)

        return [UnitPublic.model_validate(u) for u in to_create]
    
    @staticmethod
    def update(
        *,
        session: Session,
        unit_id: uuid.UUID,
        unit_data: UnitUpdate,
    ) -> UnitPublic:
        unit = session.get(Units, unit_id)
        if not unit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found"
            )

        update_data = unit_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(unit, field, value)

        session.commit()
        return UnitPublic.model_validate(unit)

    @staticmethod
    def delete_many(
        *,
        session: Session,
        unit_ids: List[uuid.UUID]
    ) -> List[UnitDeleteResponse]:
        results = []

        try:
            for unit_id in unit_ids:
                unit = session.get(Units, unit_id)

                if not unit:
                    results.append(
                        UnitDeleteResponse(id=str(unit_id), message="unit not found")
                    )
                    continue

                if unit.status == StatusEnum.ACTIVE:
                    unit.status = StatusEnum.INACTIVE
                    message = "Units set to inactive"
                else:
                    message = "Units already inactive"

                results.append(UnitDeleteResponse(id=str(unit_id), message=message))

            session.commit()

        except Exception as e:
            session.rollback()
            raise e

        return results
    
    @staticmethod
    def resolve_unit_generic(session, unit_id, unit_name):
        if unit_id:
            return unit_id
        
        if not unit_name:
            raise HTTPException(
                status_code=400,
                detail="Unit name must be provided."
            )

        payload = UnitCreate(
            unit_name=unit_name.strip(),
            description="",
            type="",
            status=StatusEnum.ACTIVE,
        )

        try:
            new_unit = UnitServices.create(session=session, unit=payload)
            return new_unit.id
        except HTTPException as e:
            if e.status_code == 400 and "already exists" in e.detail:
                existing = session.exec(
                    select(Units).where(func.upper(Units.unit_name) == unit_name.strip().upper())
                ).first()
                return existing.id
            raise