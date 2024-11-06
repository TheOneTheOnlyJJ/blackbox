import { FC } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import AppRoot from "@renderer/components/roots/appRoot/AppRoot";
import SignInPage from "@renderer/pages/SignInPage";
import SignUpPage from "@renderer/pages/SignUpPage";
import AccountDashboardPage from "@renderer/pages/AccountDashboardPage";
import ForbiddenPage from "@renderer/pages/ForbiddenPage";
import SigningOutPage from "@renderer/pages/SigningOutPage";
import SignedInRoot from "@renderer/components/roots/signedInRoot/SignedInRoot";
import UserDataStoragesPage from "@renderer/pages/UserDataStoragesPage";
import ProfilePage from "@renderer/pages/ProfilePage";
import SettingsPage from "@renderer/pages/SettingsPage";
import SignedInDashboardLayoutRoot from "@renderer/components/roots/signedInDashboardLayoutRoot/SignedInDashboardLayoutRoot";

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
        path: "signing-out",
        element: <SigningOutPage />
      },
      {
        path: "users/:username",
        element: <SignedInRoot />,
        children: [
          {
            element: <SignedInDashboardLayoutRoot />,
            children: [
              {
                path: "dashboard",
                element: <AccountDashboardPage />
              },
              {
                path: "userDataStorages",
                element: <UserDataStoragesPage />
              },
              {
                path: "profile",
                element: <ProfilePage />
              },
              {
                path: "settings",
                element: <SettingsPage />
              }
            ]
          }
        ]
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
