/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from "react-router-dom";
import {
  homeUrl,
  layoutUrl,
  testURL,
  signinUrl,
  registerUrl,
  warehouseMaterialsURL,
  warehouseProductsURL,
  seaManagementInvoiceImportURL,
  standardNormsURL,
  seaManagementInvoiceExportURL,
  unitsURL,
  unitConversionURL,
  warehouseClosingProductsURL,
  warehouseClosingMaterialsURL,
  prepareSettlementReportUserURL,
  prepareSettlementReportInventoryProductURL,
  prepareSettlementReportInventorySummaryURL,
  compareMaterialCodesURL,
  FiscalImportDeclarationsURL,
  FiscalExportDeclarationsURL,
  MaterialStoresURL,
  productsURL
} from "./urls";
import Layout from "../modules/app/Layout";
import Test from "../modules/Test/Test";
import { NotFound } from "../modules/NotFound/NotFound";
import Login from "../modules/auth/views/Login";
import Register from "../modules/auth/views/Register";
import { Products } from "../modules/products/views/Products";
import { Materials } from "../modules/materials/views/Materials";
import { isAuthenticated } from "../modules/auth/services/authState";
import { ExportDeclaration } from "../modules/exports/views/Exports";
import { ImportDeclarations } from "../modules/import/views/ImportDeclarations";
import { Norms } from "../modules/standard-management/norms/views/Norms";
import { Units } from "../modules/units/views/units";
import UoM from "../modules/units/views/UoM";
import ProductStore from "../modules/product-store/views/ProductStore";
import MaterialStore from "../modules/material-store/views/MaterialStore";
import { MaterialSettlementReport } from "../modules/reports/views/MaterialSettlementReport";
import { ProductSettlementReport } from "../modules/reports/views/ProductSettlementReport";
import { MaterialInventorySummary } from "../modules/reports/views/MaterialInventorySummary";
import MaterialStores from "../modules/store-materials/views/MaterialStores";
import SetupFiscalExportDeclarations from "../modules/setup-data-fiscal-years/fiscal-export-declarations/views/export";
import SetupFiscalImportDeclarations from "../modules/setup-data-fiscal-years/fiscal-import-declarations/views/import";
import { CompareMaterialCodes } from "../modules/compare-material-codes/views/CompareMaterialCodes";

/* ===== Route Guards ===== */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) return <Navigate to={signinUrl} replace />;
  return <>{children}</>;
};

const AuthOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  if (isAuthenticated()) return <Navigate to={homeUrl} replace />;
  return <>{children}</>;
};

/* ===== Router ===== */
export const createRouterConfig = () =>
  createBrowserRouter([
    {
      path: layoutUrl,
      element: <Layout />,
      children: [
        {
          path: layoutUrl,
          element: (
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          ),
          children: [
            {
              path: homeUrl,
              element: <div>Trang chủ</div>,
            },
            {
              path: testURL,
              element: <Test />,
            },
            {
              path: warehouseProductsURL,
              element: <Products />,
            },
            {
              path: warehouseMaterialsURL,
              element: <Materials />,
            },
            {
              path: seaManagementInvoiceImportURL,
              element: <ImportDeclarations />,
            },
            {
              path: seaManagementInvoiceExportURL,
              element: <ExportDeclaration />,
            },
            {
              path: standardNormsURL,
              element: <Norms />,
            },
            {
              path: unitsURL,
              element: <Units />,
            },
            {
              path: unitConversionURL,
              element: <UoM />,
            },
            {
              path: warehouseClosingProductsURL,
              element: <ProductStore />,
            },
            {
              path: warehouseClosingMaterialsURL,
              element: <MaterialStore />,
            },
                {
                    path: prepareSettlementReportUserURL,
                    element: <MaterialSettlementReport />,
                },
                {
                    path: prepareSettlementReportInventoryProductURL,
                    element: <ProductSettlementReport />,
                },
                {
                    path: productsURL,
                    element: <Products/>
                },
                {
                    path: unitsURL,
                    element: <Units/>
                },
                {
                    path: compareMaterialCodesURL,
                    element: <CompareMaterialCodes/>
                },
                {
                    path: FiscalImportDeclarationsURL,
                    element: <SetupFiscalImportDeclarations/>
                },
                {
                    path: FiscalExportDeclarationsURL,
                    element: <SetupFiscalExportDeclarations/>
                },
                {
                    path: MaterialStoresURL,
                    element: <MaterialStores/>
                },
                {
                    path: prepareSettlementReportInventorySummaryURL,
                    element: <MaterialInventorySummary />,
                },
          ],
        },
        {
          path: testURL,
          element: <Test />,
        },
      ],
    },
    {
      path: signinUrl,
      element: (
        <AuthOnlyRoute>
          <Login />
        </AuthOnlyRoute>
      ),
    },
    {
      path: registerUrl,
      element: (
        <AuthOnlyRoute>
          <Register />
        </AuthOnlyRoute>
      ),
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
