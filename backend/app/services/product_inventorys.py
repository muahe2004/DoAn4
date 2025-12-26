from typing import List, Optional, Tuple
import uuid
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy import func, and_, or_
from sqlmodel import Session, select, SQLModel, Field
from starlette import status

from app.models.models import (
    Products, ProductStores, Units, Stores, 
    CompareProductCodes, ImportDeclarationDetails
)
from app.models.schemas.common.query import BaseQueryParams

# Response schemas
class ProductInventoryPublic(SQLModel):
    id: uuid.UUID
    product_id: uuid.UUID
    store_id: uuid.UUID
    quantity_on_hand: float
    total_value: float = 0.0
    status: str
    created_at: datetime
    updated_at: datetime
    internal_code: Optional[str] = None
    external_code: Optional[str] = None
    product_code: str
    product_name: str
    product_description: Optional[str] = None
    unit_name: str
    unit_name_2: Optional[str] = None
    store_name: str
    store_code: str

class ProductInventoryQueryParams(BaseQueryParams):
    store_id: Optional[uuid.UUID] = Field(None)
    product_code: Optional[str] = Field(None)
    internal_code: Optional[str] = Field(None)
    external_code: Optional[str] = Field(None)
    min_quantity: Optional[float] = Field(None)
    max_quantity: Optional[float] = Field(None)

class ProductInventorysResponse(SQLModel):
    data: List[ProductInventoryPublic]
    total: int
    page: int
    limit: int

class ProductInventoryCreate(SQLModel):
    product_id: uuid.UUID
    store_id: uuid.UUID
    quantity_on_hand: float = 0
    status: str = "ACTIVE"
    internal_code: Optional[str] = None
    external_code: Optional[str] = None

class ProductInventoryUpdate(SQLModel):
    quantity_on_hand: Optional[float] = None
    status: Optional[str] = None
    internal_code: Optional[str] = None
    external_code: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.now)

class ProductInventoryDeleteResponse(SQLModel):
    message: str
    id: uuid.UUID

class ProductInventorySummary(SQLModel):
    total_products: int
    total_stores: int
    total_value: float
    low_stock_count: int

class ProductInventoryServices:
    
    @staticmethod
    def get_all_with_joins(
        *, 
        session: Session, 
        query: ProductInventoryQueryParams
    ) -> Tuple[List[ProductInventoryPublic], int]:
        inventory_query = (
            select(
                ProductStores.id.label("inventory_id"),
                ProductStores.product_id,
                ProductStores.store_id,
                ProductStores.quantity_on_hand,
                ProductStores.status.label("inventory_status"),
                ProductStores.created_at.label("inventory_created_at"),
                ProductStores.updated_at.label("inventory_updated_at"),
                Products.product_code,
                Products.product_name,
                Products.description.label("product_description"),
                Units.unit_name,
                Stores.store_code,
                Stores.store_name,
                func.coalesce(CompareProductCodes.internal_code, "").label("internal_code"),
                func.coalesce(CompareProductCodes.external_code, "").label("external_code")
            )
            .select_from(ProductStores)
            .join(Products, ProductStores.product_id == Products.id)
            .join(Units, Products.unit_id == Units.id)
            .join(Stores, ProductStores.store_id == Stores.id)
            .outerjoin(CompareProductCodes, Products.id == CompareProductCodes.product_id)
        )
        # Apply filters
        if query.store_id:
            inventory_query = inventory_query.where(ProductStores.store_id == query.store_id)
        if query.product_code:
            inventory_query = inventory_query.where(
                Products.product_code.ilike(f"%{query.product_code}%")
            )
        if query.internal_code:
            inventory_query = inventory_query.where(
                CompareProductCodes.internal_code.ilike(f"%{query.internal_code}%")
            )
        if query.external_code:
            inventory_query = inventory_query.where(
                CompareProductCodes.external_code.ilike(f"%{query.external_code}%")
            )
        if query.min_quantity:
            inventory_query = inventory_query.where(
                ProductStores.quantity_on_hand >= query.min_quantity
            )
        if query.max_quantity:
            inventory_query = inventory_query.where(
                ProductStores.quantity_on_hand <= query.max_quantity
            )
        if query.search:
            inventory_query = inventory_query.where(
                or_(
                    Products.product_name.ilike(f"%{query.search}%"),
                    Products.product_code.ilike(f"%{query.search}%"),
                    CompareProductCodes.internal_code.ilike(f"%{query.search}%"),
                    CompareProductCodes.external_code.ilike(f"%{query.search}%")
                )
            )
        
        # Get total count
        count_query = select(func.count(ProductStores.id)).select_from(
            inventory_query.subquery()
        )
        total = session.exec(count_query).one()
        
        # Apply pagination
        paginated_query = inventory_query.offset(query.skip).limit(query.limit)
        results = session.exec(paginated_query).all()
        
        # Transform to response format
        inventories = []
        for result in results:
            # Get unit_price from import_declaration_details
            unit_price_query = (
                select(ImportDeclarationDetails.unit_price)
                .where(ImportDeclarationDetails.material_id == result.product_id)
                .order_by(ImportDeclarationDetails.created_at.desc())
                .limit(1)
            )
            unit_price_result = session.exec(unit_price_query).first()
            unit_price = unit_price_result if unit_price_result else 0.0
            
            total_value = (result.quantity_on_hand or 0) * unit_price
            
            inventory = ProductInventoryPublic(
                id=result.inventory_id,
                product_id=result.product_id,
                store_id=result.store_id,
                quantity_on_hand=result.quantity_on_hand or 0,
                total_value=total_value,
                status=result.inventory_status or "ACTIVE",
                created_at=result.inventory_created_at,
                updated_at=result.inventory_updated_at,
                internal_code=result.internal_code,
                external_code=result.external_code,
                product_code=result.product_code,
                product_name=result.product_name,
                product_description=result.product_description,
                unit_name=result.unit_name,
                unit_name_2=None,
                store_name=result.store_name,
                store_code=result.store_code
            )
            inventories.append(inventory)
        
        return inventories, total
    
    @staticmethod
    def get_by_id(*, session: Session, id: uuid.UUID) -> ProductInventoryPublic:
        inventory_query = (
            select(
                ProductStores.id.label("inventory_id"),
                ProductStores.product_id,
                ProductStores.store_id,
                ProductStores.quantity_on_hand,
                ProductStores.status.label("inventory_status"),
                ProductStores.created_at.label("inventory_created_at"),
                ProductStores.updated_at.label("inventory_updated_at"),
                Products.product_code,
                Products.product_name,
                Products.description.label("product_description"),
                Units.unit_name,
                Stores.store_code,
                Stores.store_name,
                func.coalesce(CompareProductCodes.internal_code, "").label("internal_code"),
                func.coalesce(CompareProductCodes.external_code, "").label("external_code")
            )
            .select_from(ProductStores)
            .join(Products, ProductStores.product_id == Products.id)
            .join(Units, Products.unit_id == Units.id)
            .join(Stores, ProductStores.store_id == Stores.id)
            .outerjoin(CompareProductCodes, Products.id == CompareProductCodes.product_id)
            .where(ProductStores.id == id)
        )
        
        result = session.exec(inventory_query).first()
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product inventory not found"
            )
        
        # Get unit_price
        unit_price_query = (
            select(ImportDeclarationDetails.unit_price)
            .where(ImportDeclarationDetails.material_id == result.product_id)
            .order_by(ImportDeclarationDetails.created_at.desc())
            .limit(1)
        )
        unit_price_result = session.exec(unit_price_query).first()
        unit_price = unit_price_result if unit_price_result else 0.0
        
        total_value = (result.quantity_on_hand or 0) * unit_price
        
        return ProductInventoryPublic(
            id=result.inventory_id,
            product_id=result.product_id,
            store_id=result.store_id,
            quantity_on_hand=result.quantity_on_hand or 0,
            total_value=total_value,
            status=result.inventory_status or "ACTIVE",
            created_at=result.inventory_created_at,
            updated_at=result.inventory_updated_at,
            internal_code=result.internal_code,
            external_code=result.external_code,
            product_code=result.product_code,
            product_name=result.product_name,
            product_description=result.product_description,
            unit_name=result.unit_name,
            unit_name_2=None,
            store_name=result.store_name,
            store_code=result.store_code
        )
    
    @staticmethod
    def create(*, session: Session, create_data: dict) -> ProductInventoryPublic:
        # Validate product exists
        product = session.get(Products, create_data["product_id"])
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Validate store exists
        store = session.get(Stores, create_data["store_id"])
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Store not found"
            )
        
        # Check if record already exists
        existing = session.exec(
            select(ProductStores).where(
                and_(
                    ProductStores.product_id == create_data["product_id"],
                    ProductStores.store_id == create_data["store_id"]
                )
            )
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product inventory record already exists for this product and store"
            )
        
        try:
            # Create/update internal and external codes if provided
            if create_data.get("internal_code") or create_data.get("external_code"):
                existing_compare = session.exec(
                    select(CompareProductCodes).where(
                        CompareProductCodes.product_id == create_data["product_id"]
                    )
                ).first()
                
                if existing_compare:
                    if create_data.get("internal_code"):
                        existing_compare.internal_code = create_data["internal_code"]
                    if create_data.get("external_code"):
                        existing_compare.external_code = create_data["external_code"]
                    existing_compare.updated_at = datetime.now()
                    session.add(existing_compare)
                else:
                    new_compare = CompareProductCodes(
                        product_id=create_data["product_id"],
                        internal_code=create_data.get("internal_code"),
                        external_code=create_data.get("external_code"),
                        description="",
                        status="ACTIVE",
                        created_at=datetime.now(),
                        updated_at=datetime.now()
                    )
                    session.add(new_compare)
            # Create new ProductStore record
            new_inventory = ProductStores(
                product_id=create_data["product_id"],
                store_id=create_data["store_id"],
                quantity_on_hand=create_data.get("quantity_on_hand", 0),
                status=create_data.get("status", "ACTIVE"),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            session.add(new_inventory)
            session.commit()
            session.refresh(new_inventory)
            
            return ProductInventoryServices.get_by_id(session=session, id=new_inventory.id)
            
        except Exception as e:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating inventory: {str(e)}"
            )
    
    @staticmethod
    def update(
        *, 
        session: Session, 
        id: uuid.UUID, 
        update_data: ProductInventoryUpdate
    ) -> ProductInventoryPublic:
        product_store = session.get(ProductStores, id)
        if not product_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product inventory not found"
            )
        
        try:
            # Update ProductStores fields
            if update_data.quantity_on_hand is not None:
                product_store.quantity_on_hand = update_data.quantity_on_hand
            if update_data.status is not None:
                product_store.status = update_data.status
            
            product_store.updated_at = datetime.now()
            
            # Update CompareProductCodes if provided
            if update_data.internal_code is not None or update_data.external_code is not None:
                existing_compare = session.exec(
                    select(CompareProductCodes).where(
                        CompareProductCodes.product_id == product_store.product_id
                    )
                ).first()
                
                if existing_compare:
                    if update_data.internal_code is not None:
                        existing_compare.internal_code = update_data.internal_code
                    if update_data.external_code is not None:
                        existing_compare.external_code = update_data.external_code
                    existing_compare.updated_at = datetime.now()
                    session.add(existing_compare)
                else:
                    new_compare = CompareProductCodes(
                        product_id=product_store.product_id,
                        internal_code=update_data.internal_code,
                        external_code=update_data.external_code,
                        description="",
                        status="ACTIVE",
                        created_at=datetime.now(),
                        updated_at=datetime.now()
                    )
                    session.add(new_compare)
            
            session.add(product_store)
            session.commit()
            session.refresh(product_store)
            
            return ProductInventoryServices.get_by_id(session=session, id=id)
            
        except Exception as e:
            session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating inventory: {str(e)}"
            )
    
    @staticmethod
    def delete(*, session: Session, id: uuid.UUID) -> ProductInventoryDeleteResponse:
        product_store = session.get(ProductStores, id)
        if not product_store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product inventory not found"
            )
        
        session.delete(product_store)
        session.commit()
        
        return ProductInventoryDeleteResponse(
            message="Product inventory deleted successfully",
            id=id
        )
    
    @staticmethod
    def get_summary(*, session: Session) -> ProductInventorySummary:
        # Total products in inventory
        total_products = session.exec(
            select(func.count(ProductStores.id))
        ).one()
        
        # Total stores
        total_stores = session.exec(
            select(func.count(func.distinct(ProductStores.store_id)))
        ).one()
        
        # Total value - simplified calculation
        total_value = 0.0
        
        # Low stock count (quantity < 10)
        low_stock_count = session.exec(
            select(func.count(ProductStores.id))
            .where(ProductStores.quantity_on_hand < 10)
        ).one()
        
        return ProductInventorySummary(
            total_products=total_products,
            total_stores=total_stores,
            total_value=total_value,
            low_stock_count=low_stock_count
        )