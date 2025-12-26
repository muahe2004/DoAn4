import uuid
from fastapi import HTTPException
from sqlalchemy import func
from app.models.schemas.norms.norm_detail_schemas import NormDetailCreate, NormDetailPublic, NormDetailUpdate
from app.models.schemas.common.query import BaseQueryParams
from sqlmodel import Session, select
from starlette import status
from app.models.models import NormDetails
from app.enums.status import StatusEnum

class NormDetailServices:
    @staticmethod
    def get_all_by_norm(*, session: Session, norm_id: uuid.UUID, query: BaseQueryParams) -> tuple[list[NormDetailPublic], int]:
        statement = select(NormDetails).where(NormDetails.norm_id == norm_id)
        count_statement = select(func.count(NormDetails.id)).where(NormDetails.norm_id == norm_id)

        conditions = []
        if query.status:
            conditions.append(NormDetails.status == query.status)

        if conditions:
            statement = statement.where(*conditions)
            count_statement = count_statement.where(*conditions)

        total = session.exec(count_statement).one()

        statement = (
            statement.order_by(NormDetails.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        norm_details = session.exec(statement).all()
        return [NormDetailPublic.model_validate(detail) for detail in norm_details], total

    @staticmethod
    def create(
        *,
        session: Session,
        norm_detail: NormDetailCreate,
    ) -> NormDetailPublic:
        new_norm_detail = NormDetails(**norm_detail.model_dump())
        session.add(new_norm_detail)
        session.commit()
        session.refresh(new_norm_detail)

        return NormDetailPublic.model_validate(new_norm_detail)

    @staticmethod
    def update(
        *,
        session: Session,
        norm_detail_id: uuid.UUID,
        norm_detail_data: NormDetailUpdate,
    ) -> NormDetailPublic:
        norm_detail = session.get(NormDetails, norm_detail_id)
        if not norm_detail:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Norm detail not found"
            )

        update_data = norm_detail_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(norm_detail, field, value)

        session.commit()
        return NormDetailPublic.model_validate(norm_detail)

    @staticmethod
    def delete(
        *,
        session: Session,
        norm_detail_id: uuid.UUID
    ) -> dict:
        norm_detail = session.get(NormDetails, norm_detail_id)

        if not norm_detail:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Norm detail not found"
            )

        session.delete(norm_detail)
        session.commit()

        return {"message": "Norm detail deleted successfully", "id": str(norm_detail_id)}