from app.services.norms import NormServices
from app.models.schemas.common.query import BaseQueryParams
from fastapi import APIRouter, Depends
from app.api.deps import SessionDep

router = APIRouter()

# =========================== dropdown norms ===========================
@router.get("/drop-down")
def dropdown_norm(session: SessionDep, query: BaseQueryParams = Depends()):
    return NormServices.dropdown(session=session, query=query)