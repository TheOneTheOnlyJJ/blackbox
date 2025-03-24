import { FC } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import AppRoot from "@renderer/components/roots/appRoot/AppRoot";
import SignInPage from "@renderer/pages/SignInPage";
import SignUpPage from "@renderer/pages/SignUpPage";
import AccountDashboardPage from "@renderer/pages/AccountDashboardPage";
import ForbiddenPage from "@renderer/pages/ForbiddenPage";
import SignOutPage from "@renderer/pages/SignOutPage";
import SignedInRoot from "@renderer/components/roots/signedInRoot/SignedInRoot";
import UserDataStorageConfigsPage from "@renderer/pages/UserDataStorageConfigsPage";
import ProfilePage from "@renderer/pages/ProfilePage";
import SettingsPage from "@renderer/pages/SettingsPage";
import DashboardLayoutRoot from "@renderer/components/roots/dashboardLayoutRoot/DashboardLayoutRoot";
import UserDataStorageVisibilityGroupsPage from "./pages/UserDataStorageVisibilityGroupsPage";
import UserDataLayoutRoot from "./components/roots/userDataLayoutRoot/UserDataLayoutRoot";

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
        path: "signout",
        element: <SignOutPage />
      },
      {
        path: "users/:userId",
        element: <SignedInRoot />,
        children: [
          {
            element: <DashboardLayoutRoot />,
            children: [
              {
                path: "dashboard",
                element: <AccountDashboardPage />
              },
              {
                path: "data",
                element: <UserDataLayoutRoot />,
                children: [
                  {
                    path: "storageConfigs",
                    element: <UserDataStorageConfigsPage />
                  },
                  {
                    path: "visibilityGroups",
                    element: <UserDataStorageVisibilityGroupsPage />
                  }
                ]
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
