import uuid
from datetime import datetime
import json
from app.models.schemas.products.product_schemas import ProductCreate, ProductDeleteResponse, ProductListResponse, ProductPublic, ProductQueryParams, ProductResponse, ProductUpdate
from app.enums.status import StatusEnum
from app.models.schemas.materials.material_schemas import MaterialDeleteResponse, MaterialListResponse, MaterialPublic, MaterialQueryParams, MaterialUpdate
from fastapi import HTTPException, Request
from sqlalchemy import or_
from sqlmodel import Session, select, func
from starlette import status
from typing import List, Optional, Tuple
from sqlalchemy.orm import aliased

from app.models.models import Countries, Currencies, ImportDeclarations, Materials, Norms, Products, Units
from app.models.schemas.imports.import_declaration_schemas import ImportDeclarationCreate, ImportDeclarationListResponse, ImportDeclarationPublic, ImportDeclarationQueryParams
from app.models.schemas.imports.import_declaration_details_schemas import ImportDeclarationDetailCreate
from app.services.units import UnitServices
from app.services.materials import MaterialServices
from app.services.import_declaration_details import ImportDeclarationDetailServices

class ImportDeclarationServices:

    @staticmethod
    def get_all(*, session: Session, query: ImportDeclarationQueryParams) -> ImportDeclarationListResponse:

        statement = (
            select(
                ImportDeclarations.id,
                ImportDeclarations.import_declaration_number,
                ImportDeclarations.licence_number,
                ImportDeclarations.licence_date,
                ImportDeclarations.bill_number,
                ImportDeclarations.exporter,
                ImportDeclarations.exporter_id,
                ImportDeclarations.usd_exchange_rate,
                ImportDeclarations.currency_id,
                Currencies.currency_name,
                ImportDeclarations.type_declaration,
                ImportDeclarations.type_inventory,
                ImportDeclarations.shipping_term,
                ImportDeclarations.shipping_fee,
                ImportDeclarations.status,
                ImportDeclarations.created_at,
                ImportDeclarations.updated_at,
            )
            .join(Currencies, Currencies.id == ImportDeclarations.currency_id)
        )

        conditions = []
        if query.status:
            conditions.append(ImportDeclarations.status == query.status)
        if query.exporter_id:
            conditions.append(ImportDeclarations.exporter_id == query.exporter_id)
        if query.search:
            search_text = f"%{query.search}%"
            conditions.append(
                or_(
                    func.unaccent(ImportDeclarations.import_declaration_number).ilike(func.unaccent(search_text)),
                )
            )
        
        if conditions:
            statement = statement.where(*conditions)

        count_stmt = select(func.count()).select_from(ImportDeclarations)
        if conditions:
            count_stmt = count_stmt.where(*conditions)

        total = session.exec(count_stmt).one()

        statement = (
            statement.order_by(ImportDeclarations.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        results = session.exec(statement).all()

        detail_map = ImportDeclarationDetailServices.get_by_import_declaration_ids(
            session=session,
            import_declaration_ids=[row.id for row in results],
        )

        data = []
        for row in results:
            item = dict(row._mapping)
            item["details"] = detail_map.get(row.id, [])
            data.append(item)

        return data, total    
    
    @staticmethod
    def create(
        *,
        session: Session,
        import_declaration: ImportDeclarationCreate,
    ) -> ImportDeclarationPublic:
        existing = session.exec(
            select(ImportDeclarations).where(ImportDeclarations.import_declaration_number == import_declaration.import_declaration_number)
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Import declaration {import_declaration.import_declaration_number} already exists.",
            )
    
        declaration_data = import_declaration.model_dump(exclude={"materials"})
        if not declaration_data.get("licence_date"):
            declaration_data["licence_date"] = datetime.now()
        new_import_declaration = ImportDeclarations(**declaration_data)
        session.add(new_import_declaration)
        session.commit()
        session.refresh(new_import_declaration)

        new_import_declaration_id = new_import_declaration.id
        if new_import_declaration_id:
            print(new_import_declaration_id)
            for idx, material in enumerate(import_declaration.materials, start=1):

                material.unit_id = UnitServices.resolve_unit_generic(session, material.unit_id, material.unit_name)
                if material.unit_id_2 or material.unit_name_2:
                    material.unit_id_2 = UnitServices.resolve_unit_generic(
                        session, material.unit_id_2, material.unit_name_2
                    )
                material_id = MaterialServices.resolve_material_generic(
                    session,
                    None,
                    material.material_code,
                    material.material_name,
                    material.unit_id,
                    material.description,
                    material.country_id,
                )
                if not material.country_id:
                    raise HTTPException(
                        status_code=400,
                        detail="country_id must be provided for import declaration details.",
                    )

                detail_payload = ImportDeclarationDetailCreate(
                    hs_code=material.material_code,
                    import_declaration_id=new_import_declaration_id,
                    material_id=material_id,
                    origin_country_id=material.country_id,
                    unit_id=material.unit_id,
                    unit_id_2=material.unit_id_2,
                    quantity=getattr(material, "quantity", None),
                    quantity2=getattr(material, "quantity2", getattr(material, "quantity_2", None)),
                    unit_price=getattr(material, "unit_price", None),
                    unit_price_transport=getattr(material, "unit_price_transport", None),
                    status=material.status,
                )
                ImportDeclarationDetailServices.create(
                    session=session,
                    import_declaration=detail_payload,
                )

        return ImportDeclarationPublic.model_validate(new_import_declaration)
