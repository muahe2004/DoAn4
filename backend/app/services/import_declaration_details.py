import uuid
from datetime import datetime
import json
from app.enums.status import StatusEnum
from fastapi import HTTPException, Request
from sqlalchemy import or_
from sqlmodel import Session, select, func
from starlette import status
from typing import List, Optional, Tuple
from sqlalchemy.orm import aliased

from app.models.models import Countries, ImportDeclarationDetails, Materials, Units
from app.models.schemas.imports.import_declaration_schemas import ImportDeclarationCreate, ImportDeclarationPublic
from app.models.schemas.imports.import_declaration_details_schemas import ImportDeclarationDetailCreate, ImportDeclarationDetailsListResponse, ImportDeclarationDetailsPublic, ImportDeclarationDetailsResponse
from app.services.units import UnitServices
from app.models.schemas.common.query import BaseQueryParams

class ImportDeclarationDetailServices:
    
    @staticmethod
    def get_all(*, session: Session, query: BaseQueryParams) -> ImportDeclarationDetailsListResponse:
        Unit1 = aliased(Units)
        Unit2 = aliased(Units)

        statement = (
            select(
                ImportDeclarationDetails.id,
                ImportDeclarationDetails.hs_code,
                ImportDeclarationDetails.import_declaration_id,
                ImportDeclarationDetails.material_id,
                Materials.material_name.label("material_name"),
                ImportDeclarationDetails.origin_country_id,
                ImportDeclarationDetails.unit_id,
                ImportDeclarationDetails.unit_id_2,
                ImportDeclarationDetails.quantity,
                ImportDeclarationDetails.quantity2,
                ImportDeclarationDetails.unit_price,
                ImportDeclarationDetails.unit_price_transport,
                ImportDeclarationDetails.status,
                ImportDeclarationDetails.created_at,
                ImportDeclarationDetails.updated_at,
                Unit1.unit_name.label("unit_name"),
                Unit2.unit_name.label("unit_name_2"),
                Countries.country_name.label("country_name"),
            )
            .join(Unit1, Unit1.id == ImportDeclarationDetails.unit_id, isouter=True)
            .join(Unit2, Unit2.id == ImportDeclarationDetails.unit_id_2, isouter=True)
            .join(Countries, Countries.id == ImportDeclarationDetails.origin_country_id, isouter=True)
            .join(Materials, Materials.id == ImportDeclarationDetails.material_id, isouter=True)
        )

        conditions = []
        if query.status:
            conditions.append(ImportDeclarationDetails.status == query.status)
        if query.search:
            search_text = f"%{query.search}%"
            conditions.append(
                or_(
                    func.unaccent(ImportDeclarationDetails.hs_code).ilike(func.unaccent(search_text)),
                )
            )
        
        if conditions:
            statement = statement.where(*conditions)

        count_stmt = select(func.count()).select_from(ImportDeclarationDetails)
        if conditions:
            count_stmt = count_stmt.where(*conditions)

        total = session.exec(count_stmt).one()

        statement = (
            statement.order_by(ImportDeclarationDetails.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        results = session.exec(statement).all()

        return results, total   
    
    @staticmethod
    def create(
        *,
        session: Session,
        import_declaration: ImportDeclarationDetailCreate,
    ) -> ImportDeclarationDetailsPublic:
        new_detail = ImportDeclarationDetails(**import_declaration.model_dump())
        session.add(new_detail)
        session.commit()
        session.refresh(new_detail)

        return ImportDeclarationDetailsPublic.model_validate(new_detail)

    @staticmethod
    def get_by_import_declaration_ids(
        *,
        session: Session,
        import_declaration_ids: list[uuid.UUID],
    ) -> dict[uuid.UUID, list[ImportDeclarationDetailsResponse]]:
        if not import_declaration_ids:
            return {}

        Unit1 = aliased(Units)
        Unit2 = aliased(Units)

        statement = (
            select(
                ImportDeclarationDetails.id,
                ImportDeclarationDetails.hs_code,
                ImportDeclarationDetails.import_declaration_id,
                ImportDeclarationDetails.material_id,
                Materials.material_name.label("material_name"),
                ImportDeclarationDetails.origin_country_id,
                ImportDeclarationDetails.unit_id,
                ImportDeclarationDetails.unit_id_2,
                ImportDeclarationDetails.quantity,
                ImportDeclarationDetails.quantity2,
                ImportDeclarationDetails.unit_price,
                ImportDeclarationDetails.unit_price_transport,
                ImportDeclarationDetails.status,
                ImportDeclarationDetails.created_at,
                ImportDeclarationDetails.updated_at,
                Unit1.unit_name.label("unit_name"),
                Unit2.unit_name.label("unit_name_2"),
                Countries.country_name.label("country_name"),
            )
            .join(Unit1, Unit1.id == ImportDeclarationDetails.unit_id, isouter=True)
            .join(Unit2, Unit2.id == ImportDeclarationDetails.unit_id_2, isouter=True)
            .join(Countries, Countries.id == ImportDeclarationDetails.origin_country_id, isouter=True)
            .join(Materials, Materials.id == ImportDeclarationDetails.material_id, isouter=True)
            .where(ImportDeclarationDetails.import_declaration_id.in_(import_declaration_ids))
        )

        results = session.exec(statement).all()

        detail_map: dict[uuid.UUID, list[ImportDeclarationDetailsResponse]] = {}
        for row in results:
            detail_map.setdefault(row.import_declaration_id, []).append(row)

        return detail_map
