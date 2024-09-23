import { FC } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import AppRoot from "./appRoot/AppRoot";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import AccountDashboardPage from "./pages/AccountDashboardPage";
import ForbiddenPage from "./pages/ForbiddenPage";

const APP_ROUTER = createHashRouter([
  {
    path: "/",
    element: <AppRoot />,
    children: [
      {
        index: true,
        element: <SignInPage />
      },
      {
        path: "signup",
        element: <SignUpPage />
      },
      {
        path: "users/:userId/dashboard",
        element: <AccountDashboardPage />
      },
      {
        path: "forbidden/:reason",
        element: <ForbiddenPage />
      }
    ]
  }
]);

export const AppRouter: FC = () => {
  return <RouterProvider router={APP_ROUTER} />;
};
