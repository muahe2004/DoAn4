import { createBrowserRouter } from "react-router-dom";
import {
  homeUrl,
  layoutUrl,
  testURL,
  signinUrl,
  registerUrl,
  productsURL,
  normsURL,
} from "./urls";
import Layout from "../modules/app/Layout";
import Test from "../modules/Test/Test";
import { NotFound } from "../modules/NotFound/NotFound";
import Login from "../modules/auth/Login";
import Register from "../modules/auth/Register";
import { Products } from "../modules/products/views/Products";
import { Norms } from "../modules/norms/views/Norms";

export const createRouterConfig = () =>
  createBrowserRouter([
    {
      path: layoutUrl,
      element: <Layout />,
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
          element: <Products />,
        },
        {
          path: normsURL,
          element: <Norms />,
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
    {
      path: signinUrl,
      element: <Login />,
    },
    {
      path: registerUrl,
      element: <Register />,
    },
  ]);
