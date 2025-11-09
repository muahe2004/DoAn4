from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, String, Integer, DateTime 
from uuid import UUID

class UnitBase(SQLModel):
    unit_name: str = Field(sa_column=Column(String(100), nullable=False))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    type: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class UnitPublic(UnitBase):
    id: UUID