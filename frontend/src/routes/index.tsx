import { createBrowserRouter } from "react-router-dom";
import { homeUrl, layoutUrl, testURL } from "./urls";
import Layout from "../modules/app/Layout";
import Test from "../modules/Test/Test";
import { NotFound } from "../modules/NotFound/NotFound";

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
        }
    ]);