from app.models.schemas.countries.country_schemas import CountryQueryParams
from app.services.countries import CountryServices
from fastapi import APIRouter, Depends
from app.api.deps import SessionDep

router = APIRouter()

@router.get("/drop-down")
def dropdown_country(session: SessionDep, query: CountryQueryParams = Depends()):
    return CountryServices.dropdown(session=session, query=query)
