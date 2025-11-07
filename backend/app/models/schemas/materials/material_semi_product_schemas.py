# Table material_semi_product {
#   material_semi_product_id uuid [primary key, not null]
#   custom_code varchar(100)
#   material_code varchar(100) [not null, ref: > material.material_code]
#   quantity_end double [not null, note: 'Tồn cuối kỳ']
#   quantity_end2 double
#   value_end double [not null]
#   note varchar(500)
#   customer_id uuid [not null, ref: > customer.customer_id]
#   fiscal_year varchar(10) [not null]
#   stock_check_date date [not null]
#   licence_number varchar(50)
#   licence_date date
#   active_flag int [not null]
#   created_by_user_id uuid [not null, ref: > customer.customer_id]
#   created_date_time datetime [not null]
#   lu_updated datetime
#   lu_user_id uuid [ref: > customer.customer_id]
# }

from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, String, Integer, DateTime 
from uuid import UUID

class MaterialSemiProductBase(SQLModel):
    material_code: str = Field(sa_column=Column(String(50), nullable=False))
    material_name: str = Field(sa_column=Column(String(500), nullable=False))
    unit: str = Field(sa_column=Column(String(50), nullable=False))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    country_id: Optional[UUID] | None = Field(default=None, foreign_key="countries.id")
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class MaterialSemiProductPublic(MaterialSemiProductBase):
    id: UUID

# Chưa xong