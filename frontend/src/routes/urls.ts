export const layoutUrl = "/";
export const homeUrl = "/";
export const notFoundUrl = "/not-found";

export const signinUrl = "/sign-in";
export const registerUrl = "/register";

export const testURL = "/test";

// Base URLs for different sections
const baseDataSeaManagementURL = "data-sea-management";
const baseWarehouseAccountingDataURL = "warehouse-accounting-data";
const baseStandardManagementURL = "standard-management";
const baseDataConversionURL = "data-conversion";
const baseApplyDataURL = "apply-data";
const baseFactorsAffectingExistenceURL = "factors-affecting-existence";
const basePrepareSettlementReportURL = "prepare-settlement-report";
const baseManageCatalogsURL = "manage-catalogs";

// data-sea-management URLs
export const seaManagementMaterialsURL = `${baseDataSeaManagementURL}/materials`;
export const seaManagementProductsURL = `${baseDataSeaManagementURL}/product`;
export const seaManagementInvoiceImportURL = `${baseDataSeaManagementURL}/invoice-import`;
export const seaManagementInvoiceExportURL = `${baseDataSeaManagementURL}/invoice-export`;

// warehouse-accounting-data URLs
export const warehouseMaterialsURL = `${baseWarehouseAccountingDataURL}/materials`;
export const warehouseProductsURL = `${baseWarehouseAccountingDataURL}/products`;
export const warehouseInvoiceVatURL = `${baseWarehouseAccountingDataURL}/invoice-vat`;
export const warehouseSemiProductsURL = `${baseWarehouseAccountingDataURL}/semi-products`;
export const warehousePurchaseBooksURL = `${baseWarehouseAccountingDataURL}/purchase-books`;
export const warehouseSalesBooksURL = `${baseWarehouseAccountingDataURL}/sales-books`;
export const warehouseClosingMaterialsURL = `${baseWarehouseAccountingDataURL}/closing-materials`;
export const warehouseClosingSemiProductsURL = `${baseWarehouseAccountingDataURL}/closing-semi-products`;
export const warehouseClosingProductsURL = `/product-store`;

// Standard management URLs
export const standardNormsURL = `${baseStandardManagementURL}/norms`;
export const standardProductsNormURL = `${baseStandardManagementURL}/norm-products`;
export const standardSemiProductsNormURL = `${baseStandardManagementURL}/norm-semi-products`;

// Data conversion URLs
export const convertMaterialsURL = `${baseDataConversionURL}/convert-materials`;
export const convertProductsURL = `${baseDataConversionURL}/convert-products`;
export const unitConversionURL = `${baseDataConversionURL}/unit-conversion`;

// Apply data URLs
export const applyUsersURL = `${baseApplyDataURL}/users`;
export const applyExportURL = `${baseApplyDataURL}/apply-export`;
export const applyVatURL = `${baseApplyDataURL}/apply-vat`;
export const applyPurchaseURL = `${baseApplyDataURL}/apply-purchase`;
export const applySalesURL = `${baseApplyDataURL}/apply-sales`;
export const applyProductNormURL = `${baseApplyDataURL}/apply-product-norm`;
export const applyInventoryMaterialURL = `${baseApplyDataURL}/inventory-material`;
export const applyInventoryProductURL = `${baseApplyDataURL}/inventory-product`;
export const applyInventoryFromSemiProductURL = `${baseApplyDataURL}/inventory-from-semi-product`;

// Factors affecting existence URLs
export const factorsUsersURL = `${baseFactorsAffectingExistenceURL}/users`;
export const factorsMaterialTempExportURL = `${baseFactorsAffectingExistenceURL}/material-temp-export`;
export const factorsMaterialReexportURL = `${baseFactorsAffectingExistenceURL}/material-reexport`;
export const factorsMaterialReimportURL = `${baseFactorsAffectingExistenceURL}/material-reimport`;
export const factorsMaterialDisposeURL = `${baseFactorsAffectingExistenceURL}/material-dispose`;
export const factorsProductTempImportURL = `${baseFactorsAffectingExistenceURL}/product-temp-import`;
export const factorsProductReimportURL = `${baseFactorsAffectingExistenceURL}/product-reimport`;
export const factorsProductReexportURL = `${baseFactorsAffectingExistenceURL}/product-reexport`;
export const factorsProductDisposeURL = `${baseFactorsAffectingExistenceURL}/product-dispose`;
export const factorsProductDestroyURL = `${baseFactorsAffectingExistenceURL}/product-destroy`;

// Prepare settlement report URLs
export const prepareSettlementReportUserURL = `${basePrepareSettlementReportURL}/users`;
export const prepareSettlementReportInventoryProductURL = `${basePrepareSettlementReportURL}/inventory-report-product`;
export const prepareSettlementReportInventorySummaryURL = `${basePrepareSettlementReportURL}/inventory-report-summary`;

// Manage catalogs URLs
export const manageCatalogUserURL = `${baseManageCatalogsURL}/users`;
export const manageCatalogRoleURL = `${baseManageCatalogsURL}/roles`;
