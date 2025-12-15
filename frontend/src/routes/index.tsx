import { createBrowserRouter } from "react-router-dom";
import { homeUrl, layoutUrl, testURL, signinUrl, registerUrl, productsURL } from "./urls";
import Layout from "../modules/app/Layout";
import Test from "../modules/Test/Test";
import { NotFound } from "../modules/NotFound/NotFound";
import Login from "../modules/auth/Login";
import Register from "../modules/auth/Register";
import { Products } from "../modules/products/views/Products";
import Material from "../modules/units/views/material";
import Product from "../modules/units/views/product";
import UnitConversion from "../modules/units/views/UoM";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {return <>{children}</>};

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
                },
                /* ================== DATA CONVERSION ================== */
                {
                    path: "/data-conversion/material",
                    element: <Material />,
                },
                {
                    path: "/data-conversion/product",
                    element: <Product />,
                },
                {
                    path: "/data-conversion/uom",
                    element: <UnitConversion />,
                },
            ],
        },
        {
            path: "*",
            element: <NotFound />,
        },
        {
            path: signinUrl,
            element: <Login />
        },
        {
            path: registerUrl,
            element: <Register />
        }
    ]);