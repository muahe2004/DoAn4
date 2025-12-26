import uuid
from typing import Optional

from sqlalchemy import func
from sqlmodel import Session, select

from app.enums.status import StatusEnum
from app.models.models import Countries
from app.models.schemas.countries.country_schemas import CountryDropdownResponse, CountryQueryParams

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
        DEFAULT_COUNTRY_CODE = "DEFAULT"
        
    DEFAULT_COUNTRY_NAME = "Không xác định"
    DEFAULT_COUNTRY_CODE = "DEFAULT"
    @staticmethod
    def resolve_country_generic(
        session: Session,
        country_id: Optional[uuid.UUID] = None,
        *,
        country_code: Optional[str] = None,
        country_name: Optional[str] = None,
    ) -> uuid.UUID:
        if country_id:
            existing_by_id = session.get(Countries, country_id)
            if existing_by_id:
                return existing_by_id.id

        if country_code:
            normalized_code = country_code.strip().upper()
            existing_by_code = session.exec(
                select(Countries).where(func.upper(Countries.country_code) == normalized_code)
            ).first()
            if existing_by_code:
                return existing_by_code.id

        if country_name:
            normalized_name = country_name.strip().lower()
            existing_by_name = session.exec(
                select(Countries).where(func.lower(Countries.country_name) == normalized_name)
            ).first()
            if existing_by_name:
                return existing_by_name.id

        default = CountryServices.ensure_default_country(session)
        return default.id

    @staticmethod
    def ensure_default_country(session: Session) -> Countries:
        normalized_code = CountryServices.DEFAULT_COUNTRY_NAME
        existing = session.exec(
            select(Countries).where(func.upper(Countries.country_code) == normalized_code)
        ).first()
        if existing:
            return existing

        new_country = Countries(
            country_code=CountryServices.DEFAULT_COUNTRY_CODE,
            country_name=CountryServices.DEFAULT_COUNTRY_NAME,
            description="Country created by export declaration flow",
            status=StatusEnum.ACTIVE,
        )
        session.add(new_country)
        session.commit()
        session.refresh(new_country)
        return new_country