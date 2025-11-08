from datetime import datetime
from typing import List, Optional
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, Float, ForeignKey, String, Integer, DateTime 
from uuid import UUID

class ContractBase(SQLModel):
    licence_number: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    licence_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    expiration_licence_date: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=True))
    partner_id: UUID = Field(sa_column=Column(ForeignKey("partners.id"), nullable=False))
    status: str = Field(sa_column=Column(String(50), nullable=False))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class ContractPublic(ContractBase):
    id: UUID