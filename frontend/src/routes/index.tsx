/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from "react-router-dom";
import { homeUrl, layoutUrl, testURL, signinUrl, registerUrl, productsURL } from "./urls";
import Layout from "../modules/app/Layout";
import Test from "../modules/Test/Test";
import { NotFound } from "../modules/NotFound/NotFound";
import Login from "../modules/auth/views/Login";
import Register from "../modules/auth/views/Register";
import { Products } from "../modules/products/views/Products";
import { isAuthenticated } from "../modules/auth/services/authState";

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
                    path: productsURL,
                    element: <Products/>
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
