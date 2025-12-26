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
  warehouseClosingProductsURL,
  warehouseClosingMaterialsURL,
} from "./urls";
import Layout from "../modules/app/Layout";
import Test from "../modules/Test/Test";
import { NotFound } from "../modules/NotFound/NotFound";
import Login from "../modules/auth/views/Login";
import Register from "../modules/auth/views/Register";
import { Products } from "../modules/products/views/Products";
import { Materials } from "../modules/materials/views/Materials";
import { isAuthenticated } from "../modules/auth/services/authState";
import { ImportDeclarations } from "../modules/import/views/ImportDeclarations";
import { Norms } from "../modules/standard-management/norms/views/Norms";
import ProductStore from "../modules/product-store/views/ProductStore";
import MaterialStore from "../modules/material-store/views/MaterialStore";

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
              path: standardNormsURL,
              element: <Norms />,
            },
            {
              path: warehouseClosingProductsURL,
              element: <ProductStore />,
            },
            {
              path: warehouseClosingMaterialsURL,
              element: <MaterialStore />,
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
