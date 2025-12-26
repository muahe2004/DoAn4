from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, String, DateTime 
from uuid import UUID
from app.enums.status import StatusEnum
from .norm_detail_schemas import NormDetailPublic, NormDetailCreate

class NormBase(SQLModel):
    norm_name: str = Field(sa_column=Column(String(100), nullable=False))
    description: str | None = Field(default=None, sa_column=Column(String(500), nullable=True))
    status: str | None = Field(default=StatusEnum.ACTIVE, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class NormPublic(NormBase):
    id: UUID
    norm_details: List[NormDetailPublic] = []

class NormDropdownResponse(SQLModel):
    id: UUID
    norm_name: str

class NormCreate(NormBase):
    norm_details: List[NormDetailCreate] = []

class MultiNormCreate(SQLModel):
    norms: list[NormCreate]

class NormUpdate(SQLModel):
    norm_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    norm_details: Optional[List[NormDetailCreate]] = None

class NormDeleteResponse(SQLModel):
    message: str
    id: UUID