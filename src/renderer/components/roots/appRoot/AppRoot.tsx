import { FC, useEffect, useState } from "react";
import { appLogger } from "@renderer/utils/loggers";
import { Outlet, useLocation, Location, useNavigate, NavigateFunction } from "react-router-dom";
import { IAppRootContext } from "./AppRootContext";
import { ISignedInUser } from "@shared/user/account/SignedInUser";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import Box from "@mui/material/Box/Box";
import { ICurrentUserAccountStorage } from "@shared/user/account/storage/CurrentUserAccountStorage";

export interface IOpenNotificationSnackbarProps {
  autoHideDuration?: number;
  message: string;
}

const AppRoot: FC = () => {
  // General
  const location: Location = useLocation();
  const navigate: NavigateFunction = useNavigate();
  // IPC TLS
  const [isMainIPCTLSReady, setIsMainIPCTLSReady] = useState<boolean>(false);
  const [isRendererIPCTLSReady, setIsRendererIPCTLSReady] = useState<boolean>(false);
  // User
  const [currentUserAccountStorage, setCurrentUserAccountStorage] = useState<ICurrentUserAccountStorage | null>(null);
  const [signedInUser, setSignedInUser] = useState<ISignedInUser | null>(null);

  // Log every location change
  useEffect((): void => {
    appLogger.debug(`Navigated to: "${location.pathname}".`);
  }, [location]);

  // Monitor signed in user; Navigate on sign in/out
  // TODO: Fix signout page
  useEffect((): void => {
    appLogger.debug(`Signed in user changed: ${JSON.stringify(signedInUser, null, 2)}.`);
    let navigationPath: string;
    if (signedInUser === null) {
      navigationPath = "/";
    } else {
      navigationPath = `/users/${signedInUser.userId}/dashboard`;
    }
    // Wipe the history stack and navigate to the required path
    appLogger.debug("Wiping window navigation history.");
    window.history.replaceState({ idx: 0 }, "", navigationPath); // TODO: Replace this with a history limit or something to be safer, expose it in app context
    navigate(navigationPath, { replace: true });
  }, [navigate, signedInUser]);

  // Monitor IPC TLS API readiness
  useEffect((): void => {
    appLogger.info(`Main IPC TLS readiness changed: ${isMainIPCTLSReady.toString()}.`);
    if (isMainIPCTLSReady) {
      enqueueSnackbar({ message: "Main IPC TLS ready.", variant: "info" });
    } else {
      enqueueSnackbar({ message: "Main IPC TLS not ready.", variant: "warning" });
    }
  }, [isMainIPCTLSReady]);
  useEffect((): void => {
    appLogger.info(`Renderer IPC TLS readiness changed: ${isRendererIPCTLSReady.toString()}.`);
    if (isRendererIPCTLSReady) {
      enqueueSnackbar({ message: "Renderer IPC TLS ready.", variant: "info" });
    } else {
      enqueueSnackbar({ message: "Renderer IPC TLS not ready.", variant: "warning" });
    }
  }, [isRendererIPCTLSReady]);

  // Monitor User Account Storage changes
  useEffect((): void => {
    appLogger.info(`Current User Account Storage changed: ${JSON.stringify(currentUserAccountStorage, null, 2)}.`);
  }, [currentUserAccountStorage]);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering App Root component.");
    // Get initial app root context
    const GET_CURRENT_USER_ACCOUNT_STORAGE_RESPONSE: IPCAPIResponse<ICurrentUserAccountStorage | null> =
      window.userAPI.getCurrentUserAccountStorage();
    if (GET_CURRENT_USER_ACCOUNT_STORAGE_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      enqueueSnackbar({ message: "Error getting current User Account Storage.", variant: "error" });
      setCurrentUserAccountStorage(null);
    } else {
      setCurrentUserAccountStorage(GET_CURRENT_USER_ACCOUNT_STORAGE_RESPONSE.data);
    }
    const GET_SIGNED_IN_USER_RESPONSE: IPCAPIResponse<ISignedInUser | null> = window.userAPI.getSignedInUser();
    if (GET_SIGNED_IN_USER_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      enqueueSnackbar({ message: "Error getting signed in user.", variant: "error" });
      setSignedInUser(null);
    } else {
      setSignedInUser(GET_SIGNED_IN_USER_RESPONSE.data);
    }
    setIsMainIPCTLSReady(window.IPCTLSAPI.getMainReadiness());
    setIsRendererIPCTLSReady(window.IPCTLSAPI.getRendererReadiness());
    // Monitor changes to main IPC TLS readiness
    const removeOnMainIPCTLSReadinessChangedListener: () => void = window.IPCTLSAPI.onMainReadinessChanged((newIsMainIPCTLSReady: boolean): void => {
      setIsMainIPCTLSReady(newIsMainIPCTLSReady);
    });
    // Monitor changes to renderer IPC TLS readiness
    const removeOnRendererIPCTLSReadinessChangedListener: () => void = window.IPCTLSAPI.onRendererReadinessChanged(
      (newIsRendererIPCTLSReady: boolean): void => {
        setIsRendererIPCTLSReady(newIsRendererIPCTLSReady);
      }
    );
    // Monitor changes to signed in user
    const removeOnSignedInUserChangedListener: () => void = window.userAPI.onSignedInUserChanged((newSignedInUser: ISignedInUser | null): void => {
      setSignedInUser(newSignedInUser);
    });
    // Monitor changes to User Account Storage set status
    const removeOnCurrentUserAccountStorageChangedListener: () => void = window.userAPI.onCurrentUserAccountStorageChanged(
      (newCurrentUserAccountStorage: ICurrentUserAccountStorage | null): void => {
        setCurrentUserAccountStorage(newCurrentUserAccountStorage);
      }
    );
    // Monitor changes to User Account Storage open status
    const removeOnUserAccountStorageOpenChangedListener: () => void = window.userAPI.onUserAccountStorageOpenChanged(
      (isUserAccountStorageOpen: boolean): void => {
        setCurrentUserAccountStorage((prevCurrentUserAccountStorage: ICurrentUserAccountStorage | null): ICurrentUserAccountStorage | null => {
          if (prevCurrentUserAccountStorage === null) {
            appLogger.warn("Current User Account Storage open state changed callback invoked with no current User Account Storage set! No-op.");
            enqueueSnackbar({ message: "Current User Account Storage open state received without being set.", variant: "warning" });
            return null;
          }
          return {
            ...prevCurrentUserAccountStorage,
            isOpen: isUserAccountStorageOpen
          };
        });
      }
    );
    return (): void => {
      appLogger.debug("Removing App Root event listeners.");
      removeOnMainIPCTLSReadinessChangedListener();
      removeOnRendererIPCTLSReadinessChangedListener();
      removeOnSignedInUserChangedListener();
      removeOnCurrentUserAccountStorageChangedListener();
      removeOnUserAccountStorageOpenChangedListener();
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
            signedInUser: signedInUser,
            currentUserAccountStorage: currentUserAccountStorage,
            isIPCTLSReady: {
              main: isMainIPCTLSReady,
              renderer: isRendererIPCTLSReady
            }
          } satisfies IAppRootContext
        }
      />
    </Box>
  );
};

export default AppRoot;
