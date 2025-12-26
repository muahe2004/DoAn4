from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import delete, exists, func, or_
from sqlalchemy.orm import aliased
from sqlmodel import Session, select
from starlette import status

from app.enums.status import StatusEnum
from app.models.models import (
    Countries,
    ExportDeclarationDetails,
    ExportDeclarations,
    Partners,
    Products,
    Units,
)
from app.models.schemas.exports.export_declaration_requests_schemas import (
    ExportDeclarationCreate,
    ExportDeclarationDetailPayload,
    ExportDeclarationDetailResponse,
    ExportDeclarationDetailView,
    ExportDeclarationHeaderResponse,
    ExportDeclarationImportRequest,
    ExportDeclarationListResponse,
    ExportDeclarationQueryParams,
    ExportDeclarationUpdate,
)
from app.models.schemas.products.product_schemas import ProductCreate
from app.services.countries import CountryServices
from app.services.partners import PartnerServices
from app.services.products import ProductServices
from app.services.units import UnitServices


class ExportDeclarationServices:
    DEFAULT_UNIT_NAME = "PCE"
    DEFAULT_NORM_NAME = "Định mức tờ khai xuất"
    DEFAULT_IMPORTER_NAME = "Doanh nghiệp nội bộ"

    @staticmethod
    def list(
        session: Session, query: ExportDeclarationQueryParams
    ) -> ExportDeclarationListResponse:
        statement = select(ExportDeclarations)
        count_stmt = select(func.count()).select_from(ExportDeclarations)

        conditions = []
        if query.start_date:
            conditions.append(ExportDeclarations.licence_date >= query.start_date)
        if query.end_date:
            conditions.append(ExportDeclarations.licence_date <= query.end_date)
        if query.export_declaration_number:
            conditions.append(
                func.upper(ExportDeclarations.export_declaration_number).ilike(
                    f"%{query.export_declaration_number.strip().upper()}%"
                )
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
                    product_search_exists,
                )
            )

        if conditions:
            statement = statement.where(*conditions)
            count_stmt = count_stmt.where(*conditions)

        total = session.exec(count_stmt).one()

        statement = (
            statement.order_by(ExportDeclarations.licence_date.desc(), ExportDeclarations.updated_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        rows = session.exec(statement).all()
        data = [ExportDeclarationHeaderResponse(**row.model_dump()) for row in rows]

        return ExportDeclarationListResponse(total=total, data=data)

    @staticmethod
    def get_detail(session: Session, export_declaration_id: UUID) -> ExportDeclarationDetailView:
        declaration = session.get(ExportDeclarations, export_declaration_id)
        if not declaration:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tờ khai không tồn tại")

        unit_primary = Units
        unit_secondary = aliased(Units)

        statement = (
            select(
                ExportDeclarationDetails.id.label("id"),
                ExportDeclarationDetails.hs_code,
                Products.product_code,
                Products.product_name,
                Countries.country_name.label("origin_country_name"),
                ExportDeclarationDetails.quantity,
                ExportDeclarationDetails.quantity2,
                ExportDeclarationDetails.unit_price,
                ExportDeclarationDetails.unit_price_transport,
                ExportDeclarationDetails.invoice_value,
                ExportDeclarationDetails.taxable_price,
                unit_primary.unit_name.label("unit_name"),
                unit_secondary.unit_name.label("unit_name_2"),
                ExportDeclarationDetails.status.label("status"),
            )
            .join(Products, Products.id == ExportDeclarationDetails.product_id)
            .join(Countries, Countries.id == ExportDeclarationDetails.origin_country_id)
            .join(unit_primary, unit_primary.id == ExportDeclarationDetails.unit_id)
            .outerjoin(unit_secondary, unit_secondary.id == ExportDeclarationDetails.unit_id_2)
            .where(ExportDeclarationDetails.export_declaration_id == export_declaration_id)
        )

        detail_rows = session.exec(statement).all()
        details = [ExportDeclarationDetailResponse(**row._mapping) for row in detail_rows]

        header = ExportDeclarationHeaderResponse(
            id=declaration.id,
            export_declaration_number=declaration.export_declaration_number,
            licence_number=declaration.licence_number,
            licence_date=declaration.licence_date,
            bill_number=declaration.bill_number,
            importer=ExportDeclarationServices._resolve_header_importer_name(session, declaration),
            importer_id=declaration.importer_id,
            usd_exchange_rate=declaration.usd_exchange_rate,
            currency_id=declaration.currency_id,
            type_declaration=declaration.type_declaration,
            type_inventory=declaration.type_inventory,
            shipping_term=declaration.shipping_term,
            status=declaration.status,
            created_at=declaration.created_at,
            updated_at=declaration.updated_at,
        )

        return ExportDeclarationDetailView(header=header, details=details)

    @staticmethod
    def create(session: Session, payload: ExportDeclarationCreate) -> ExportDeclarationDetailView:
        if not payload.details:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cần ít nhất một dòng hàng hóa")

        existing = session.exec(
            select(ExportDeclarations).where(
                func.upper(ExportDeclarations.export_declaration_number) == payload.export_declaration_number.strip().upper()
            )
        ).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tờ khai đã tồn tại")

        importer_name = payload.importer or ExportDeclarationServices.DEFAULT_IMPORTER_NAME
        importer_id = ExportDeclarationServices._resolve_importer_id(
            session,
            importer_id=payload.importer_id,
            importer_name=importer_name,
        )
        unique_importer = ExportDeclarationServices._ensure_unique_importer_value(
            session, importer_name
        )

        declaration = ExportDeclarations(
            export_declaration_number=payload.export_declaration_number.strip(),
            licence_number=payload.licence_number,
            licence_date=payload.licence_date or datetime.now(),
            bill_number=payload.bill_number,
            importer=unique_importer,
            importer_id=importer_id,
            usd_exchange_rate=payload.usd_exchange_rate,
            currency_id=payload.currency_id,
            type_declaration=payload.type_declaration,
            type_inventory=payload.type_inventory,
            shipping_term=payload.shipping_term,
            status=payload.status or "draft",
        )

        session.add(declaration)
        session.flush()

        ExportDeclarationServices._create_details(session, declaration.id, payload.details)

        session.commit()
        session.refresh(declaration)

        return ExportDeclarationServices.get_detail(session, declaration.id)

    @staticmethod
    def update(
        session: Session,
        export_declaration_id: UUID,
        payload: ExportDeclarationUpdate,
    ) -> ExportDeclarationDetailView:
        declaration = session.get(ExportDeclarations, export_declaration_id)
        if not declaration:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tờ khai không tồn tại")
        if declaration.status == "posted":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Không được sửa tờ khai đã posted")

        update_data = payload.model_dump(exclude_unset=True)
        details_payload = update_data.pop("details", None)

        if "importer_id" in update_data or "importer" in update_data:
            importer_name = update_data.get("importer")
            if not importer_name and declaration.importer_id:
                partner = session.get(Partners, declaration.importer_id)
                importer_name = partner.partner_name if partner else declaration.importer
            importer_name = importer_name or declaration.importer
            import_id = ExportDeclarationServices._resolve_importer_id(
                session, importer_id=update_data.get("importer_id"), importer_name=importer_name
            )
            unique_importer = ExportDeclarationServices._ensure_unique_importer_value(
                session, importer_name, exclude_id=export_declaration_id
            )
            update_data["importer_id"] = import_id
            update_data["importer"] = unique_importer

        for field, value in update_data.items():
            setattr(declaration, field, value)

        if details_payload is not None:
            session.exec(
                delete(ExportDeclarationDetails).where(
                    ExportDeclarationDetails.export_declaration_id == export_declaration_id
                )
            )
            session.flush()
            if not details_payload:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cần ít nhất một dòng hàng hóa",
                )
            normalized_details = ExportDeclarationServices._normalize_detail_payloads(
                details_payload
            )
            ExportDeclarationServices._create_details(
                session, export_declaration_id, normalized_details
            )

        session.commit()
        session.refresh(declaration)

        return ExportDeclarationServices.get_detail(session, export_declaration_id)

    @staticmethod
    def post(session: Session, export_declaration_id: UUID) -> ExportDeclarationDetailView:
        declaration = session.get(ExportDeclarations, export_declaration_id)
        if not declaration:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tờ khai không tồn tại")
        if declaration.status == "posted":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tờ khai đã được post")

        detail_exists = session.exec(
            select(ExportDeclarationDetails).where(
                ExportDeclarationDetails.export_declaration_id == export_declaration_id
            )
        ).first()

        if not detail_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tờ khai phải có ít nhất một dòng trước khi post",
            )

        declaration.status = "posted"
        session.commit()
        session.refresh(declaration)

        return ExportDeclarationServices.get_detail(session, export_declaration_id)

    @staticmethod
    def import_declarations(
        session: Session, payload: ExportDeclarationImportRequest
    ) -> List[ExportDeclarationHeaderResponse]:
        created = []
        for declaration_payload in payload.declarations:
            detail_view = ExportDeclarationServices.create(session, declaration_payload)
            created.append(detail_view.header)
        return created

    @staticmethod
    def _resolve_importer_id(
        session: Session, *, importer_id: Optional[UUID], importer_name: Optional[str]
    ) -> UUID:
        if importer_id:
            importer = session.get(Partners, importer_id)
            if not importer:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Người khai không tồn tại")
            return importer.id

        default_country = CountryServices.ensure_default_country(session)
        return PartnerServices.resolve_partner_generic(
            session,
            partner_name=importer_name or ExportDeclarationServices.DEFAULT_IMPORTER_NAME,
            country_id=default_country.id,
        )

    @staticmethod
    def _ensure_unique_importer_value(
        session: Session, importer_value: str, exclude_id: Optional[UUID] = None
    ) -> str:
        base = importer_value.strip() or ExportDeclarationServices.DEFAULT_IMPORTER_NAME
        candidate = base
        suffix = 1
        while True:
            query = select(ExportDeclarations).where(ExportDeclarations.importer == candidate)
            if exclude_id:
                query = query.where(ExportDeclarations.id != exclude_id)
            exists = session.exec(query).first()
            if not exists:
                return candidate
            candidate = f"{base}#{suffix}"
            suffix += 1

    @staticmethod
    def _resolve_header_importer_name(session: Session, declaration: ExportDeclarations) -> str:
        if declaration.importer_id:
            partner = session.get(Partners, declaration.importer_id)
            if partner and partner.partner_name:
                return partner.partner_name
        return declaration.importer

    @staticmethod
    def _resolve_product_id(session: Session, detail_payload: ExportDeclarationDetailPayload) -> UUID:
        normalized_code = detail_payload.product_code.strip()
        if not normalized_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mã hàng hóa là bắt buộc")

        existing = session.exec(
            select(Products).where(func.upper(Products.product_code) == normalized_code.upper())
        ).first()
        if existing:
            return existing.id

        product_name = (detail_payload.product_name or normalized_code).strip()
        unit_name = (
            detail_payload.unit_name
            or detail_payload.unit_name_2
            or ExportDeclarationServices.DEFAULT_UNIT_NAME
        )
        norm_name = detail_payload.product_name or ExportDeclarationServices.DEFAULT_NORM_NAME

        payload = ProductCreate(
            product_code=normalized_code,
            product_name=product_name,
            unit_name=unit_name,
            unit_name_2=detail_payload.unit_name_2 or unit_name,
            norm_name=norm_name,
            description="Sản phẩm được tạo tự động từ tờ khai xuất",
            is_semi_product=False,
            status=StatusEnum.ACTIVE,
        )

        new_product = ProductServices.create(session=session, product=payload)
        return new_product.id

    @staticmethod
    def _create_details(
        session: Session, export_id: UUID, payloads: List[ExportDeclarationDetailPayload]
    ) -> None:
        created_details = []
        for payload in payloads:
            product_id = ExportDeclarationServices._resolve_product_id(session, payload)
            origin_country_id = CountryServices.resolve_country_generic(
                session,
                country_id=payload.origin_country_id,
                country_name=payload.origin_country_name,
                country_code=payload.origin_country_code,
            )

            unit_name = (
                payload.unit_name
                or payload.unit_name_2
                or ExportDeclarationServices.DEFAULT_UNIT_NAME
            )
            resolved_unit_id = UnitServices.resolve_unit_generic(
                session,
                payload.unit_id,
                unit_name,
            )
            resolved_unit_id_2 = UnitServices.resolve_unit_generic(
                session,
                payload.unit_id_2,
                payload.unit_name_2 or unit_name,
            )

            detail = ExportDeclarationDetails(
                export_declaration_id=export_id,
                hs_code=payload.hs_code,
                product_id=product_id,
                origin_country_id=origin_country_id,
                unit_id=resolved_unit_id,
                unit_id_2=resolved_unit_id_2,
                quantity=payload.quantity,
                quantity2=payload.quantity2,
                unit_price=payload.unit_price,
                unit_price_transport=payload.unit_price_transport,
                invoice_value=payload.invoice_value,
                taxable_price=payload.taxable_price,
                status=payload.status,
            )
            created_details.append(detail)

        session.add_all(created_details)
        session.flush()

    @staticmethod
    def _normalize_detail_payloads(
        raw_payloads: List[ExportDeclarationDetailPayload | dict],
    ) -> List[ExportDeclarationDetailPayload]:
        normalized = []
        for payload in raw_payloads:
            if isinstance(payload, ExportDeclarationDetailPayload):
                normalized.append(payload)
            else:
                normalized.append(ExportDeclarationDetailPayload(**payload))
        return normalized
