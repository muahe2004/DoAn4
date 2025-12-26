from app.models.schemas.currencies.currency_schemas import CurrencyQueryParams
from app.services.currencies import CurrencyServices
from fastapi import APIRouter, Depends
from app.api.deps import SessionDep

router = APIRouter()

@router.get("/drop-down")
def dropdown_currency(session: SessionDep, query: CurrencyQueryParams = Depends()):
    return CurrencyServices.dropdown(session=session, query=query)
