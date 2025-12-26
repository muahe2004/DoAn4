from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime, Float
from sqlalchemy import Column, String, DateTime, Float
from uuid import UUID
from app.models.schemas.common.query import BaseQueryParams

class NormProductInventoryBase(SQLModel):
    norm_id: UUID = Field(description="ID của định mức")
    product_id: UUID = Field(description="ID của sản phẩm")
    unit_id: UUID = Field(description="ID của đơn vị tính")
    norm_value: float = Field(sa_column=Column(Float, nullable=False), description="Giá trị định mức")
    applied_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    fiscal_year: str = Field(sa_column=Column(String(10), nullable=False), description="Năm tài chính")
    status: str = Field(default="ACTIVE", sa_column=Column(String(50), nullable=False))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class NormProductInventoryPublic(SQLModel):
    id: UUID
    norm_id: UUID
    product_id: UUID
    unit_id: UUID
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
    id: UUID
    material_id: UUID
    material_code: str = Field(description="Mã NVL")
    material_name: str = Field(description="Tên NVL") 
    unit_id: UUID
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

class NormProductInventoryCreate(SQLModel):
    norm_id: UUID
    product_id: UUID
    unit_id: UUID
    norm_value: float
    fiscal_year: str
    status: str = "ACTIVE"

class MultiNormProductInventoryCreate(SQLModel):
    items: List[NormProductInventoryCreate]

class NormProductInventoryUpdate(SQLModel):
    norm_value: Optional[float] = None
    status: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.now)

class ApplyNormsRequest(SQLModel):
    product_ids: List[UUID] = Field(description="Danh sách ID sản phẩm")
    norm_ids: List[UUID] = Field(description="Danh sách ID định mức")
    fiscal_year: str = Field(description="Năm tài chính áp dụng")
    override_existing: bool = Field(default=False, description="Ghi đè nếu đã tồn tại")

class ApplyNormsResponse(SQLModel):
    success_count: int = Field(description="Số lượng áp dụng thành công")
    failed_count: int = Field(description="Số lượng thất bại")
    existing_count: int = Field(description="Số lượng đã tồn tại")
    message: str = Field(description="Thông báo kết quả")
    details: List[str] = Field(default=[], description="Chi tiết lỗi nếu có")

class ExportNormProductInventoryRequest(SQLModel):
    search: Optional[str] = None
    status: Optional[str] = None
    fiscal_year: Optional[str] = None
    format: str = Field(default="excel", description="Định dạng xuất: excel, pdf")

class NormProductInventoryDeleteResponse(SQLModel):
    message: str
    id: UUID

class NormProductInventorySummary(SQLModel):
    total_products: int = Field(description="Tổng số sản phẩm có định mức")
    total_norms: int = Field(description="Tổng số định mức được áp dụng")
    active_count: int = Field(description="Số lượng đang hoạt động")
    inactive_count: int = Field(description="Số lượng không hoạt động")
    fiscal_years: List[str] = Field(description="Danh sách năm tài chính")