import uuid
from fastapi import APIRouter, Depends

from app.api.deps import SessionDep
from app.models.schemas.imports.import_declaration_schemas import (
    ImportDeclarationPublic,
    ImportDeclarationQueryParams
)
from app.models.schemas.imports.import_declaration_details_schemas import (
    ImportDeclarationDetailsPublic
)
from app.services.fiscal_import_declarations import (
    FiscalImportDeclarationServices,
    FiscalImportDeclarationDetailServices
)

router = APIRouter()

# =========================== get fiscal import declarations list ===========================
@router.get("")
def get_fiscal_import_declarations(
    session: SessionDep, 
    query: ImportDeclarationQueryParams = Depends()
):
    return FiscalImportDeclarationServices.get_list(session=session, query=query)


# =========================== get fiscal import declaration by id ===========================
@router.get("/{id}", response_model=ImportDeclarationPublic)
def get_fiscal_import_declaration_by_id(
    session: SessionDep, 
    id: uuid.UUID
) -> ImportDeclarationPublic:
    return FiscalImportDeclarationServices.get_by_id(
        session=session, 
        import_declaration_id=id
    )


# =========================== get fiscal import declaration details by import_id ===========================
@router.get("/{import_id}/details", response_model=list[ImportDeclarationDetailsPublic])
def get_fiscal_import_declaration_details(
    session: SessionDep,
    import_id: uuid.UUID
) -> list[ImportDeclarationDetailsPublic]:
    return FiscalImportDeclarationDetailServices.get_by_import_id(
        session=session,
        import_declaration_id=import_id
    )
