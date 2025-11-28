from app.models.schemas.units.unit_schemas import UnitDropdownResponse, UnitQueryParams
from sqlmodel import Session, select
from app.models.models import Units

class UnitServices:
    @staticmethod
    def dropdown(*, session: Session, query: UnitQueryParams) -> list[UnitDropdownResponse]:
        statement = select(Units.id, Units.unit_name)

        conditions = []
        if query.status:
            conditions.append(Units.status == query.status)
        if query.type:
            conditions.append(Units.type == query.type)
        if query.search:
            conditions.append(Units.unit_name.ilike(f"%{query.search}%"))

        if conditions:
            statement = statement.where(*conditions)

        statement = (
            statement.order_by(Units.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        raw_results = session.exec(statement).all()

        return [
            UnitDropdownResponse(id=row[0], unit_name=row[1])
            for row in raw_results
        ]