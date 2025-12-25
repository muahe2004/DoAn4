import uuid
from fastapi import HTTPException
from sqlalchemy import func
from sqlmodel import Session, select
from starlette import status

from app.models.models import ImportDeclarations, ImportDeclarationDetails
from app.models.schemas.imports.import_declaration_schemas import (
    ImportDeclarationPublic,
    ImportDeclarationQueryParams
)
from app.models.schemas.imports.import_declaration_details_schemas import (
    ImportDeclarationDetailsPublic
)


class FiscalImportDeclarationServices:
    @staticmethod
    def get_list(*, session: Session, query: ImportDeclarationQueryParams):
        # Count total items
        count_statement = select(func.count(ImportDeclarations.id))
        conditions = []
        
        if query.status:
            conditions.append(ImportDeclarations.status == query.status)
        if query.type:
            conditions.append(ImportDeclarations.type_declaration == query.type)
        if query.search:
            conditions.append(
                ImportDeclarations.import_declaration_number.ilike(f"%{query.search}%")
            )
        if query.from_date:
            from datetime import datetime
            from_date_obj = datetime.fromisoformat(query.from_date)
            conditions.append(ImportDeclarations.licence_date >= from_date_obj)
        if query.to_date:
            from datetime import datetime
            to_date_obj = datetime.fromisoformat(query.to_date)
            conditions.append(ImportDeclarations.licence_date <= to_date_obj)

        if conditions:
            count_statement = count_statement.where(*conditions)
        
        total = session.exec(count_statement).one()

        # Get data
        statement = select(ImportDeclarations)
        if conditions:
            statement = statement.where(*conditions)

        statement = (
            statement.order_by(ImportDeclarations.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        import_declarations = session.exec(statement).all()
        
        return {
            "data": [
                ImportDeclarationPublic.model_validate(declaration) 
                for declaration in import_declarations
            ],
            "total": total
        }

    @staticmethod
    def get_by_id(*, session: Session, import_declaration_id: uuid.UUID):
        import_declaration = session.get(ImportDeclarations, import_declaration_id)
        
        if not import_declaration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Import declaration not found"
            )
        
        return ImportDeclarationPublic.model_validate(import_declaration)


class FiscalImportDeclarationDetailServices:
    @staticmethod
    def get_by_import_id(
        *, 
        session: Session, 
        import_declaration_id: uuid.UUID
    ):
        # Verify import declaration exists
        import_declaration = session.get(ImportDeclarations, import_declaration_id)
        if not import_declaration:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Import declaration not found"
            )

        # Get details
        statement = select(ImportDeclarationDetails).where(
            ImportDeclarationDetails.import_declaration_id == import_declaration_id
        ).order_by(ImportDeclarationDetails.created_at.desc())

        details = session.exec(statement).all()
        
        return [
            ImportDeclarationDetailsPublic.model_validate(detail) 
            for detail in details
        ]
