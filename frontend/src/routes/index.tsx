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
    seaManagementInvoiceExportURL,
} from "./urls";
import Layout from "../modules/app/Layout";
import Test from "../modules/Test/Test";
import { NotFound } from "../modules/NotFound/NotFound";
import Login from "../modules/auth/views/Login";
import Register from "../modules/auth/views/Register";
import { Products } from "../modules/products/views/Products";
import { Materials } from "../modules/materials/views/Materials";
import { isAuthenticated } from "../modules/auth/services/authState";
import { Exports } from "../modules/exports/views/Exports";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated()) return <Navigate to={signinUrl} replace />;
    return <>{children}</>;
};

const AuthOnlyRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthenticated()) return <Navigate to={homeUrl} replace />;
    return <>{children}</>;
};

export const createRouterConfig = () =>
    createBrowserRouter([
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
                    path: seaManagementInvoiceExportURL,
                    element: <Exports />,
                }
            ],
        },
        {
            path: "*",
            element: <NotFound />,
        },
        {
            path: signinUrl,
            element: (
                <AuthOnlyRoute>
                    <Login />
                </AuthOnlyRoute>
            )
        },
        {
            path: registerUrl,
            element: (
                <AuthOnlyRoute>
                    <Register />
                </AuthOnlyRoute>
            )
        }
    ]);
