from datetime import datetime, timedelta

from sqlalchemy import func, or_
from sqlmodel import Session, select

from app.models.models import (
    ExportDeclarationDetails,
    ExportDeclarations,
    ImportDeclarationDetails,
    ImportDeclarations,
    ProductStores,
    Products,
    NormDetails,
    Units,
)
from app.models.schemas.reports.product_inventory_report_schemas import (
    ProductInventorySettlementQueryParams,
    ProductInventorySettlementResponse,
    ProductInventorySettlementRow,
)


class ProductInventoryReportServices:
    @staticmethod
    def get_product_inventory_report(
        session: Session, query: ProductInventorySettlementQueryParams
    ) -> ProductInventorySettlementResponse:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)

        base_conditions = []
        if query.search:
            search_text = f"%{query.search.strip().upper()}%"
            base_conditions.append(
                or_(
                    func.upper(Products.product_code).ilike(search_text),
                    func.upper(Products.product_name).ilike(search_text),
                )
            )

        product_stmt = (
            select(
                Products.id,
                Products.product_code,
                Products.product_name,
                Units.unit_name,
            )
            .join(Units, Units.id == Products.unit_id)
        )
        count_stmt = select(func.count()).select_from(Products)

        if base_conditions:
            product_stmt = product_stmt.where(*base_conditions)
            count_stmt = count_stmt.where(*base_conditions)

        total = session.exec(count_stmt).one()

        product_stmt = (
            product_stmt.order_by(Products.product_code.asc())
            .offset(query.skip)
            .limit(query.limit)
        )
        product_rows = session.exec(product_stmt).all()

        if not product_rows:
            return ProductInventorySettlementResponse(
                start_date=start_date,
                end_date=end_date,
                total=total,
                data=[],
            )

        product_ids = [row.id for row in product_rows]

        # Opening quantity from ProductStores (latest record)
        latest_store_subq = (
            select(
                ProductStores.product_id,
                func.max(ProductStores.created_at).label("latest_created_at"),
            )
            .where(ProductStores.product_id.in_(product_ids))
            .group_by(ProductStores.product_id)
            .subquery()
        )

        opening_stmt = (
            select(
                ProductStores.product_id,
                func.coalesce(func.sum(ProductStores.quantity_on_hand), 0).label(
                    "opening_quantity"
                ),
            )
            .join(
                latest_store_subq,
                (ProductStores.product_id == latest_store_subq.c.product_id)
                & (ProductStores.created_at == latest_store_subq.c.latest_created_at),
            )
            .group_by(ProductStores.product_id)
        )
        opening_map = {
            row.product_id: row.opening_quantity
            for row in session.exec(opening_stmt).all()
        }

        # Production quantity - calculated from material consumption (reverse of material export logic)
        production_stmt = (
            select(
                Products.id.label("product_id"),
                func.coalesce(
                    func.sum(
                        func.coalesce(ImportDeclarationDetails.quantity, 0)
                        / NormDetails.norm_value
                    ),
                    0,
                ).label("production_quantity"),
            )
            .select_from(ImportDeclarationDetails)
            .join(
                ImportDeclarations,
                ImportDeclarations.id == ImportDeclarationDetails.import_declaration_id,
            )
            .join(NormDetails, NormDetails.material_id == ImportDeclarationDetails.material_id)
            .join(Products, Products.norm_id == NormDetails.norm_id)
            .where(
                Products.id.in_(product_ids),
                ImportDeclarations.licence_date >= start_date,
                ImportDeclarations.licence_date <= end_date,
            )
            .group_by(Products.id)
        )
        production_map = {
            row.product_id: row.production_quantity
            for row in session.exec(production_stmt).all()
        }

        # Export quantity - direct from ExportDeclarationDetails
        export_stmt = (
            select(
                ExportDeclarationDetails.product_id,
                func.coalesce(func.sum(ExportDeclarationDetails.quantity), 0).label(
                    "export_quantity"
                ),
            )
            .join(
                ExportDeclarations,
                ExportDeclarations.id == ExportDeclarationDetails.export_declaration_id,
            )
            .where(
                ExportDeclarationDetails.product_id.in_(product_ids),
                ExportDeclarations.licence_date >= start_date,
                ExportDeclarations.licence_date <= end_date,
            )
            .group_by(ExportDeclarationDetails.product_id)
        )
        export_map = {
            row.product_id: row.export_quantity
            for row in session.exec(export_stmt).all()
        }

        data: list[ProductInventorySettlementRow] = []
        for row in product_rows:
            opening_quantity = float(opening_map.get(row.id, 0) or 0)
            production_quantity = float(production_map.get(row.id, 0) or 0)
            export_quantity = float(export_map.get(row.id, 0) or 0)
            closing_quantity = opening_quantity + production_quantity - export_quantity

            data.append(
                ProductInventorySettlementRow(
                    product_id=row.id,
                    product_code=row.product_code,
                    product_name=row.product_name,
                    unit_name=row.unit_name,
                    opening_quantity=opening_quantity,
                    production_quantity=production_quantity,
                    export_quantity=export_quantity,
                    closing_quantity=closing_quantity,
                )
            )

        return ProductInventorySettlementResponse(
            start_date=start_date,
            end_date=end_date,
            total=total,
            data=data,
        )