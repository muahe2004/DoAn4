import uuid
from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import aliased
from sqlmodel import Session, select
from starlette import status

from app.models.models import ImportDeclarationDetails, ImportDeclarations, Materials, Units, ConvertUnits, MaterialReceiveDetails
from app.models.schemas.imports.import_declaration_details_schemas import (
    ImportDeclarationDetailsPublic
)
from app.models.schemas.common.query import BaseQueryParams


class FiscalImportDeclarationDetailsServices:
    @staticmethod
    def get_list(*, session: Session, query: BaseQueryParams):
        # Alias cho Units để tránh conflict
        StandardUnit = aliased(Units)
        CustomsUnit = aliased(Units)
        
        # Subquery 1: Tính tổng SL theo sổ kế toán
        # GROUP BY material_id, import_declaration_id
        accounting_qty_subquery = (
            select(
                MaterialReceiveDetails.material_id,
                MaterialReceiveDetails.import_declaration_id,
                func.sum(MaterialReceiveDetails.quantity).label('total_accounting_qty')
            )
            .group_by(
                MaterialReceiveDetails.material_id,
                MaterialReceiveDetails.import_declaration_id
            )
            .subquery()
        )
        
        # Query chính: GROUP BY để tránh nhân bản
        # Mỗi (material_id, import_declaration_id) chỉ có 1 dòng
        statement = (
            select(
                ImportDeclarationDetails.id,
                ImportDeclarationDetails.material_id,
                ImportDeclarationDetails.import_declaration_id,
                ImportDeclarationDetails.hs_code,
                ImportDeclarationDetails.unit_price,
                ImportDeclarationDetails.status,
                ImportDeclarationDetails.created_at,
                ImportDeclarationDetails.updated_at,
                ImportDeclarations.import_declaration_number,
                ImportDeclarations.licence_date,
                ImportDeclarations.type_declaration,
                Materials.material_code,
                Materials.material_name,
                StandardUnit.unit_name.label('standard_unit'),
                CustomsUnit.unit_name.label('customs_unit'),
                ConvertUnits.conversion.label('conversion_factor'),
                # SUM quantity từ tờ khai (có thể có nhiều dòng detail cho cùng material)
                func.sum(ImportDeclarationDetails.quantity).label('total_declaration_qty'),
                # MAX accounting_qty (vì subquery đã GROUP đúng, chỉ có 1 giá trị duy nhất)
                func.max(accounting_qty_subquery.c.total_accounting_qty).label('total_accounting_qty')
            )
            .join(ImportDeclarations, ImportDeclarationDetails.import_declaration_id == ImportDeclarations.id)
            .join(Materials, ImportDeclarationDetails.material_id == Materials.id)
            .join(StandardUnit, Materials.unit_id == StandardUnit.id)
            .outerjoin(ConvertUnits, ConvertUnits.source_unit == Materials.unit_id)
            .outerjoin(CustomsUnit, ConvertUnits.target_unit == CustomsUnit.id)
            .outerjoin(
                accounting_qty_subquery,
                (accounting_qty_subquery.c.material_id == ImportDeclarationDetails.material_id) &
                (accounting_qty_subquery.c.import_declaration_id == ImportDeclarationDetails.import_declaration_id)
            )
            .group_by(
                ImportDeclarationDetails.id,
                ImportDeclarationDetails.material_id,
                ImportDeclarationDetails.import_declaration_id,
                ImportDeclarationDetails.hs_code,
                ImportDeclarationDetails.unit_price,
                ImportDeclarationDetails.status,
                ImportDeclarationDetails.created_at,
                ImportDeclarationDetails.updated_at,
                ImportDeclarations.import_declaration_number,
                ImportDeclarations.licence_date,
                ImportDeclarations.type_declaration,
                Materials.material_code,
                Materials.material_name,
                StandardUnit.unit_name,
                CustomsUnit.unit_name,
                ConvertUnits.conversion
            )
        )
        
        # Apply filters
        conditions = []
        if query.status:
            conditions.append(ImportDeclarationDetails.status == query.status)
        if query.search:
            conditions.append(
                ImportDeclarationDetails.hs_code.ilike(f"%{query.search}%")
            )
        
        if conditions:
            statement = statement.where(*conditions)

        # Count total (trước khi phân trang)
        count_stmt = select(func.count()).select_from(
            statement.subquery()
        )
        total = session.exec(count_stmt).one()

        # Apply pagination
        statement = (
            statement.order_by(ImportDeclarationDetails.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        results = session.exec(statement).all()
        
        # Map results to response
        data = []
        for row in results:
            detail_dict = {
                'id': str(row[0]),
                'material_id': str(row[1]),
                'import_declaration_id': str(row[2]),
                'hs_code': row[3],
                'unit_price': row[4],
                'status': row[5],
                'created_at': row[6],
                'updated_at': row[7],
                'import_declaration_number': row[8],
                'licence_date': row[9],
                'type_declaration': row[10],
                'material_code': row[11],
                'material_name': row[12],
                'standard_unit': row[13],
                'customs_unit': row[14],
                'conversion_factor': row[15],
                'quantity': row[16],  # total_declaration_qty (đã SUM)
                'accounting_quantity': row[17] or 0,  # total_accounting_qty (đã GROUP đúng)
            }
            
            # Tính toán động
            quantity = row[16] or 0  # total_declaration_qty
            conversion = row[15] or 1  # conversion_factor
            accounting_qty = row[17] or 0  # total_accounting_qty
            
            # SL THEO TỜ KHAI QUY ĐỔI (1)
            converted_declaration_qty = quantity * conversion
            detail_dict['converted_declaration_quantity'] = converted_declaration_qty
            
            # SL THEO SỔ QUY ĐỔI (2)
            detail_dict['converted_accounting_quantity'] = accounting_qty
            
            # SAI LỆCH = (2) - (1)
            detail_dict['variance'] = accounting_qty - converted_declaration_qty
            
            data.append(detail_dict)
        
        return {
            "data": data,
            "total": total
        }

    @staticmethod
    def get_by_id(*, session: Session, import_declaration_detail_id: uuid.UUID):
        import_declaration_detail = session.get(ImportDeclarationDetails, import_declaration_detail_id)
        
        if not import_declaration_detail:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Import declaration detail not found"
            )
        
        return ImportDeclarationDetailsPublic.model_validate(import_declaration_detail)
