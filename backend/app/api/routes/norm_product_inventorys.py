from typing import List, Optional
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

@router.get("/export")
def export_norm_product_inventorys(
    session: SessionDep,
    search: Optional[str] = None,
    status: Optional[str] = None,
    fiscal_year: Optional[str] = None,
    format: str = "excel"
):
    try:
        # For export, we don't need complex query params, just simple filtering
        data, total = NormProductInventoryServices.get_all_for_export(
            session=session,
            search=search,
            status=status,
            fiscal_year=fiscal_year
        )
        
        if format.lower() == "excel":
            from openpyxl import Workbook
            from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
            from openpyxl.utils import get_column_letter
            import io
            
            # Create workbook and worksheet
            wb = Workbook()
            ws = wb.active
            ws.title = "Định mức sản phẩm"
            
            # Define styles
            header_font = Font(name='Arial', size=12, bold=True, color='FFFFFF')
            header_fill = PatternFill(start_color='366092', end_color='366092', fill_type='solid')
            header_alignment = Alignment(horizontal='center', vertical='center')
            
            data_font = Font(name='Arial', size=11)
            data_alignment = Alignment(horizontal='left', vertical='center')
            number_alignment = Alignment(horizontal='right', vertical='center')
            center_alignment = Alignment(horizontal='center', vertical='center')
            
            thin_border = Border(
                left=Side(style='thin'),
                right=Side(style='thin'),
                top=Side(style='thin'),
                bottom=Side(style='thin')
            )
            
            # Headers
            headers = [
                "STT", "Mã sản phẩm", "Tên sản phẩm", "Tên định mức", 
                "Đơn vị tính", "Giá trị định mức", "Năm tài chính"
            ]
            
            # Write headers
            for col, header in enumerate(headers, 1):
                cell = ws.cell(row=1, column=col, value=header)
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = header_alignment
                cell.border = thin_border
            
            # Write data
            for row_idx, item in enumerate(data, 2):
                # STT
                cell = ws.cell(row=row_idx, column=1, value=row_idx - 1)
                cell.font = data_font
                cell.alignment = center_alignment
                cell.border = thin_border
                
                # Mã sản phẩm
                cell = ws.cell(row=row_idx, column=2, value=item.product_code)
                cell.font = data_font
                cell.alignment = data_alignment
                cell.border = thin_border
                
                # Tên sản phẩm
                cell = ws.cell(row=row_idx, column=3, value=item.product_name)
                cell.font = data_font
                cell.alignment = data_alignment
                cell.border = thin_border
                
                # Tên định mức
                cell = ws.cell(row=row_idx, column=4, value=item.norm_name)
                cell.font = data_font
                cell.alignment = data_alignment
                cell.border = thin_border
                
                # Đơn vị tính
                cell = ws.cell(row=row_idx, column=5, value=item.unit_name)
                cell.font = data_font
                cell.alignment = center_alignment
                cell.border = thin_border
                
                # Giá trị định mức
                cell = ws.cell(row=row_idx, column=6, value=item.norm_value)
                cell.font = data_font
                cell.alignment = number_alignment
                cell.border = thin_border
                cell.number_format = '#,##0.00'
                
                # Năm tài chính
                cell = ws.cell(row=row_idx, column=7, value=item.fiscal_year)
                cell.font = data_font
                cell.alignment = center_alignment
                cell.border = thin_border
            
            # Auto-adjust column widths
            column_widths = [8, 18, 35, 30, 15, 18, 18]
            for col, width in enumerate(column_widths, 1):
                ws.column_dimensions[get_column_letter(col)].width = width
            
            # Set row height for header
            ws.row_dimensions[1].height = 25
            
            # Save to BytesIO
            excel_buffer = io.BytesIO()
            wb.save(excel_buffer)
            excel_buffer.seek(0)
            
            filename = f"dinh_muc_san_pham_{fiscal_year or 'all'}.xlsx"
            
            return StreamingResponse(
                io.BytesIO(excel_buffer.read()),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={
                    "Content-Disposition": f"attachment; filename={filename}"
                }
            )
        
        elif format.lower() == "csv":
            import csv
            import io
            
            csv_output = io.StringIO()
            writer = csv.writer(csv_output)
            
            writer.writerow([
                "STT", "Mã sản phẩm", "Tên sản phẩm", "Tên định mức", 
                "Đơn vị tính", "Giá trị định mức", "Năm tài chính"
            ])
            
            for idx, item in enumerate(data, 1):
                writer.writerow([
                    idx,
                    item.product_code,
                    item.product_name,
                    item.norm_name,
                    item.unit_name,
                    item.norm_value,
                    item.fiscal_year
                ])
            
            csv_content = csv_output.getvalue()
            csv_output.close()
            
            return Response(
                content=csv_content.encode('utf-8-sig'),  # UTF-8 with BOM for Excel compatibility
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename=dinh_muc_san_pham_{fiscal_year or 'all'}.csv"
                }
            )
        
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported export format. Use 'excel' or 'csv'"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed: {str(e)}"
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