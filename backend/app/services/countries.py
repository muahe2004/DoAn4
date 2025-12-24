import uuid
from typing import Optional

from sqlalchemy import func
from sqlmodel import Session, select

from app.enums.status import StatusEnum
from app.models.models import Countries


class CountryServices:
    DEFAULT_COUNTRY_CODE = "DEFAULT"
    DEFAULT_COUNTRY_NAME = "Không xác định"

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
        normalized_code = CountryServices.DEFAULT_COUNTRY_CODE
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
