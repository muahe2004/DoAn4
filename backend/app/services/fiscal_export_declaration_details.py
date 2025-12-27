from sqlalchemy import select, func, or_
from sqlalchemy.orm import aliased
from sqlmodel import Session

from app.models.models import (
    ExportDeclarationDetails,
    ExportDeclarations,
    Products,
    Units,
    ConvertUnits,
)
from app.models.schemas.common.query import BaseQueryParams


class FiscalExportDeclarationDetailServices:
    @staticmethod
    def get_list(*, session: Session, query: BaseQueryParams):
        PrimaryUnit = Units
        SecondaryUnit = aliased(Units)

        statement = (
            select(
                ExportDeclarationDetails.id.label("id"),
                ExportDeclarations.export_declaration_number.label("export_declaration_number"),
                ExportDeclarations.licence_date.label("licence_date"),
                ExportDeclarations.type_declaration.label("type_declaration"),
                ExportDeclarationDetails.hs_code.label("hs_code"),
                Products.product_code.label("product_code"),
                Products.product_name.label("product_name"),
                PrimaryUnit.unit_name.label("unit_name"),
                SecondaryUnit.unit_name.label("unit_name_2"),
                ExportDeclarationDetails.quantity.label("quantity"),
                ExportDeclarationDetails.quantity2.label("quantity2"),
                ExportDeclarationDetails.unit_price.label("unit_price"),
                ExportDeclarationDetails.unit_price_transport.label("unit_price_transport"),
                ExportDeclarationDetails.status.label("status"),
                func.coalesce(ConvertUnits.conversion, 1).label("conversion_factor"),
            )
            .join(ExportDeclarations, ExportDeclarationDetails.export_declaration_id == ExportDeclarations.id)
            .join(Products, Products.id == ExportDeclarationDetails.product_id)
            .join(PrimaryUnit, PrimaryUnit.id == ExportDeclarationDetails.unit_id)
            .outerjoin(SecondaryUnit, SecondaryUnit.id == ExportDeclarationDetails.unit_id_2)
            .outerjoin(
                ConvertUnits,
                (ConvertUnits.source_unit == ExportDeclarationDetails.unit_id)
                & (ConvertUnits.target_unit == ExportDeclarationDetails.unit_id_2),
            )
        )

        conditions = []
        if query.status:
            conditions.append(ExportDeclarationDetails.status == query.status)
        if query.search:
            search_term = f"%{query.search.strip().upper()}%"
            conditions.append(
                or_(
                    func.upper(ExportDeclarationDetails.hs_code).ilike(search_term),
                    func.upper(Products.product_code).ilike(search_term),
                )
            )

        if conditions:
            statement = statement.where(*conditions)

        total = session.exec(
            select(func.count()).select_from(statement.subquery())
        ).scalar_one()

        rows = (
            session.exec(
                statement.order_by(ExportDeclarationDetails.created_at.desc())
                .offset(query.skip)
                .limit(query.limit)
            )
            .all()
        )

        data = []
        for row in rows:
            row_map = row._mapping
            quantity = float(row_map["quantity"] or 0)
            quantity2 = float(row_map["quantity2"] or 0)
            conversion_factor = float(row_map["conversion_factor"] or 1)
            converted_declaration_quantity = quantity * conversion_factor
            converted_accounting_quantity = quantity2
            variance = converted_accounting_quantity - converted_declaration_quantity

            detail = {
                "id": str(row_map["id"]),
                "export_declaration_number": row_map["export_declaration_number"],
                "licence_date": row_map["licence_date"],
                "type_declaration": row_map["type_declaration"],
                "hs_code": row_map["hs_code"],
                "product_code": row_map["product_code"],
                "product_name": row_map["product_name"],
                "unit_name": row_map["unit_name"],
                "unit_name_2": row_map["unit_name_2"],
                "quantity": quantity,
                "quantity2": quantity2,
                "unit_price": row_map["unit_price"],
                "unit_price_transport": row_map["unit_price_transport"],
                "status": row_map["status"],
                "conversion_factor": conversion_factor,
                "converted_declaration_quantity": converted_declaration_quantity,
                "converted_accounting_quantity": converted_accounting_quantity,
                "variance": variance,
            }
            data.append(detail)

        return {"data": data, "total": total}
