import uuid
from datetime import datetime
import json
from app.models.schemas.products.product_schemas import ProductCreate, ProductDeleteResponse, ProductListResponse, ProductPublic, ProductQueryParams, ProductResponse, ProductUpdate
from app.enums.status import StatusEnum
from fastapi import HTTPException, Request
from sqlalchemy import or_
from sqlmodel import Session, select, func
from starlette import status
from typing import List, Optional, Tuple
from sqlalchemy.orm import aliased

from app.models.models import Norms, Products, Units

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
            conditions.append(
                or_(
                    Products.product_code.ilike(f"%{query.search}%"),
                    Products.product_name.ilike(f"%{query.search}%"),
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
    def create(
        *,
        session: Session,
        product: ProductCreate,
    ) -> ProductPublic:
        existing = session.exec(
            select(Products).where(Products.product_code == product.product_code)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product.product_code} already exists.",
            )
        new_product = Products(**product.model_dump())
        session.add(new_product)
        session.commit()
        session.refresh(new_product)

        return ProductPublic.model_validate(new_product)

    @staticmethod
    def update(
        *,
        session: Session,
        product_id: uuid.UUID,
        product_data: ProductUpdate,
    ) -> ProductPublic:
        product = session.get(Products, product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
            )

        update_data = product_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)

        session.commit()
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