from app.models.schemas.partners.partner_schemas import PartnerQueryParams
from app.services.partners import PartnerServices
from fastapi import APIRouter, Depends
from app.api.deps import SessionDep

router = APIRouter()

@router.get("/drop-down")
def dropdown_partner(session: SessionDep, query: PartnerQueryParams = Depends()):
    return PartnerServices.dropdown(session=session, query=query)
