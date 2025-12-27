from fastapi import APIRouter, Depends

from app.api.deps import SessionDep
from app.models.schemas.common.query import BaseQueryParams
from app.services.fiscal_export_declaration_details import (
    FiscalExportDeclarationDetailServices,
)

router = APIRouter()


@router.get("")
def get_fiscal_export_declaration_details(
    session: SessionDep,
    query: BaseQueryParams = Depends(),
):
    return FiscalExportDeclarationDetailServices.get_list(session=session, query=query)
