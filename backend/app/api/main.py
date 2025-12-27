from fastapi import APIRouter
from app.api.routes import (
    healthCheck,
    products,
    materials,
    users,
    login,
    units,
    norms,
    exports,
    importDeclarations,
    countries,
    partners,
    currencies,
    norm_product_inventorys,
    product_inventorys,
    material_inventorys,
    stores,
    settlementReports,
)

api_router = APIRouter()

api_router.include_router(healthCheck.router, prefix="/healthCheck", tags=["healthCheck"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(materials.router, prefix="/materials", tags=["materials"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(units.router, prefix="/units", tags=["units"])
api_router.include_router(norms.router, prefix="/norms", tags=["norms"])
api_router.include_router(exports.router, prefix="/export-declarations", tags=["ExportDeclarations"])
api_router.include_router(countries.router, prefix="/countries", tags=["countries"])
api_router.include_router(partners.router, prefix="/partners", tags=["partners"])
api_router.include_router(currencies.router, prefix="/currencies", tags=["currencies"])
api_router.include_router(norm_product_inventorys.router, prefix="/norm-product-inventorys", tags=["norm-product-inventorys"])
api_router.include_router(product_inventorys.router, prefix="/product-inventorys", tags=["product-inventorys"])
api_router.include_router(material_inventorys.router, prefix="/material-inventorys", tags=["material-inventorys"])
api_router.include_router(stores.router, prefix="/stores", tags=["stores"])
api_router.include_router(importDeclarations.router, prefix="/import_declarations", tags=["import_declarations"])
api_router.include_router(settlementReports.router, prefix="/settlement-reports", tags=["settlement-reports"])
