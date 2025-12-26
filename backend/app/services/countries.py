import uuid
from typing import Optional

from fastapi import HTTPException
from sqlmodel import Session, select
from sqlalchemy import func
from sqlmodel import Session, select

from app.enums.status import StatusEnum
from app.models.models import Countries
from app.models.schemas.countries.country_schemas import (
    CountryCreate,
    CountryDropdownResponse,
    CountryQueryParams,
)
from app.enums.status import StatusEnum

class CountryServices:
    @staticmethod
    def dropdown(*, session: Session, query: CountryQueryParams) -> list[CountryDropdownResponse]:
        statement = select(Countries.id, Countries.country_name)

        conditions = []
        if query.status:
            conditions.append(Countries.status == query.status)
        if query.search:
            conditions.append(Countries.country_name.ilike(f"%{query.search}%"))

        if conditions:
            statement = statement.where(*conditions)

        statement = (
            statement.order_by(Countries.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        raw_results = session.exec(statement).all()

        return [
            CountryDropdownResponse(id=row[0], country_name=row[1])
            for row in raw_results
        ]

    @staticmethod
    def resolve_country_generic(session, country_id, country_code, country_name):
        if country_id:
            existing_by_id = session.get(Countries, country_id)
            if existing_by_id:
                return existing_by_id.id
            if not country_code:
                raise HTTPException(
                    status_code=400,
                    detail="Country id does not exist."
                )
        
        if not country_code or not country_code.strip():
            raise HTTPException(
                status_code=400,
                detail="Country code must be provided."
            )

        if not country_name or not country_name.strip():
            raise HTTPException(
                status_code=400,
                detail="Country name must be provided."
            )

        existing_by_code = session.exec(
            select(Countries).where(
                func.upper(Countries.country_code) == country_code.strip().upper()
            )
        ).first()
        if existing_by_code:
            return existing_by_code.id

        payload = CountryCreate(
            country_name=country_name.strip(),
            country_code=country_code.strip(),
            description="",
            status=StatusEnum.ACTIVE,
        )

        new_country = Countries(**payload.model_dump())
        session.add(new_country)
        session.commit()
        session.refresh(new_country)

        return new_country.id
