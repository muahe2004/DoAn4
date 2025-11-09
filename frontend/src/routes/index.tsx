import { createBrowserRouter } from "react-router-dom";
import { homeUrl, layoutUrl, testURL, signinUrl, registerUrl } from "./urls";
import Layout from "../modules/app/Layout";
import Test from "../modules/Test/Test";
import { NotFound } from "../modules/NotFound/NotFound";
import Login from "../modules/auth/Login";
import Register from "../modules/auth/Register";

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