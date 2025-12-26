from typing import List, Optional, Tuple
import uuid
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import func, and_, or_
from sqlmodel import Session, select, SQLModel, Field
from starlette import status

from app.models.models import (
    Materials, MaterialStores, Units, Stores, 
    CompareMaterialCodes, ImportDeclarationDetails
)
from app.models.schemas.common.query import BaseQueryParams

# Response schemas
class MaterialInventoryPublic(SQLModel):
    id: uuid.UUID
    material_id: uuid.UUID
    store_id: uuid.UUID
    quantity_on_hand: float
    total_value: float = 0.0
    status: str
    created_at: datetime
    updated_at: datetime
    internal_code: Optional[str] = None
    external_code: Optional[str] = None
    material_code: str
    material_name: str
    material_description: Optional[str] = None
    unit_name: str
    unit_name_2: Optional[str] = None
    store_name: str
    store_code: str

class MaterialInventoryQueryParams(BaseQueryParams):
    store_id: Optional[uuid.UUID] = Field(None)
    material_code: Optional[str] = Field(None)
    internal_code: Optional[str] = Field(None)
    external_code: Optional[str] = Field(None)
    min_quantity: Optional[float] = Field(None)
    max_quantity: Optional[float] = Field(None)

class MaterialInventorysResponse(SQLModel):
    data: List[MaterialInventoryPublic]
    total: int
    page: int
    limit: int

class MaterialInventoryCreate(SQLModel):
    material_id: uuid.UUID
    store_id: uuid.UUID
    quantity_on_hand: float
    status: str = "ACTIVE"
    internal_code: Optional[str] = None
    external_code: Optional[str] = None

class MaterialInventoryUpdate(SQLModel):
    material_id: Optional[uuid.UUID] = None
    store_id: Optional[uuid.UUID] = None
    quantity_on_hand: Optional[float] = None
    status: Optional[str] = None
    internal_code: Optional[str] = None
    external_code: Optional[str] = None

class MaterialInventoryDeleteResponse(SQLModel):
    message: str
    id: uuid.UUID

class MaterialInventoryServices:
    
    @staticmethod
    def get_all_with_joins(
        *, 
        session: Session, 
        query: MaterialInventoryQueryParams
    ) -> Tuple[List[MaterialInventoryPublic], int]:
        """
        Get material inventories with JOIN from multiple tables
        Returns: MaterialStores + Materials + Units + Stores + CompareMaterialCodes
        """
        
        # Main query with JOINs
        main_query = (
            select(
                MaterialStores.id,
                MaterialStores.material_id,
                MaterialStores.store_id,
                MaterialStores.quantity_on_hand,
                MaterialStores.status,
                MaterialStores.created_at,
                MaterialStores.updated_at,
                Materials.material_code,
                Materials.material_name,
                Materials.description.label("material_description"),
                Units.unit_name,
                Stores.store_name,
                Stores.store_code,
                CompareMaterialCodes.internal_code,
                CompareMaterialCodes.external_code
            )
            .select_from(MaterialStores)
            .join(Materials, MaterialStores.material_id == Materials.id)
            .join(Stores, MaterialStores.store_id == Stores.id)
            .outerjoin(Units, Materials.unit_id == Units.id)
            .outerjoin(CompareMaterialCodes, Materials.id == CompareMaterialCodes.material_id)
        )
        
        # Apply filters
        conditions = []
        
        if query.search:
            conditions.append(
                or_(
                    Materials.material_name.ilike(f"%{query.search}%"),
                    Materials.material_code.ilike(f"%{query.search}%"),
                    Stores.store_name.ilike(f"%{query.search}%")
                )
            )
        
        if query.status:
            conditions.append(MaterialStores.status == query.status)
            
        if query.store_id:
            conditions.append(MaterialStores.store_id == query.store_id)
            
        if query.material_code:
            conditions.append(Materials.material_code.ilike(f"%{query.material_code}%"))
            
        if query.internal_code:
            conditions.append(CompareMaterialCodes.internal_code.ilike(f"%{query.internal_code}%"))
            
        if query.external_code:
            conditions.append(CompareMaterialCodes.external_code.ilike(f"%{query.external_code}%"))
            
        if query.min_quantity is not None:
            conditions.append(MaterialStores.quantity_on_hand >= query.min_quantity)
            
        if query.max_quantity is not None:
            conditions.append(MaterialStores.quantity_on_hand <= query.max_quantity)
        
        if conditions:
            main_query = main_query.where(and_(*conditions))
        
        # Count total records
        count_query = select(func.count()).select_from(main_query.subquery())
        total = session.exec(count_query).one()
        
        # Apply pagination and ordering
        paginated_query = (
            main_query
            .order_by(MaterialStores.created_at.desc())
            .offset(query.skip)
            .limit(query.limit)
        )
        
        results = session.exec(paginated_query).all()
        
        # Convert to response objects
        material_inventorys = []
        for result in results:
            # Calculate total value (quantity * unit price from latest import)
            total_value = 0.0
            if result.quantity_on_hand:
                # Get latest import price for this material
                latest_import = session.exec(
                    select(ImportDeclarationDetails.unit_price)
                    .where(ImportDeclarationDetails.material_id == result.material_id)
                    .order_by(ImportDeclarationDetails.created_at.desc())
                    .limit(1)
                ).first()
                
                if latest_import and latest_import.unit_price:
                    total_value = result.quantity_on_hand * latest_import.unit_price
            
            material_inventory = MaterialInventoryPublic(
                id=result.id,
                material_id=result.material_id,
                store_id=result.store_id,
                quantity_on_hand=result.quantity_on_hand or 0.0,
                total_value=total_value,
                status=result.status or "ACTIVE",
                created_at=result.created_at,
                updated_at=result.updated_at,
                internal_code=result.internal_code,
                external_code=result.external_code,
                material_code=result.material_code,
                material_name=result.material_name,
                material_description=result.material_description,
                unit_name=result.unit_name or "Unknown",
                unit_name_2=None,
                store_name=result.store_name,
                store_code=result.store_code
            )
            material_inventorys.append(material_inventory)
        
        return material_inventorys, total
    
    @staticmethod
    def get_by_id(*, session: Session, id: uuid.UUID) -> MaterialInventoryPublic:
        """Get single material inventory by ID with JOIN data"""
        
        query = (
            select(
                MaterialStores.id,
                MaterialStores.material_id,
                MaterialStores.store_id,
                MaterialStores.quantity_on_hand,
                MaterialStores.status,
                MaterialStores.created_at,
                MaterialStores.updated_at,
                Materials.material_code,
                Materials.material_name,
                Materials.description.label("material_description"),
                Units.unit_name,
                Stores.store_name,
                Stores.store_code,
                CompareMaterialCodes.internal_code,
                CompareMaterialCodes.external_code
            )
            .select_from(MaterialStores)
            .join(Materials, MaterialStores.material_id == Materials.id)
            .join(Stores, MaterialStores.store_id == Stores.id)
            .outerjoin(Units, Materials.unit_id == Units.id)
            .outerjoin(CompareMaterialCodes, Materials.id == CompareMaterialCodes.material_id)
            .where(MaterialStores.id == id)
        )
        
        result = session.exec(query).first()
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Material inventory not found"
            )
        
        # Calculate total value
        total_value = 0.0
        if result.quantity_on_hand:
            latest_import = session.exec(
                select(ImportDeclarationDetails.unit_price)
                .where(ImportDeclarationDetails.material_id == result.material_id)
                .order_by(ImportDeclarationDetails.created_at.desc())
                .limit(1)
            ).first()
            
            if latest_import and latest_import.unit_price:
                total_value = result.quantity_on_hand * latest_import.unit_price
        
        return MaterialInventoryPublic(
            id=result.id,
            material_id=result.material_id,
            store_id=result.store_id,
            quantity_on_hand=result.quantity_on_hand or 0.0,
            total_value=total_value,
            status=result.status or "ACTIVE",
            created_at=result.created_at,
            updated_at=result.updated_at,
            internal_code=result.internal_code,
            external_code=result.external_code,
            material_code=result.material_code,
            material_name=result.material_name,
            material_description=result.material_description,
            unit_name=result.unit_name or "Unknown",
            unit_name_2=None,
            store_name=result.store_name,
            store_code=result.store_code
        )
    
    @staticmethod
    def create(*, session: Session, material_inventory: MaterialInventoryCreate) -> MaterialInventoryPublic:
        """Create new material inventory"""
        
        # Check if material-store combination already exists
        existing = session.exec(
            select(MaterialStores)
            .where(
                and_(
                    MaterialStores.material_id == material_inventory.material_id,
                    MaterialStores.store_id == material_inventory.store_id
                )
            )
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Material inventory already exists for this material and store combination"
            )
        
        # Create new MaterialStore record
        db_material_store = MaterialStores(
            material_id=material_inventory.material_id,
            store_id=material_inventory.store_id,
            quantity_on_hand=material_inventory.quantity_on_hand,
            status=material_inventory.status,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        session.add(db_material_store)
        session.commit()
        session.refresh(db_material_store)
        
        # Handle internal/external codes if provided
        if material_inventory.internal_code or material_inventory.external_code:
            # Check if CompareMaterialCode exists
            existing_compare = session.exec(
                select(CompareMaterialCodes)
                .where(CompareMaterialCodes.material_id == material_inventory.material_id)
            ).first()
            
            if existing_compare:
                # Update existing
                if material_inventory.internal_code:
                    existing_compare.internal_code = material_inventory.internal_code
                if material_inventory.external_code:
                    existing_compare.external_code = material_inventory.external_code
                existing_compare.updated_at = datetime.now()
                session.add(existing_compare)
            else:
                # Create new
                db_compare = CompareMaterialCodes(
                    material_id=material_inventory.material_id,
                    internal_code=material_inventory.internal_code,
                    external_code=material_inventory.external_code,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                session.add(db_compare)
            
            session.commit()
        
        # Return the created record with JOIN data
        return MaterialInventoryServices.get_by_id(session=session, id=db_material_store.id)
    
    @staticmethod
    def update(*, session: Session, id: uuid.UUID, material_inventory: MaterialInventoryUpdate) -> MaterialInventoryPublic:
        """Update material inventory"""
        
        db_material_store = session.get(MaterialStores, id)
        if not db_material_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Material inventory not found"
            )
        
        # Update MaterialStore fields
        update_data = material_inventory.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            if field not in ['internal_code', 'external_code'] and hasattr(db_material_store, field):
                setattr(db_material_store, field, value)
        
        db_material_store.updated_at = datetime.now()
        session.add(db_material_store)
        
        # Handle internal/external codes
        if 'internal_code' in update_data or 'external_code' in update_data:
            existing_compare = session.exec(
                select(CompareMaterialCodes)
                .where(CompareMaterialCodes.material_id == db_material_store.material_id)
            ).first()
            
            if existing_compare:
                if 'internal_code' in update_data:
                    existing_compare.internal_code = update_data['internal_code']
                if 'external_code' in update_data:
                    existing_compare.external_code = update_data['external_code']
                existing_compare.updated_at = datetime.now()
                session.add(existing_compare)
            else:
                db_compare = CompareMaterialCodes(
                    material_id=db_material_store.material_id,
                    internal_code=update_data.get('internal_code'),
                    external_code=update_data.get('external_code'),
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                session.add(db_compare)
        
        session.commit()
        session.refresh(db_material_store)
        
        return MaterialInventoryServices.get_by_id(session=session, id=id)
    
    @staticmethod
    def delete(*, session: Session, id: uuid.UUID) -> MaterialInventoryDeleteResponse:
        """Delete material inventory"""
        
        db_material_store = session.get(MaterialStores, id)
        if not db_material_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Material inventory not found"
            )
        
        session.delete(db_material_store)
        session.commit()
        
        return MaterialInventoryDeleteResponse(
            message="Material inventory deleted successfully",
            id=id
        )