from fastapi import APIRouter, Depends

from app.api.deps import SessionDep
from app.models.schemas.exports.export_declaration_requests_schemas import (
    ExportDeclarationListResponse,
    ExportDeclarationQueryParams,
)
from app.services.fiscal_export_declarations import FiscalExportDeclarationServices

router = APIRouter()


@router.get("", response_model=ExportDeclarationListResponse)
def get_fiscal_export_declarations(
    session: SessionDep,
    query: ExportDeclarationQueryParams = Depends(),
):
    return FiscalExportDeclarationServices.get_list(session=session, query=query)
