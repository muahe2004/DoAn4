from sqlmodel import Session, select
from sqlalchemy import func
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
