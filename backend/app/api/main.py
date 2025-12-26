from fastapi import APIRouter
from app.api.routes import (
    healthCheck,
    products,
    materials,
    users,
    login,
    units,
    norms,
    fiscal_import_declarations,
    fiscal_import_declaration_details,
    compare_material_codes,
    material_stores
)

api_router = APIRouter()

api_router.include_router(healthCheck.router, prefix="/healthCheck", tags=["healthCheck"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(materials.router, prefix="/materials", tags=["materials"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(units.router, prefix="/units", tags=["units"])
api_router.include_router(norms.router, prefix="/norms", tags=["norms"])
api_router.include_router(fiscal_import_declarations.router, prefix="/fiscal-import-declarations", tags=["fiscal-import-declarations"])
api_router.include_router(fiscal_import_declaration_details.router, prefix="/fiscal-import-declaration-details", tags=["fiscal-import-declaration-details"])
api_router.include_router(compare_material_codes.router, prefix="/compare-material-codes", tags=["compare-material-codes"])
api_router.include_router(material_stores.router, prefix="/material-stores", tags=["material-stores"])

# Import stores separately
try:
    from app.api.routes import stores
    api_router.include_router(stores.router, prefix="/stores", tags=["stores"])
except ImportError:
    pass
