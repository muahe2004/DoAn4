import uuid
from sqlmodel import SQLModel, Field

from app.models.schemas.contracts.contract_schemas import ContractBase
from app.models.schemas.countries.country_schemas import CountryBase
from app.models.schemas.currencies.currency_schemas import CurrencyBase
from app.models.schemas.exports.export_declaration_details_schemas import ExportDeclarationDetailsBase
from app.models.schemas.exports.export_declaration_schemas import ExportDeclarationBase
from app.models.schemas.imports.import_declaration_details_schemas import ImportDeclarationDetailsBase
from app.models.schemas.imports.import_declaration_schemas import ImportDeclarationBase
from app.models.schemas.invoices.vat_invoice_detail_schemas import VATInvoiceDetailBase
from app.models.schemas.invoices.vat_invoice_schemas import VATInvoiceBase
from app.models.schemas.materials.compare_material_code_schemas import CompareMaterialCodeBase
from app.models.schemas.materials.convert_semi_product_schemas import ConvertSemiProductBase
from app.models.schemas.materials.material_destruction_schemas import MaterialDestructionBase
from app.models.schemas.materials.material_receive_detail_schemas import MaterialReceiveDetailBase
from app.models.schemas.materials.material_schemas import MaterialBase
from app.models.schemas.materials.material_semi_product_schemas import MaterialSemiProductBase
from app.models.schemas.norms.norm_detail_schemas import NormDetailBase
from app.models.schemas.norms.norm_schemas import NormBase
from app.models.schemas.partners.partner_schemas import PartnerBase
from app.models.schemas.products.compare_product_code_schemas import CompareProductCodeBase
from app.models.schemas.products.product_liquidation_schemas import ProductLiquidationBase
from app.models.schemas.products.product_schemas import ProductBase
from app.models.schemas.products.product_sell_detail_schemas import ProductSellDetailBase
from app.models.schemas.stores.material_store_schemas import MaterialStoreBase
from app.models.schemas.stores.product_store_schemas import ProductStoreBase
from app.models.schemas.stores.store_schemas import StoreBase
from app.models.schemas.units.convert_units_schemas import ConvertUnitBase
from app.models.schemas.units.unit_schemas import UnitBase
from app.models.schemas.users.user_schemas import UserBase

class Users(UserBase, table=True):
    __tablename__ = "users"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Countries(CountryBase, table=True):
    __tablename__ = "countries"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Currencies(CurrencyBase, table=True):
    __tablename__ = "currencies"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
class Units(UnitBase, table=True):
    __tablename__ = "units"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class ConvertUnits(ConvertUnitBase, table=True):
    __tablename__ = "convert_units"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Partners(PartnerBase, table=True):
    __tablename__ = "partners"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Contracts(ContractBase, table=True):
    __tablename__ = "contracts"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Norms(NormBase, table=True):
    __tablename__ = "norms"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class NormDetails(NormDetailBase, table=True):
    __tablename__ = "norm_details"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Materials(MaterialBase, table=True):
    __tablename__ = "materials"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class MaterialSemiProducts(MaterialSemiProductBase, table=True):
    __tablename__ = "material_semi_products"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class MaterialDestructions(MaterialDestructionBase, table=True):
    __tablename__ = "material_destructions"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class MaterialReceiveDetails(MaterialReceiveDetailBase, table=True):
    __tablename__ = "material_receive_details"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class ConvertSemiProducts(ConvertSemiProductBase, table=True):
    __tablename__ = "convert_semi_products"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class CompareMaterialCodes(CompareMaterialCodeBase, table=True):
    __tablename__ = "compare_material_codes"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Products(ProductBase, table=True):
    __tablename__ = "products"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class ProductSellDetails(ProductSellDetailBase, table=True):
    __tablename__ = "product_sell_details"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class ProductLiquidations(ProductLiquidationBase, table=True):
    __tablename__ = "product_liquidations"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class CompareProductCodes(CompareProductCodeBase, table=True):
    __tablename__ = "compare_product_codes"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class ExportDeclarations(ExportDeclarationBase, table=True):
    __tablename__ = "export_declarations"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class ExportDeclarationDetails(ExportDeclarationDetailsBase, table=True):
    __tablename__ = "export_declaration_details"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class ImportDeclarations(ImportDeclarationBase, table=True):
    __tablename__ = "import_declarations"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class ImportDeclarationDetails(ImportDeclarationDetailsBase, table=True):
    __tablename__ = "import_declaration_details"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class VATInvoices(VATInvoiceBase, table=True):
    __tablename__ = "invoices"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class VATInvoicesDetails(VATInvoiceDetailBase, table=True):
    __tablename__ = "invoices_details"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class Stores(StoreBase, table=True):
    __tablename__ = "stores"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class MaterialStores(MaterialStoreBase, table=True):
    __tablename__ = "material_stores"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

class ProductStores(ProductStoreBase, table=True):
    __tablename__ = "product_stores"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)