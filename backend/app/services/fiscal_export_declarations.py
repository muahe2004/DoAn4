from typing import List

from sqlalchemy import select, func, exists, or_
from sqlmodel import Session

from app.models.models import ExportDeclarations, ExportDeclarationDetails, Products
from app.models.schemas.exports.export_declaration_requests_schemas import (
    ExportDeclarationListResponse,
    ExportDeclarationHeaderResponse,
    ExportDeclarationQueryParams,
)


class FiscalExportDeclarationServices:
    @staticmethod
    def get_list(
        *,
        session: Session,
        query: ExportDeclarationQueryParams,
    ) -> ExportDeclarationListResponse:
        statement = select(ExportDeclarations)
        count_stmt = select(func.count()).select_from(ExportDeclarations)
        conditions = []

        if query.status:
            conditions.append(ExportDeclarations.status == query.status)
        if query.start_date:
            conditions.append(ExportDeclarations.licence_date >= query.start_date)
        if query.end_date:
            conditions.append(ExportDeclarations.licence_date <= query.end_date)
        if query.export_declaration_number:
            normalized = f"%{query.export_declaration_number.strip().upper()}%"
            conditions.append(
                func.upper(ExportDeclarations.export_declaration_number).ilike(normalized)
            )
        if query.product_code:
            normalized = f"%{query.product_code.strip().upper()}%"
            product_filter_exists = exists(
                select(ExportDeclarationDetails.id)
                .join(Products)
                .where(
                    ExportDeclarationDetails.export_declaration_id == ExportDeclarations.id,
                    func.upper(Products.product_code).ilike(normalized),
                )
            )
            conditions.append(product_filter_exists)
        if query.search:
            search_term = f"%{query.search.strip().upper()}%"
            product_search_exists = exists(
                select(ExportDeclarationDetails.id)
                .join(Products)
                .where(
                    ExportDeclarationDetails.export_declaration_id == ExportDeclarations.id,
                    func.upper(Products.product_code).ilike(search_term),
                )
            )
            conditions.append(
                or_(
                    func.upper(ExportDeclarations.export_declaration_number).ilike(search_term),
                    func.upper(ExportDeclarations.importer).ilike(search_term),
                    product_search_exists,
                )
            )

        if conditions:
            statement = statement.where(*conditions)
            count_stmt = count_stmt.where(*conditions)

        total = session.exec(count_stmt).scalar_one()
        rows = (
            session.exec(
                statement.order_by(
                    ExportDeclarations.licence_date.desc(),
                    ExportDeclarations.updated_at.desc(),
                )
                .offset(query.skip)
                .limit(query.limit)
            )
            .scalars()
            .all()
        )

        data: List[ExportDeclarationHeaderResponse] = [
            ExportDeclarationHeaderResponse(**row.model_dump()) for row in rows
        ]

        return ExportDeclarationListResponse(total=total, data=data)
