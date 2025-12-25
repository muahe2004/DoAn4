import uuid
from fastapi import HTTPException
from sqlalchemy import func
from sqlmodel import Session, select
from starlette import status

from app.models.models import ImportDeclarationDetails, ImportDeclarations, Materials
from app.models.schemas.imports.import_declaration_details_schemas import (
    ImportDeclarationDetailsPublic
)
from app.models.schemas.common.query import BaseQueryParams


class FiscalImportDeclarationDetailsServices:
    @staticmethod
    def get_list(*, session: Session, query: BaseQueryParams):
        # Count total items
        count_statement = select(func.count(ImportDeclarationDetails.id))
        conditions = []
        
        if query.status:
            conditions.append(ImportDeclarationDetails.status == query.status)
        if query.search:
            conditions.append(
                ImportDeclarationDetails.hs_code.ilike(f"%{query.search}%")
            )

        if conditions:
            count_statement = count_statement.where(*conditions)
        
        total = session.exec(count_statement).one()

        # Get data with JOIN
        statement = (
            select(
                ImportDeclarationDetails,
                ImportDeclarations.import_declaration_number,
                ImportDeclarations.licence_date,
                ImportDeclarations.type_declaration,
                Materials.material_code,
                Materials.material_name
            )
            .join(ImportDeclarations, ImportDeclarationDetails.import_declaration_id == ImportDeclarations.id)
            .join(Materials, ImportDeclarationDetails.material_id == Materials.id)
        )
        
        if conditions:
            statement = statement.where(*conditions)

        statement = (
            statement.order_by(ImportDeclarationDetails.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        results = session.exec(statement).all()
        
        # Map results to response with additional fields
        data = []
        for row in results:
            detail = row[0]
            detail_dict = detail.model_dump()
            detail_dict['import_declaration_number'] = row[1]
            detail_dict['licence_date'] = row[2]
            detail_dict['type_declaration'] = row[3]
            detail_dict['material_code'] = row[4]
            detail_dict['material_name'] = row[5]
            data.append(detail_dict)
        
        return {
            "data": data,
            "total": total
        }

    @staticmethod
    def get_by_id(*, session: Session, import_declaration_detail_id: uuid.UUID):
        import_declaration_detail = session.get(ImportDeclarationDetails, import_declaration_detail_id)
        
        if not import_declaration_detail:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Import declaration detail not found"
            )
        
        return ImportDeclarationDetailsPublic.model_validate(import_declaration_detail)
