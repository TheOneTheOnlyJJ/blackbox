import { FC } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Root from "./root/Root";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const APP_ROUTER = createHashRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <LoginPage />
      },
      {
        path: "register",
        element: <RegisterPage />
      }
    ]
  }
]);

export const App: FC = () => {
  return <RouterProvider router={APP_ROUTER} />;
};
