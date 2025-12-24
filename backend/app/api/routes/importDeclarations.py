import uuid

from app.models.schemas.products.product_schemas import ProductCreate, ProductDeleteResponse, ProductListResponse, ProductPublic, ProductQueryParams, ProductUpdate
from fastapi import APIRouter, Depends, Request
from app.api.deps import SessionDep
from app.services.products import ProductServices
from typing import List

from app.models.schemas.imports.import_declaration_schemas import ImportDeclarationCreate, ImportDeclarationPublic
from app.models.models import ImportDeclarations
from app.services.import_declaration import ImportDeclarationServices

router = APIRouter()

# # =========================== get all products ===========================
# @router.get("")
# def get_products(session: SessionDep, query: ProductQueryParams = Depends()):
#     data, total = ProductServices.get_all(session=session,query=query)
#     return ProductListResponse(total=total, data=data)

# =========================== add product ===========================
@router.post(
    "",
    response_model=ImportDeclarationPublic,
)
def create_import_declaration(
    request: Request, session: SessionDep, import_declaration: ImportDeclarationCreate
) -> ImportDeclarationPublic:
    return ImportDeclarationServices.create(session=session, import_declaration=import_declaration)