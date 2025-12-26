from sqlmodel import Session, select
from sqlalchemy import func
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
