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
import UserDataStoragesNavigationAreaLayoutRoot from "./components/roots/userDataStoragesNavigationAreaLayoutRoot/UserDataStoragesNavigationAreaLayoutRoot";
import InitialisedUserDataStoragesPage from "./pages/InitialisedUserDataStoragesPage";
import AvailableUserDataBoxesPage from "./pages/AvailableUserDataBoxesPage";
import UserDataBoxesNavigationAreaLayoutRoot from "./components/roots/userDataBoxesNavigationAreaLayoutRoot/UserDataBoxesNavigationAreaLayoutRoot";

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
                children: [
                  {
                    path: "storages",
                    element: <UserDataStoragesNavigationAreaLayoutRoot />,
                    children: [
                      {
                        path: "configs",
                        element: <UserDataStorageConfigsPage />
                      },
                      {
                        path: "initialised",
                        element: <InitialisedUserDataStoragesPage />
                      },
                      {
                        path: "visibilityGroups",
                        element: <UserDataStorageVisibilityGroupsPage />
                      }
                    ]
                  },
                  {
                    path: "boxes",
                    element: <UserDataBoxesNavigationAreaLayoutRoot />,
                    children: [
                      {
                        path: "available",
                        element: <AvailableUserDataBoxesPage />
                      }
                    ]
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
