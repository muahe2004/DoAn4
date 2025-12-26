from typing import List
import uuid

from fastapi import HTTPException
from sqlalchemy import func
from app.models.schemas.norms.norm_schemas import MultiNormCreate, NormCreate, NormDeleteResponse, NormDropdownResponse, NormPublic, NormUpdate
from app.models.schemas.norms.norm_detail_schemas import NormDetailPublic
from app.models.schemas.common.query import BaseQueryParams
from sqlmodel import Session, select
from starlette import status
from app.models.models import Norms, NormDetails
from app.enums.status import StatusEnum

class NormServices:
    @staticmethod
    def get_all(*, session: Session, query: BaseQueryParams) -> tuple[list[NormPublic], int]:
        statement = select(Norms)
        count_statement = select(func.count(Norms.id))

        conditions = []
        if query.status:
            conditions.append(Norms.status == query.status)
        if query.search:
            conditions.append(Norms.norm_name.ilike(f"%{query.search}%"))

        if conditions:
            statement = statement.where(*conditions)
            count_statement = count_statement.where(*conditions)

        total = session.exec(count_statement).one()

        statement = (
            statement.order_by(Norms.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        norms = session.exec(statement).all()
        
        # Get norm details for each norm
        result = []
        for norm in norms:
            norm_details = session.exec(
                select(NormDetails).where(NormDetails.norm_id == norm.id)
            ).all()
            
            # Create response manually to ensure all fields are present
            response_data = {
                'id': norm.id,
                'norm_name': norm.norm_name,
                'description': norm.description,
                'status': norm.status,
                'created_at': norm.created_at,
                'updated_at': norm.updated_at,
                'norm_details': [
                    NormDetailPublic.model_validate(detail) for detail in norm_details
                ]
            }
            result.append(NormPublic.model_validate(response_data))
        
        return result, total

    @staticmethod
    def get_by_id(*, session: Session, norm_id: uuid.UUID) -> NormPublic:
        norm = session.get(Norms, norm_id)
        if not norm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Norm not found"
            )
        
        # Get norm details
        norm_details = session.exec(
            select(NormDetails).where(NormDetails.norm_id == norm_id)
        ).all()
        
        # Create response manually to ensure all fields are present
        response_data = {
            'id': norm.id,
            'norm_name': norm.norm_name,
            'description': norm.description,
            'status': norm.status,
            'created_at': norm.created_at,
            'updated_at': norm.updated_at,
            'norm_details': [
                NormDetailPublic.model_validate(detail) for detail in norm_details
            ]
        }
        
        return NormPublic.model_validate(response_data)

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
        norm_data: NormCreate,
    ) -> NormPublic:
        try:
            normalized_name = norm_data.norm_name.strip().upper()

            existing = session.exec(
                select(Norms).where(func.upper(Norms.norm_name) == normalized_name)
            ).first()

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Norm: '{norm_data.norm_name}' already exists.",
                )
            
            # Create norm without norm_details
            norm_dict = norm_data.model_dump(exclude={'norm_details'})
            new_norm = Norms(**norm_dict)
            session.add(new_norm)
            session.flush()  # Get the ID without committing
            
            # Create norm details
            norm_details = []
            for detail_data in norm_data.norm_details:
                detail_dict = detail_data.model_dump(exclude={'id'})
                detail_dict['norm_id'] = new_norm.id
                detail_dict['status'] = detail_dict.get('status', StatusEnum.ACTIVE)
                
                norm_detail = NormDetails(**detail_dict)
                session.add(norm_detail)
                norm_details.append(norm_detail)
            
            session.commit()
            session.refresh(new_norm)
            
            # Refresh all details to get their IDs
            for detail in norm_details:
                session.refresh(detail)
            
            # Build response manually to ensure all fields are present
            response_data = {
                'id': new_norm.id,
                'norm_name': new_norm.norm_name,
                'description': new_norm.description,
                'status': new_norm.status,
                'created_at': new_norm.created_at,
                'updated_at': new_norm.updated_at,
                'norm_details': [
                    NormDetailPublic.model_validate(detail) for detail in norm_details
                ]
            }
            
            return NormPublic.model_validate(response_data)
            
        except Exception as e:
            session.rollback()
            raise e
    
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
        try:
            norm = session.get(Norms, norm_id)
            if not norm:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Norm not found"
                )

            # Update norm basic fields
            update_data = norm_data.model_dump(exclude_unset=True, exclude={'norm_details'})
            for field, value in update_data.items():
                setattr(norm, field, value)
            
            # Handle norm details if provided
            if norm_data.norm_details is not None:
                # Delete existing norm details
                existing_details = session.exec(
                    select(NormDetails).where(NormDetails.norm_id == norm_id)
                ).all()
                
                for detail in existing_details:
                    session.delete(detail)
                
                # Create new norm details
                new_details = []
                for detail_data in norm_data.norm_details:
                    detail_dict = detail_data.model_dump(exclude={'id'})
                    detail_dict['norm_id'] = norm_id
                    detail_dict['status'] = detail_dict.get('status', StatusEnum.ACTIVE)
                    
                    norm_detail = NormDetails(**detail_dict)
                    session.add(norm_detail)
                    new_details.append(norm_detail)
                
                session.flush()
                
                # Refresh details to get IDs
                for detail in new_details:
                    session.refresh(detail)
                
                session.commit()
                
                # Build response with details
                session.refresh(norm)  # Refresh to get updated data
                
                # Create response manually to ensure all fields are present
                response_data = {
                    'id': norm.id,
                    'norm_name': norm.norm_name,
                    'description': norm.description,
                    'status': norm.status,
                    'created_at': norm.created_at,
                    'updated_at': norm.updated_at,
                    'norm_details': [
                        NormDetailPublic.model_validate(detail) for detail in new_details
                    ]
                }
                
                return NormPublic.model_validate(response_data)
            else:
                session.commit()
                
                # Get existing details for response
                existing_details = session.exec(
                    select(NormDetails).where(NormDetails.norm_id == norm_id)
                ).all()
                
                session.refresh(norm)  # Refresh to get updated data
                
                # Create response manually to ensure all fields are present
                response_data = {
                    'id': norm.id,
                    'norm_name': norm.norm_name,
                    'description': norm.description,
                    'status': norm.status,
                    'created_at': norm.created_at,
                    'updated_at': norm.updated_at,
                    'norm_details': [
                        NormDetailPublic.model_validate(detail) for detail in existing_details
                    ]
                }
                
                return NormPublic.model_validate(response_data)
                
        except Exception as e:
            session.rollback()
            raise e

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
            existing_by_id = session.get(Norms, norm_id)
            if existing_by_id:
                return existing_by_id.id
            if not norm_name:
                raise HTTPException(
                    status_code=400,
                    detail="Norm id does not exist."
                )

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
            new_norm = NormServices.create(session=session, norm_data=payload)
            return new_norm.id
        except HTTPException as e:
            if e.status_code == 400 and "already exists" in e.detail:
                existing = session.exec(
                    select(Norms).where(func.upper(Norms.norm_name) == norm_name.strip().upper())
                ).first()
                return existing.id
            raise
