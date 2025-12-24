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

from app.models.models import ImportDeclarationDetails
from app.models.schemas.imports.import_declaration_schemas import ImportDeclarationCreate, ImportDeclarationPublic
from app.models.schemas.imports.import_declaration_details_schemas import ImportDeclarationDetailCreate, ImportDeclarationDetailsPublic
from app.services.units import UnitServices

class ImportDeclarationDetailServices:
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
