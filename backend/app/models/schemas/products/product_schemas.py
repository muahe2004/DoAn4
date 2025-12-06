from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Boolean, Column, ForeignKey, String, Integer, DateTime 
from uuid import UUID

from app.models.schemas.common.query import BaseQueryParams

class ProductBase(SQLModel):
    product_code: str = Field(sa_column=Column(String(50), nullable=False))
    product_name: str = Field(sa_column=Column(String(100), nullable=False))
    unit_id: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    unit_id_2: UUID = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    norm_id: UUID = Field(sa_column=Column(ForeignKey("norms.id"), nullable=False))
    description: Optional[str] = Field(sa_column=Column(String(500), nullable=True))
    is_semi_product: bool = Field(default=True, sa_column=Column(Boolean, nullable=False))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class ProductPublic(ProductBase):
    id: UUID

class ProductQueryParams(BaseQueryParams):
    unit_id: Optional[UUID] = Field(None)
    norm_id: Optional[UUID] = Field(None)
    is_semi_product: Optional[bool] = Field(None)

class ProductResponse(ProductPublic):
    unit_name: str
    unit_name_2: Optional[str] = Field(None)
    norm_name: str

class ProductListResponse(SQLModel):
    total: int
    data: list[ProductResponse]

class ProductCreate(SQLModel):
    product_code: str
    product_name: str
    unit_id: Optional[UUID] = None
    unit_name: Optional[str] = None
    unit_id_2: Optional[UUID] = None
    unit_name_2: Optional[str] = None
    norm_id: Optional[UUID] = None
    norm_name: Optional[str] = None
    description: Optional[str] = None
    is_semi_product: bool = True
    status: Optional[str] = None

class ProductUpdate(SQLModel):
    product_code: Optional[str] = Field(sa_column=Column(String(50), nullable=False))
    product_name: Optional[str] = Field(sa_column=Column(String(100), nullable=False))
    unit_id: Optional[UUID] = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    unit_id_2: Optional[UUID] = Field(sa_column=Column(ForeignKey("units.id"), nullable=False))
    unit_name: Optional[str] = None
    unit_name_2: Optional[str] = None
    norm_id: Optional[UUID] = Field(sa_column=Column(ForeignKey("norms.id"), nullable=False))
    norm_name: Optional[str] = None
    description: Optional[str] = Field(sa_column=Column(String(500), nullable=True))
    is_semi_product: bool = Field(default=True, sa_column=Column(Boolean, nullable=False))
    status: Optional[str] | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class ProductDeleteResponse(SQLModel):
    message: str
    id: UUID