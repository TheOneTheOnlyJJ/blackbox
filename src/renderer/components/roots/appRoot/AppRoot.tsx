import { FC, useEffect, useState } from "react";
import { appLogger } from "@renderer/utils/loggers";
import { Outlet, useLocation, Location, useNavigate, NavigateFunction } from "react-router-dom";
import { IAppRootContext } from "./AppRootContext";
import { ICurrentlySignedInUser } from "@shared/user/account/CurrentlySignedInUser";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import Box from "@mui/material/Box/Box";

export interface IOpenNotificationSnackbarProps {
  autoHideDuration?: number;
  message: string;
}

const AppRoot: FC = () => {
  // General
  const location: Location = useLocation();
  const navigate: NavigateFunction = useNavigate();
  // User
  const [isUserAccountStorageBackendAvailable, setIsUserAccountStorageBackendAvailable] = useState<boolean>(false);
  const [currentlySignedInUser, setCurrentlySignedInUser] = useState<ICurrentlySignedInUser | null>(null);

  // Log every location change
  useEffect((): void => {
    appLogger.debug(`Navigated to: "${location.pathname}".`);
  }, [location]);

  // Navigate on sign in/out
  useEffect((): void => {
    appLogger.debug(`Currently signed in user state changed: ${JSON.stringify(currentlySignedInUser, null, 2)}.`);
    let navigationPath: string;
    if (currentlySignedInUser === null) {
      navigationPath = "/";
    } else {
      navigationPath = `/users/${currentlySignedInUser.username}/dashboard`;
    }
    // Wipe the history stack and navigate to the required path
    appLogger.debug("Wiping window navigation history.");
    window.history.replaceState({ idx: 0 }, "", navigationPath);
    navigate(navigationPath, { replace: true });
  }, [navigate, currentlySignedInUser]);

  // Log User Account Storage Backend availability changes
  useEffect((): void => {
    appLogger.debug(`User Account Storage Backend availability changed: ${isUserAccountStorageBackendAvailable.toString()}.`);
  }, [isUserAccountStorageBackendAvailable]);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering App Root component.");
    const IS_USER_ACCOUNT_STORAGE_BACKEND_AVAILABLE_RESPONSE: IPCAPIResponse<boolean> = window.userAPI.isAccountStorageBackendAvailable();
    if (IS_USER_ACCOUNT_STORAGE_BACKEND_AVAILABLE_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      enqueueSnackbar({ message: "Error getting User Account Storage Backend availability.", variant: "error" });
      setIsUserAccountStorageBackendAvailable(false);
    } else {
      setIsUserAccountStorageBackendAvailable(IS_USER_ACCOUNT_STORAGE_BACKEND_AVAILABLE_RESPONSE.data);
    }
    const GET_CURRENTLY_SIGNED_IN_USER_RESPONSE: IPCAPIResponse<ICurrentlySignedInUser | null> = window.userAPI.getCurrentlySignedInUser();
    if (GET_CURRENTLY_SIGNED_IN_USER_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      enqueueSnackbar({ message: "Error getting currently signed in user.", variant: "error" });
      setCurrentlySignedInUser(null);
    } else {
      setCurrentlySignedInUser(GET_CURRENTLY_SIGNED_IN_USER_RESPONSE.data);
    }
    // Monitor changes to renderer IPC TLS readiness
    const removeRendererTLSReadinessChangedListener: () => void = window.IPCTLSAPI.onRendererReadinessChanged((isRendererTLSReady: boolean): void => {
      if (isRendererTLSReady) {
        enqueueSnackbar({ message: "Renderer IPC TLS ready.", variant: "info" });
      } else {
        enqueueSnackbar({ message: "Renderer IPC TLS not ready.", variant: "warning" });
      }
    });
    // Monitor changes to main IPC TLS readiness
    const removeMainTLSReadinessChangedListener: () => void = window.IPCTLSAPI.onMainReadinessChanged((isMainTLSReady: boolean): void => {
      if (isMainTLSReady) {
        enqueueSnackbar({ message: "Main IPC TLS ready.", variant: "info" });
      } else {
        enqueueSnackbar({ message: "Main IPC TLS not ready.", variant: "warning" });
      }
    });
    // Monitor changes to currently signed in user
    const removeOnCurrentlySignedInUserChangedListener: () => void = window.userAPI.onCurrentlySignedInUserChanged(
      (newCurrentlySignedInUser: ICurrentlySignedInUser | null): void => {
        setCurrentlySignedInUser(newCurrentlySignedInUser);
      }
    );
    // Monitor changes to User Account Storage Backend availability status
    const removeOnUserAccountStorageBackendAvailabilityChangedListener: () => void = window.userAPI.onAccountStorageBackendAvailabilityChanged(
      (isUserAccountStorageBackendAvailable: boolean): void => {
        setIsUserAccountStorageBackendAvailable(isUserAccountStorageBackendAvailable);
      }
    );
    return (): void => {
      appLogger.debug("Removing App Root event listeners.");
      removeRendererTLSReadinessChangedListener();
      removeMainTLSReadinessChangedListener();
      removeOnCurrentlySignedInUserChangedListener();
      removeOnUserAccountStorageBackendAvailabilityChangedListener();
    };
  }, []);

  return (
    <Box sx={{ width: "100vw", height: "100vh" }}>
      <SnackbarProvider
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        maxSnack={1 /* Adhering to Material Design guidelines */}
        autoHideDuration={5_000}
      />
      <Outlet
        context={
          {
            currentlySignedInUser: currentlySignedInUser,
            isUserAccountStorageBackendAvailable: isUserAccountStorageBackendAvailable
          } satisfies IAppRootContext
        }
      />
    </Box>
  );
};

export default AppRoot;
