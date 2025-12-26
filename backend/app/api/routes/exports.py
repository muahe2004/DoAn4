import uuid

from fastapi import APIRouter, Depends

from app.api.deps import SessionDep
from app.models.schemas.exports.export_declaration_requests_schemas import (
    ExportDeclarationCreate,
    ExportDeclarationDetailView,
    ExportDeclarationHeaderResponse,
    ExportDeclarationImportRequest,
    ExportDeclarationListResponse,
    ExportDeclarationQueryParams,
    ExportDeclarationUpdate,
)
from app.services.export_declarations import ExportDeclarationServices

router = APIRouter()


@router.get("", response_model=ExportDeclarationListResponse)
def get_export_declarations(session: SessionDep, params: ExportDeclarationQueryParams = Depends()):
    return ExportDeclarationServices.list(session=session, query=params)


@router.get("/{export_declaration_id}", response_model=ExportDeclarationDetailView)
def get_export_declaration_detail(session: SessionDep, export_declaration_id: uuid.UUID):
    return ExportDeclarationServices.get_detail(session=session, export_declaration_id=export_declaration_id)


@router.post("", response_model=ExportDeclarationDetailView)
def create_export_declaration(session: SessionDep, payload: ExportDeclarationCreate):
    return ExportDeclarationServices.create(session=session, payload=payload)


@router.patch("/{export_declaration_id}", response_model=ExportDeclarationDetailView)
def update_export_declaration(
    session: SessionDep,
    export_declaration_id: uuid.UUID,
    payload: ExportDeclarationUpdate,
):
    return ExportDeclarationServices.update(
        session=session, export_declaration_id=export_declaration_id, payload=payload
    )


@router.post("/{export_declaration_id}/post", response_model=ExportDeclarationDetailView)
def post_export_declaration(session: SessionDep, export_declaration_id: uuid.UUID):
    return ExportDeclarationServices.post(session=session, export_declaration_id=export_declaration_id)


@router.post("/import", response_model=list[ExportDeclarationHeaderResponse])
def import_export_declarations(session: SessionDep, payload: ExportDeclarationImportRequest):
    return ExportDeclarationServices.import_declarations(session=session, payload=payload)
