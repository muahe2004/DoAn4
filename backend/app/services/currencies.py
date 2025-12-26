from sqlmodel import Session, select
from app.models.models import Currencies
from app.models.schemas.currencies.currency_schemas import CurrencyDropdownResponse, CurrencyQueryParams

class CurrencyServices:
    @staticmethod
    def dropdown(*, session: Session, query: CurrencyQueryParams) -> list[CurrencyDropdownResponse]:
        statement = select(Currencies.id, Currencies.currency_name)

        conditions = []
        if query.status:
            conditions.append(Currencies.status == query.status)
        if query.search:
            conditions.append(Currencies.currency_name.ilike(f"%{query.search}%"))

        if conditions:
            statement = statement.where(*conditions)

        statement = (
            statement.order_by(Currencies.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        raw_results = session.exec(statement).all()

        return [
            CurrencyDropdownResponse(id=row[0], currency_name=row[1])
            for row in raw_results
        ]
