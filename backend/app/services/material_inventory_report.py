from datetime import datetime, timedelta

from sqlalchemy import func, or_
from sqlmodel import Session, select

from app.models.models import (
    ExportDeclarationDetails,
    ExportDeclarations,
    ImportDeclarationDetails,
    ImportDeclarations,
    MaterialStores,
    Materials,
    NormDetails,
    Products,
    Units,
)
from app.models.schemas.reports.material_inventory_report_schemas import (
    MaterialInventorySettlementQueryParams,
    MaterialInventorySettlementResponse,
    MaterialInventorySettlementRow,
)


class MaterialInventoryReportServices:
    @staticmethod
    def get_material_inventory_report(
        session: Session, query: MaterialInventorySettlementQueryParams
    ) -> MaterialInventorySettlementResponse:
        end_date = query.end_date or datetime.now()
        start_date = query.start_date or (end_date - timedelta(days=30))

        base_conditions = []
        if query.search:
            search_text = f"%{query.search.strip().upper()}%"
            base_conditions.append(
                or_(
                    func.upper(Materials.material_code).ilike(search_text),
                    func.upper(Materials.material_name).ilike(search_text),
                )
            )

        material_stmt = (
            select(
                Materials.id,
                Materials.material_code,
                Materials.material_name,
                Units.unit_name,
            )
            .join(Units, Units.id == Materials.unit_id)
        )
        count_stmt = select(func.count()).select_from(Materials)

        if base_conditions:
            material_stmt = material_stmt.where(*base_conditions)
            count_stmt = count_stmt.where(*base_conditions)

        total = session.exec(count_stmt).one()

        material_stmt = (
            material_stmt.order_by(Materials.material_code.asc())
            .offset(query.skip)
            .limit(query.limit)
        )
        material_rows = session.exec(material_stmt).all()

        if not material_rows:
            return MaterialInventorySettlementResponse(
                start_date=start_date,
                end_date=end_date,
                total=total,
                data=[],
            )

        material_ids = [row.id for row in material_rows]

        latest_store_subq = (
            select(
                MaterialStores.material_id,
                func.max(MaterialStores.created_at).label("latest_created_at"),
            )
            .where(MaterialStores.material_id.in_(material_ids))
            .group_by(MaterialStores.material_id)
            .subquery()
        )

        opening_stmt = (
            select(
                MaterialStores.material_id,
                func.coalesce(func.sum(MaterialStores.quantity_on_hand), 0).label(
                    "opening_quantity"
                ),
            )
            .join(
                latest_store_subq,
                (MaterialStores.material_id == latest_store_subq.c.material_id)
                & (MaterialStores.created_at == latest_store_subq.c.latest_created_at),
            )
            .group_by(MaterialStores.material_id)
        )
        opening_map = {
            row.material_id: row.opening_quantity
            for row in session.exec(opening_stmt).all()
        }

        import_stmt = (
            select(
                ImportDeclarationDetails.material_id,
                func.coalesce(func.sum(ImportDeclarationDetails.quantity), 0).label(
                    "import_quantity"
                ),
            )
            .join(
                ImportDeclarations,
                ImportDeclarations.id == ImportDeclarationDetails.import_declaration_id,
            )
            .where(
                ImportDeclarationDetails.material_id.in_(material_ids),
                ImportDeclarations.licence_date >= start_date,
                ImportDeclarations.licence_date <= end_date,
            )
            .group_by(ImportDeclarationDetails.material_id)
        )
        import_map = {
            row.material_id: row.import_quantity
            for row in session.exec(import_stmt).all()
        }

        export_stmt = (
            select(
                NormDetails.material_id,
                func.coalesce(
                    func.sum(
                        func.coalesce(ExportDeclarationDetails.quantity, 0)
                        * NormDetails.norm_value
                    ),
                    0,
                ).label("export_quantity"),
            )
            .select_from(ExportDeclarationDetails)
            .join(Products, Products.id == ExportDeclarationDetails.product_id)
            .join(
                ExportDeclarations,
                ExportDeclarations.id
                == ExportDeclarationDetails.export_declaration_id,
            )
            .join(NormDetails, NormDetails.norm_id == Products.norm_id)
            .where(
                NormDetails.material_id.in_(material_ids),
                ExportDeclarations.licence_date >= start_date,
                ExportDeclarations.licence_date <= end_date,
            )
            .group_by(NormDetails.material_id)
        )
        export_map = {
            row.material_id: row.export_quantity
            for row in session.exec(export_stmt).all()
        }

        data: list[MaterialInventorySettlementRow] = []
        for row in material_rows:
            opening_quantity = float(opening_map.get(row.id, 0) or 0)
            import_quantity = float(import_map.get(row.id, 0) or 0)
            export_quantity = float(export_map.get(row.id, 0) or 0)
            closing_quantity = opening_quantity + import_quantity - export_quantity

            data.append(
                MaterialInventorySettlementRow(
                    material_id=row.id,
                    material_code=row.material_code,
                    material_name=row.material_name,
                    unit_name=row.unit_name,
                    opening_quantity=opening_quantity,
                    import_quantity=import_quantity,
                    export_quantity=export_quantity,
                    closing_quantity=closing_quantity,
                )
            )

        return MaterialInventorySettlementResponse(
            start_date=start_date,
            end_date=end_date,
            total=total,
            data=data,
        )
