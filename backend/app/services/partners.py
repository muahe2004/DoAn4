import re
import uuid
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import func
from sqlmodel import Session, select

from app.enums.status import StatusEnum
from app.models.models import Partners
from app.models.schemas.partners.partner_schemas import PartnerDropdownResponse, PartnerQueryParams

class PartnerServices:
    @staticmethod
    def dropdown(*, session: Session, query: PartnerQueryParams) -> list[PartnerDropdownResponse]:
        statement = select(Partners.id, Partners.partner_name)

        conditions = []
        if query.status:
            conditions.append(Partners.status == query.status)
        if query.search:
            conditions.append(Partners.partner_name.ilike(f"%{query.search}%"))

        if conditions:
            statement = statement.where(*conditions)

        statement = (
            statement.order_by(Partners.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        raw_results = session.exec(statement).all()

        return [
            PartnerDropdownResponse(id=row[0], partner_name=row[1])
            for row in raw_results
        ]
    
    DEFAULT_PARTNER_TYPE = "IMPORTER"
    @staticmethod
    def resolve_partner_generic(
        session: Session,
        *,
        partner_name: Optional[str],
        country_id: uuid.UUID,
    ) -> uuid.UUID:
        if not partner_name:
            raise HTTPException(status_code=400, detail="Importer name is required")

        normalized_name = partner_name.strip()
        existing = session.exec(
            select(Partners).where(func.lower(Partners.partner_name) == normalized_name.lower())
        ).first()
        if existing:
            return existing.id

        code_base = re.sub(r"[^A-Za-z0-9]", "", normalized_name).upper()
        code_prefix = (code_base[:6] or "IMPORT")[:6]
        suffix = uuid.uuid4().hex[:4].upper()
        generated_code = f"{code_prefix}{suffix}"

        email_prefix = re.sub(r"[^a-z0-9]", "-", normalized_name.lower())
        if not email_prefix:
            email_prefix = "importer"
        generated_email = f"{email_prefix}-{uuid.uuid4().hex[:6]}@auto-export.local"

        new_partner = Partners(
            partner_code=generated_code,
            partner_name=normalized_name,
            phone_number="",
            email=generated_email,
            description="Người khai hải quan được tạo tự động từ tờ khai xuất",
            country_id=country_id,
            partner_type=PartnerServices.DEFAULT_PARTNER_TYPE,
            status=StatusEnum.ACTIVE,
        )

        session.add(new_partner)
        session.commit()
        session.refresh(new_partner)

        return new_partner.id