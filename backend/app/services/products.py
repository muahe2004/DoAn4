import uuid
from datetime import datetime
import json
from app.models.schemas.products.product_schemas import (
    ProductCreate,
    ProductDeleteResponse,
    ProductListResponse,
    ProductPublic,
    ProductQueryParams,
    ProductResponse,
    ProductUpdate,
)
from app.models.schemas.units.unit_schemas import UnitCreate
from app.enums.status import StatusEnum
from fastapi import HTTPException, Request
from sqlalchemy import or_
from sqlmodel import Session, select, func
from starlette import status
from typing import List, Optional, Tuple
from sqlalchemy.orm import aliased

from app.models.models import Norms, Products, Units
from app.services.units import UnitServices
from app.models.schemas.norms.norm_schemas import NormCreate
from app.services.norms import NormServices

class ProductServices:
    @staticmethod
    def get_all(*, session: Session, query: ProductQueryParams) -> ProductListResponse:
        Unit1 = aliased(Units)
        Unit2 = aliased(Units)

        statement = (
            select(
                Products.id,
                Products.product_code,
                Products.product_name,
                Products.description,
                Products.unit_id,
                Products.unit_id_2,
                Products.norm_id,
                Products.is_semi_product,
                Products.status,
                Products.created_at,
                Products.updated_at,
                Unit1.unit_name.label("unit_name"),
                Unit2.unit_name.label("unit_name_2"),
                Norms.norm_name,
            )
            .join(Unit1, Unit1.id == Products.unit_id)
            .join(Unit2, Unit2.id == Products.unit_id_2, isouter=True)
            .join(Norms, Norms.id == Products.norm_id)
        )

        conditions = []
        if query.status:
            conditions.append(Products.status == query.status)
        if query.norm_id:
            conditions.append(Products.norm_id == query.norm_id)
        if query.unit_id:
            conditions.append(
                or_(
                    Products.unit_id == query.unit_id,
                    Products.unit_id_2 == query.unit_id
                )
            )
        if query.search:
            search_text = f"%{query.search}%"
            conditions.append(
                or_(
                    func.unaccent(Products.product_code).ilike(func.unaccent(search_text)),
                    func.unaccent(Products.product_name).ilike(func.unaccent(search_text)),
                )
            )
        
        if conditions:
            statement = statement.where(*conditions)

        count_stmt = select(func.count()).select_from(Products)
        if conditions:
            count_stmt = count_stmt.where(*conditions)

        total = session.exec(count_stmt).one()

        statement = (
            statement.order_by(Products.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )

        results = session.exec(statement).all()

        return results, total    

    @staticmethod
    def create(*, session: Session, product: ProductCreate) -> ProductPublic:
        existing = session.exec(
            select(Products).where(Products.product_code == product.product_code)
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Product {product.product_code} already exists.",
            )

        product.unit_id = UnitServices.resolve_unit_generic(session, product.unit_id, product.unit_name)
        product.unit_id_2 = UnitServices.resolve_unit_generic(session, product.unit_id_2, product.unit_name_2)
        product.norm_id = NormServices.resolve_norm_generic(session, product.norm_id, product.norm_name)

        new_product = Products(**product.model_dump())
        session.add(new_product)
        session.commit()
        session.refresh(new_product)

        return ProductPublic.model_validate(new_product)

    @staticmethod
    def update(*, session: Session, product_id: uuid.UUID, product_data: ProductUpdate) -> ProductPublic:
        product = session.get(Products, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        update_data = product_data.model_dump(exclude_unset=True)

        if "unit_id" in update_data or "unit_name" in update_data:
            update_data["unit_id"] = UnitServices.resolve_unit_generic(
                session,
                update_data.get("unit_id"),
                update_data.get("unit_name"),
            )
            update_data.pop("unit_name", None)

        if "unit_id_2" in update_data or "unit_name_2" in update_data:
            update_data["unit_id_2"] = UnitServices.resolve_unit_generic(
                session,
                update_data.get("unit_id_2"),
                update_data.get("unit_name_2"),
            )
            update_data.pop("unit_name_2", None)

        if "norm_id" in update_data or "norm_name" in update_data:
            update_data["norm_id"] = NormServices.resolve_norm_generic(
                session,
                update_data.get("norm_id"),
                update_data.get("norm_name"),
            )
            update_data.pop("norm_name", None)

        for field, value in update_data.items():
            setattr(product, field, value)

        session.commit()
        session.refresh(product)
        return ProductPublic.model_validate(product)


    @staticmethod
    def delete_many(
        *,
        session: Session,
        product_ids: List[uuid.UUID]
    ) -> List[ProductDeleteResponse]:
        results = []

        try:
            for product_id in product_ids:
                product = session.get(Products, product_id)

                if not product:
                    results.append(
                        ProductDeleteResponse(id=str(product_id), message="Product not found")
                    )
                    continue

                if product.status == StatusEnum.ACTIVE:
                    product.status = StatusEnum.INACTIVE
                    message = "Product set to inactive"
                else:
                    message = "Product already inactive"

                results.append(ProductDeleteResponse(id=str(product_id), message=message))

            session.commit()

        except Exception as e:
            session.rollback()
            raise e

        return results