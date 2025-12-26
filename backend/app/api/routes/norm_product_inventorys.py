from typing import List
import uuid
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from starlette import status

from app.api.deps import SessionDep
from app.services.norm_product_inventorys import NormProductInventoryServices
from app.models.schemas.norm_product_inventorys.norm_product_inventory_schemas import (
    NormProductInventoryPublic,
    NormProductInventoryDetail,
    NormDetailInfo,
    NormProductInventoryQueryParams,
    NormProductInventorysResponse,
    NormProductInventoryCreate,
    MultiNormProductInventoryCreate,
    NormProductInventoryUpdate,
    ApplyNormsRequest,
    ApplyNormsResponse,
    ExportNormProductInventoryRequest,
    NormProductInventoryDeleteResponse,
    NormProductInventorySummary
)

router = APIRouter()

@router.get("", response_model=NormProductInventorysResponse)
def get_norm_product_inventorys(
    session: SessionDep, 
    query: NormProductInventoryQueryParams = Depends()
):
    data, total = NormProductInventoryServices.get_all_with_joins(
        session=session, 
        query=query
    )
    
    return NormProductInventorysResponse(
        data=data,
        total=total,
        page=(query.skip // query.limit) + 1,
        limit=query.limit
    )

@router.get("/{id}", response_model=NormProductInventoryDetail)
def get_norm_product_inventory_by_id(
    session: SessionDep, 
    id: uuid.UUID
) -> NormProductInventoryDetail:
    return NormProductInventoryServices.get_by_id(session=session, id=id)

@router.post("/apply", response_model=ApplyNormsResponse)
def apply_norms_to_products(
    session: SessionDep,
    request: ApplyNormsRequest
):
    return NormProductInventoryServices.apply_norms_to_products(
        session=session,
        request=request
    )

@router.get("/export")
def export_norm_product_inventorys(
    session: SessionDep,
    request: ExportNormProductInventoryRequest = Depends()
):
    try:
        query_params = NormProductInventoryQueryParams(
            search=request.search,
            status=request.status,
            fiscal_year=request.fiscal_year,
            skip=0,
            limit=10000
        )
        
        data, total = NormProductInventoryServices.get_all_with_joins(
            session=session,
            query=query_params
        )
        
        if request.format.lower() == "excel":
            import csv
            import io
            
            csv_output = io.StringIO()
            writer = csv.writer(csv_output)
            
            writer.writerow([
                "STT", "Mã sản phẩm", "Tên sản phẩm", "Tên định mức", 
                "Đơn vị tính", "Giá trị định mức", "Năm tài chính", "Trạng thái"
            ])
            
            for idx, item in enumerate(data, 1):
                writer.writerow([
                    idx,
                    item.product_code,
                    item.product_name,
                    item.norm_name,
                    item.unit_name,
                    item.norm_value,
                    item.fiscal_year,
                    item.status
                ])
            
            csv_content = csv_output.getvalue()
            csv_output.close()
            
            return Response(
                content=csv_content.encode('utf-8'),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=norm_product_inventorys_{request.fiscal_year or 'all'}.csv"
                }
            )
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported export format. Use 'excel' or 'pdf'"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
        )

@router.get("/summary", response_model=NormProductInventorySummary)
def get_norm_product_inventory_summary(session: SessionDep):
    return NormProductInventoryServices.get_summary(session=session)

@router.delete("/{id}", response_model=NormProductInventoryDeleteResponse)
def delete_norm_product_inventory(
    session: SessionDep,
    id: uuid.UUID
):
    return NormProductInventoryServices.delete(session=session, id=id)

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "module": "norm-product-inventorys",
        "version": "1.0.0"
    }