from app.models.schemas.currencies.currency_schemas import CurrencyQueryParams
from app.services.currencies import CurrencyServices
from fastapi import APIRouter, Depends, Query
from app.api.deps import SessionDep
from app.services.exchange_rates import ExchangeRateServices

router = APIRouter()

@router.get("/drop-down")
def dropdown_currency(session: SessionDep, query: CurrencyQueryParams = Depends()):
    return CurrencyServices.dropdown(session=session, query=query)


@router.get("/exchange-rate")
def exchange_rate(
    base: str = Query("USD"),
    target: str = Query("VND"),
):
    return ExchangeRateServices.get_rate(base=base, target=target)
