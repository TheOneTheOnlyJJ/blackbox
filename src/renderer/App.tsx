import { FC } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import AppRoot from "./appRoot/AppRoot";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CssBaseline from "@mui/material/CssBaseline/CssBaseline";

const APP_ROUTER = createHashRouter([
  {
    path: "/",
    element: <AppRoot />,
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
  return (
    <>
      <CssBaseline />
      <RouterProvider router={APP_ROUTER} />
    </>
  );
};
