from pydantic import root_validator
from typing import Optional, Any, Dict
from sqlmodel import SQLModel, Field


class BaseQueryParams(SQLModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(10, ge=1)
    status: Optional[str] = Field(None)
    search: Optional[str] = Field(None)

    @root_validator(pre=True)
    def clamp_skip(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        skip = values.get("skip")
        if skip is None:
            return values
        try:
            skip_value = int(skip)
        except (TypeError, ValueError):
            return values
        values["skip"] = max(skip_value, 0)
        return values
