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

from app.models.models import Countries, ImportDeclarations, Materials, Norms, Products, Units
from app.models.schemas.imports.import_declaration_schemas import ImportDeclarationCreate, ImportDeclarationPublic
from app.models.schemas.imports.import_declaration_details_schemas import ImportDeclarationDetailCreate
from app.services.units import UnitServices
from app.services.materials import MaterialServices
from app.services.import_declaration_details import ImportDeclarationDetailServices

class ImportDeclarationServices:
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
    
        new_import_declaration = ImportDeclarations(**import_declaration.model_dump(exclude={"materials"}))
        session.add(new_import_declaration)
        session.commit()
        session.refresh(new_import_declaration)

        new_import_declaration_id = new_import_declaration.id
        if new_import_declaration_id:
            print(new_import_declaration_id)
            for idx, material in enumerate(import_declaration.materials, start=1):

                material.unit_id = UnitServices.resolve_unit_generic(session, material.unit_id, material.unit_name)
                material.unit_id_2 = UnitServices.resolve_unit_generic(session, material.unit_id_2, material.unit_name_2)
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
                    unit=material.unit_name,
                    unit2=material.unit_name_2,
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

                # print(f"[{idx}]")
                # print("  material_code :", material.material_code)
                # print("  material_name :", material.material_name)
                # print("  material_id   :", material_id)
                # print("  unit_id       :", material.unit_id)
                # print("  unit_name     :", material.unit_name)
                # print("  unit_id_2     :", material.unit_id_2)
                # print("  unit_name_2   :", material.unit_name_2)
                # print("  description   :", material.description)
                # print("  country_id    :", material.country_id)
                # print("  status        :", material.status)

        return ImportDeclarationPublic.model_validate(new_import_declaration)

    # đầu tiên thêm thông tin tờ khai để lấy id của nó 
        # sau đó cần thêm chi tiết tờ khai
            # 1. ở chi tiết tờ khai có nvl, cần check nvl có tồn tại chưa, nếu chưa thì thêm vào db trước
                # check ở bảng compare_material_code_schemas
                    # if có -> lâý id của nvl ở đó
                    # else -> ko lấy     
            # 2. tách func check tồn tại hay chưa ra ngoài
