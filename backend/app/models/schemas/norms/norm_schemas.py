from datetime import datetime
from sqlmodel import SQLModel, Field, Column, String, DateTime
from sqlalchemy import Column, String, DateTime 
from uuid import UUID

class NormBase(SQLModel):
    norm_name: str = Field(sa_column=Column(String(100), nullable=False))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    created_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False, onupdate=datetime.now))

class NormPublic(NormBase):
    id: UUID

class NormDropdownResponse(SQLModel):
    id: UUID
    norm_name: str

class NormCreate(NormBase):
    pass

class MultiNormCreate(SQLModel):
    norms: list[NormCreate]

class NormUpdate(SQLModel):
    norm_name: str = Field(sa_column=Column(String(100), nullable=False))
    description: str = Field(sa_column=Column(String(500), nullable=True))
    status: str | None = Field(default=None, sa_column=Column(String(50), nullable=True))
    updated_at: datetime = Field(default_factory=datetime.now, sa_column=Column(DateTime, nullable=False))

class NormDeleteResponse(SQLModel):
    message: str
    id: UUID