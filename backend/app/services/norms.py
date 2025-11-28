from app.models.schemas.norms.norm_schemas import NormDropdownResponse
from app.models.schemas.common.query import BaseQueryParams
from sqlmodel import Session, select

from app.models.models import Norms

class NormServices:
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