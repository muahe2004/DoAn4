import uuid
from fastapi import APIRouter, Depends

from app.api.deps import SessionDep
from app.models.schemas.imports.import_declaration_details_schemas import (
    ImportDeclarationDetailsPublic
)
from app.models.schemas.common.query import BaseQueryParams
from app.services.fiscal_import_declaration_details import (
    FiscalImportDeclarationDetailsServices
)

router = APIRouter()

# =========================== get fiscal import declaration details list ===========================
@router.get("")
def get_fiscal_import_declaration_details(
    session: SessionDep, 
    query: BaseQueryParams = Depends()
):
    return FiscalImportDeclarationDetailsServices.get_list(session=session, query=query)


# =========================== get fiscal import declaration detail by id ===========================
@router.get("/{id}", response_model=ImportDeclarationDetailsPublic)
def get_fiscal_import_declaration_detail_by_id(
    session: SessionDep, 
    id: uuid.UUID
) -> ImportDeclarationDetailsPublic:
    return FiscalImportDeclarationDetailsServices.get_by_id(
        session=session, 
        import_declaration_detail_id=id
    )
