from typing import List
import uuid

from fastapi import HTTPException
from sqlalchemy import func
from app.models.schemas.norms.norm_schemas import MultiNormCreate, NormCreate, NormDeleteResponse, NormDropdownResponse, NormPublic, NormUpdate
from app.models.schemas.common.query import BaseQueryParams
from sqlmodel import Session, select
from starlette import status
from app.models.models import Norms
from app.enums.status import StatusEnum

class NormServices:
    @staticmethod
    def dropdown(*, session: Session, query: BaseQueryParams) -> list[NormDropdownResponse]:
        statement = select(Norms.id, Norms.norm_name)

        conditions = []
        if query.status:
            conditions.append(Norms.status == query.status)
        if query.search:
            conditions.append(Norms.norm_name.ilike(f"%{query.search}%"))

        if conditions:
            statement = statement.where(*conditions)

        statement = (
            statement.order_by(Norms.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        raw_results = session.exec(statement).all()

        return [
            NormDropdownResponse(id=row[0], norm_name=row[1])
            for row in raw_results
        ]
    
    @staticmethod
    def create(
        *,
        session: Session,
        norm: Norms,
    ) -> NormPublic:
        normalized_name = norm.norm_name.strip().upper()

        existing = session.exec(
            select(Norms).where(func.upper(Norms.norm_name) == normalized_name)
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Norm: '{norm.norm_name}' already exists.",
            )
        
        new_norm = Norms(**norm.model_dump())
        session.add(new_norm)
        session.commit()
        session.refresh(new_norm)

        return NormPublic.model_validate(new_norm)
    
    def create_multi(
        *,
        session: Session,
        data: MultiNormCreate
    ) -> list[NormPublic]:

        normalized_map = {
            n.norm_name.strip().upper(): n.norm_name
            for n in data.norms
        }

        normalized_names = list(normalized_map.keys())

        existing_norms = session.exec(
            select(Norms).where(
                func.upper(Norms.norm_name).in_(normalized_names)
            )
        ).all()

        existing_normalized = {
            n.norm_name.strip().upper()
            for n in existing_norms
        }

        to_create = []
        for normalized_name, original_name in normalized_map.items():
            if normalized_name not in existing_normalized:
                to_create.append(
                    Norms(
                        norm_name=original_name,
                        description="",
                        status=StatusEnum.ACTIVE
                    )
                )

        if not to_create:
            raise HTTPException(
                status_code=400,
                detail="All norms already exist."
            )

        session.add_all(to_create)
        session.commit()

        for item in to_create:
            session.refresh(item)

        return [NormPublic.model_validate(n) for n in to_create]
    
    @staticmethod
    def update(
        *,
        session: Session,
        norm_id: uuid.UUID,
        norm_data: NormUpdate,
    ) -> NormPublic:
        norm = session.get(Norms, norm_id)
        if not norm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Norm not found"
            )

        update_data = norm_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(norm, field, value)

        session.commit()
        return NormPublic.model_validate(norm)

    @staticmethod
    def delete_many(
        *,
        session: Session,
        norm_ids: List[uuid.UUID]
    ) -> List[NormDeleteResponse]:
        results = []

        try:
            for norm_id in norm_ids:
                norm = session.get(Norms, norm_id)

                if not norm:
                    results.append(
                        NormDeleteResponse(id=str(norm_id), message="Norms not found")
                    )
                    continue

                if norm.status == StatusEnum.ACTIVE:
                    norm.status = StatusEnum.INACTIVE
                    message = "Norms set to inactive"
                else:
                    message = "Norms already inactive"

                results.append(NormDeleteResponse(id=str(norm_id), message=message))

            session.commit()

        except Exception as e:
            session.rollback()
            raise e

        return results
    
    @staticmethod
    def resolve_norm_generic(session, norm_id, norm_name):
        if norm_id:
            return norm_id

        if not norm_name:
            raise HTTPException(
                status_code=400,
                detail="Norm name must be provided."
            )

        payload = NormCreate(
            norm_name=norm_name.strip(),
            description="",
            status=StatusEnum.ACTIVE,
        )

        try:
            new_norm = NormServices.create(session=session, norm=payload)
            return new_norm.id
        except HTTPException as e:
            if e.status_code == 400 and "already exists" in e.detail:
                existing = session.exec(
                    select(Norms).where(func.upper(Norms.norm_name) == norm_name.strip().upper())
                ).first()
                return existing.id
            raise