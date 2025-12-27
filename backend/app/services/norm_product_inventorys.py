from typing import List, Optional, Tuple
import uuid
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import func, and_, or_
from sqlmodel import Session, select, SQLModel, Field
from starlette import status

from app.models.models import Norms, Products, Units, NormDetails, Materials
from app.models.schemas.common.query import BaseQueryParams

# Schemas for norm-product-inventorys (JOIN of multiple tables)
class NormProductInventoryPublic(SQLModel):
    id: uuid.UUID
    norm_id: uuid.UUID
    product_id: uuid.UUID
    unit_id: uuid.UUID
    norm_value: float
    applied_date: datetime
    fiscal_year: str
    status: str
    created_at: datetime
    updated_at: datetime
    norm_name: str = Field(description="Tên định mức")
    norm_description: Optional[str] = Field(default=None, description="Mô tả định mức")
    norm_created_at: datetime = Field(description="Ngày tạo định mức")
    product_code: str = Field(description="Mã sản phẩm")
    product_name: str = Field(description="Tên sản phẩm")
    product_description: Optional[str] = Field(default=None, description="Mô tả sản phẩm")
    unit_name: str = Field(description="Tên đơn vị tính")
    unit_code: Optional[str] = Field(default=None, description="Mã đơn vị tính")

class NormDetailInfo(SQLModel):
    id: uuid.UUID
    material_id: uuid.UUID
    material_code: str = Field(description="Mã NVL")
    material_name: str = Field(description="Tên NVL") 
    unit_id: uuid.UUID
    unit_name: str = Field(description="Đơn vị tính NVL")
    norm_value: float = Field(description="Định mức NVL")
    description: Optional[str] = Field(default=None, description="Mô tả")
    status: str

class NormProductInventoryDetail(NormProductInventoryPublic):
    norm_details: List[NormDetailInfo] = Field(description="Chi tiết định mức (danh sách NVL)")

class NormProductInventoryQueryParams(BaseQueryParams):
    fiscal_year: Optional[str] = Field(None, description="Lọc theo năm tài chính")
    product_code: Optional[str] = Field(None, description="Lọc theo mã sản phẩm")
    norm_name: Optional[str] = Field(None, description="Lọc theo tên định mức")

class NormProductInventorysResponse(SQLModel):
    data: List[NormProductInventoryPublic]
    total: int
    page: int
    limit: int

class ApplyNormsRequest(SQLModel):
    product_ids: List[uuid.UUID] = Field(description="Danh sách ID sản phẩm")
    norm_ids: List[uuid.UUID] = Field(description="Danh sách ID định mức")
    fiscal_year: str = Field(description="Năm tài chính áp dụng")
    override_existing: bool = Field(default=False, description="Ghi đè nếu đã tồn tại")

class ApplyNormsResponse(SQLModel):
    success_count: int = Field(description="Số lượng áp dụng thành công")
    failed_count: int = Field(description="Số lượng thất bại")
    existing_count: int = Field(description="Số lượng đã tồn tại")
    message: str = Field(description="Thông báo kết quả")
    details: List[str] = Field(default=[], description="Chi tiết lỗi nếu có")

class NormProductInventoryDeleteResponse(SQLModel):
    message: str
    id: uuid.UUID

class NormProductInventorySummary(SQLModel):
    total_products: int = Field(description="Tổng số sản phẩm có định mức")
    total_norms: int = Field(description="Tổng số định mức được áp dụng")
    active_count: int = Field(description="Số lượng đang hoạt động")
    inactive_count: int = Field(description="Số lượng không hoạt động")
    fiscal_years: List[str] = Field(description="Danh sách năm tài chính")
from app.enums.status import StatusEnum

class NormProductInventoryServices:
    
    @staticmethod
    def get_all_with_joins(
        *, 
        session: Session, 
        query: NormProductInventoryQueryParams
    ) -> Tuple[List[NormProductInventoryPublic], int]:
        products_with_norms_query = (
            select(
                Products.id.label("product_id"),
                Products.product_code,
                Products.product_name,
                Products.description.label("product_description"),
                Products.status.label("product_status"),
                Products.created_at.label("product_created_at"),
                Products.updated_at.label("product_updated_at"),
                Products.unit_id.label("product_unit_id"),
                Products.norm_id,
                Norms.norm_name,
                Norms.description.label("norm_description"),
                Norms.created_at.label("norm_created_at"),
                Units.unit_name
            )
            .select_from(Products)
            .join(Norms, Products.norm_id == Norms.id)
            .outerjoin(Units, Products.unit_id == Units.id)
            .where(Products.norm_id.isnot(None))
        )
        
        if query.search:
            products_with_norms_query = products_with_norms_query.where(
                or_(
                    Products.product_name.ilike(f"%{query.search}%"),
                    Products.product_code.ilike(f"%{query.search}%")
                )
            )
        if query.product_code:
            products_with_norms_query = products_with_norms_query.where(
                Products.product_code.ilike(f"%{query.product_code}%")
            )
        if query.norm_name:
            products_with_norms_query = products_with_norms_query.where(
                Norms.norm_name.ilike(f"%{query.norm_name}%")
            )
        if query.status:
            products_with_norms_query = products_with_norms_query.where(
                Products.status == query.status
            )
        
        count_query = select(func.count()).select_from(
            products_with_norms_query.subquery()
        )
        total = session.exec(count_query).one()
        
        paginated_query = products_with_norms_query.offset(query.skip).limit(query.limit)
        results = session.exec(paginated_query).all()
        
        norm_product_inventorys = []
        for result in results:
            first_norm_detail = session.exec(
                select(NormDetails.norm_value, NormDetails.created_at)
                .where(NormDetails.norm_id == result.norm_id)
                .limit(1)
            ).first()
            
            norm_product_inventory = NormProductInventoryPublic(
                id=result.product_id,
                norm_id=result.norm_id,
                product_id=result.product_id,
                unit_id=result.product_unit_id,
                norm_value=first_norm_detail.norm_value if first_norm_detail else 1.0,
                applied_date=first_norm_detail.created_at if first_norm_detail else result.product_created_at,
                fiscal_year="2024",
                status=result.product_status,
                created_at=result.product_created_at,
                updated_at=result.product_updated_at,
                norm_name=result.norm_name,
                norm_description=result.norm_description,
                norm_created_at=result.norm_created_at,
                product_code=result.product_code,
                product_name=result.product_name,
                product_description=result.product_description,
                unit_name=result.unit_name or "Unknown",
                unit_code=None
            )
            norm_product_inventorys.append(norm_product_inventory)
        
        return norm_product_inventorys, total
    
    @staticmethod
    def get_all_for_export(
        *, 
        session: Session, 
        search: Optional[str] = None,
        status: Optional[str] = None,
        fiscal_year: Optional[str] = None
    ) -> Tuple[List[NormProductInventoryPublic], int]:
        """Simplified method for export without pagination"""
        products_with_norms_query = (
            select(
                Products.id.label("product_id"),
                Products.product_code,
                Products.product_name,
                Products.description.label("product_description"),
                Products.status.label("product_status"),
                Products.created_at.label("product_created_at"),
                Products.updated_at.label("product_updated_at"),
                Products.unit_id.label("product_unit_id"),
                Products.norm_id,
                Norms.norm_name,
                Norms.description.label("norm_description"),
                Norms.created_at.label("norm_created_at"),
                Units.unit_name
            )
            .select_from(Products)
            .join(Norms, Products.norm_id == Norms.id)
            .outerjoin(Units, Products.unit_id == Units.id)
            .where(Products.norm_id.isnot(None))
        )
        
        if search:
            products_with_norms_query = products_with_norms_query.where(
                or_(
                    Products.product_name.ilike(f"%{search}%"),
                    Products.product_code.ilike(f"%{search}%")
                )
            )
        if status:
            products_with_norms_query = products_with_norms_query.where(
                Products.status == status
            )
        
        results = session.exec(products_with_norms_query).all()
        
        norm_product_inventorys = []
        for result in results:
            first_norm_detail = session.exec(
                select(NormDetails.norm_value, NormDetails.created_at)
                .where(NormDetails.norm_id == result.norm_id)
                .limit(1)
            ).first()
            
            norm_product_inventory = NormProductInventoryPublic(
                id=result.product_id,
                norm_id=result.norm_id,
                product_id=result.product_id,
                unit_id=result.product_unit_id,
                norm_value=first_norm_detail.norm_value if first_norm_detail else 1.0,
                applied_date=first_norm_detail.created_at if first_norm_detail else result.product_created_at,
                fiscal_year=fiscal_year or "2024",
                status=result.product_status,
                created_at=result.product_created_at,
                updated_at=result.product_updated_at,
                norm_name=result.norm_name,
                norm_description=result.norm_description,
                norm_created_at=result.norm_created_at,
                product_code=result.product_code,
                product_name=result.product_name,
                product_description=result.product_description,
                unit_name=result.unit_name or "Unknown",
                unit_code=None
            )
            norm_product_inventorys.append(norm_product_inventory)
        
        return norm_product_inventorys, len(norm_product_inventorys)
    
    @staticmethod
    def get_by_id(*, session: Session, id: uuid.UUID) -> NormProductInventoryDetail:
        product = session.get(Products, id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        if not product.norm_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product does not have a norm assigned"
            )
        
        norm = session.get(Norms, product.norm_id)
        if not norm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Norm not found for this product"
            )
        
        product_unit = session.get(Units, product.unit_id) if product.unit_id else None
        
        norm_details_query = (
            select(
                NormDetails.id.label("norm_detail_id"),
                NormDetails.material_id,
                NormDetails.unit_id.label("material_unit_id"),
                NormDetails.norm_value,
                NormDetails.description.label("norm_detail_description"),
                NormDetails.status.label("norm_detail_status"),
                Materials.material_code,
                Materials.material_name,
                Units.unit_name.label("material_unit_name")
            )
            .select_from(NormDetails)
            .join(Materials, NormDetails.material_id == Materials.id)
            .join(Units, NormDetails.unit_id == Units.id)
            .where(NormDetails.norm_id == norm.id)
        )
        
        norm_details_results = session.exec(norm_details_query).all()
        
        if not norm_details_results:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No norm details found for this norm"
            )
        
        norm_details = []
        for detail in norm_details_results:
            norm_detail_info = NormDetailInfo(
                id=detail.norm_detail_id,
                material_id=detail.material_id,
                material_code=detail.material_code,
                material_name=detail.material_name,
                unit_id=detail.material_unit_id,
                unit_name=detail.material_unit_name,
                norm_value=detail.norm_value,
                description=detail.norm_detail_description,
                status=detail.norm_detail_status or "ACTIVE"
            )
            norm_details.append(norm_detail_info)
        
        first_norm_value = norm_details_results[0].norm_value if norm_details_results else 1.0
        
        return NormProductInventoryDetail(
            id=product.id,
            norm_id=norm.id,
            product_id=product.id,
            unit_id=product.unit_id,
            norm_value=first_norm_value,
            applied_date=norm.created_at,
            fiscal_year="2024",
            status=product.status or "ACTIVE",
            created_at=product.created_at,
            updated_at=product.updated_at,
            norm_name=norm.norm_name,
            norm_description=norm.description,
            norm_created_at=norm.created_at,
            product_code=product.product_code,
            product_name=product.product_name,
            product_description=product.description,
            unit_name=product_unit.unit_name if product_unit else "Unknown",
            unit_code=None,
            norm_details=norm_details
        )
    
    @staticmethod
    def apply_norms_to_products(
        *, 
        session: Session, 
        request: ApplyNormsRequest
    ) -> ApplyNormsResponse:
        success_count = 0
        failed_count = 0
        existing_count = 0
        details = []
        
        try:
            for product_id in request.product_ids:
                for norm_id in request.norm_ids:
                    product = session.get(Products, product_id)
                    norm = session.get(Norms, norm_id)
                    
                    if not product:
                        details.append(f"Product {product_id} not found")
                        failed_count += 1
                        continue
                        
                    if not norm:
                        details.append(f"Norm {norm_id} not found")
                        failed_count += 1
                        continue
                    
                    existing = session.exec(
                        select(NormDetails).where(
                            and_(
                                NormDetails.norm_id == norm_id,
                                NormDetails.material_id == product_id
                            )
                        )
                    ).first()
                    
                    if existing and not request.override_existing:
                        existing_count += 1
                        continue
                    
                    if existing and request.override_existing:
                        existing.updated_at = datetime.now()
                        session.add(existing)
                        success_count += 1
                    else:
                        success_count += 1
            
            session.commit()
            
            return ApplyNormsResponse(
                success_count=success_count,
                failed_count=failed_count,
                existing_count=existing_count,
                message=f"Applied successfully: {success_count}, Failed: {failed_count}, Existing: {existing_count}",
                details=details
            )
            
        except Exception as e:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error applying norms: {str(e)}"
            )
    
    @staticmethod
    def get_summary(*, session: Session) -> NormProductInventorySummary:
        total_products = session.exec(
            select(func.count(func.distinct(NormDetails.material_id)))
            .select_from(NormDetails)
        ).one()
        
        total_norms = session.exec(
            select(func.count(NormDetails.id))
        ).one()
        
        active_count = session.exec(
            select(func.count(NormDetails.id))
            .where(NormDetails.status == StatusEnum.ACTIVE)
        ).one()
        
        inactive_count = total_norms - active_count
        
        return NormProductInventorySummary(
            total_products=total_products,
            total_norms=total_norms,
            active_count=active_count,
            inactive_count=inactive_count,
            fiscal_years=["2024", "2025"]
        )
    
    @staticmethod
    def delete(*, session: Session, id: uuid.UUID) -> NormProductInventoryDeleteResponse:
        norm_detail = session.get(NormDetails, id)
        if not norm_detail:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Norm product inventory not found"
            )
        
        session.delete(norm_detail)
        session.commit()
        
        return NormProductInventoryDeleteResponse(
            message="Norm product inventory deleted successfully",
            id=id
        )