import { FC, MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { appLogger } from "@renderer/utils/loggers";
import { Outlet, useLocation, Location, useNavigate, NavigateFunction } from "react-router-dom";
import { IAppRootContext } from "./AppRootContext";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import Box from "@mui/material/Box/Box";
import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { IPublicUserAccountStorageConfig } from "@shared/user/account/storage/PublicUserAccountStorageConfig";

const IS_IPC_TLS_READY_UPDATE_TIMEOUT_DELAY_MS = 1_000;

const AppRoot: FC = () => {
  // General
  const location: Location = useLocation();
  const navigate: NavigateFunction = useNavigate();
  // IPC TLS
  const [isMainIPCTLSReady, setIsMainIPCTLSReady] = useState<boolean>(false);
  const [isRendererIPCTLSReady, setIsRendererIPCTLSReady] = useState<boolean>(false);
  const isIPCTLSReady: boolean = useMemo<boolean>((): boolean => {
    return isMainIPCTLSReady && isRendererIPCTLSReady;
  }, [isMainIPCTLSReady, isRendererIPCTLSReady]);
  // User
  const [currentUserAccountStorageConfig, setCurrentUserAccountStorageConfig] = useState<IPublicUserAccountStorageConfig | null>(null);
  const [signedInUser, setSignedInUser] = useState<IPublicSignedInUser | null>(null);
  // Navigation
  const [signedInNavigationEntryIndex, setSignedInNavigationEntryIndex] = useState<number>(0);
  // Timeouts
  const isIPCTLSReadyUpdateTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null> = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Monitor location
  useEffect((): void => {
    appLogger.info(`Navigated to: "${location.pathname}".`);
  }, [location]);

  // Monitor signed in navigation entry index
  useEffect((): void => {
    appLogger.info(`Signed in navigation entry index: ${signedInNavigationEntryIndex.toString()}.`);
  }, [signedInNavigationEntryIndex]);

  // Monitor signed in user; Navigate on sign in/out
  useEffect((): void => {
    appLogger.info(`Signed in user changed: ${JSON.stringify(signedInUser, null, 2)}.`);
    let navigationPath: string;
    if (signedInUser === null) {
      navigationPath = "/";
      setSignedInNavigationEntryIndex(0);
    } else {
      navigationPath = `/users/${signedInUser.userId}/dashboard`;
      if (window.navigation.currentEntry === null) {
        appLogger.error("Window DOM navigation API current entry is null!");
        setSignedInNavigationEntryIndex(0);
      } else {
        setSignedInNavigationEntryIndex(window.navigation.currentEntry.index);
      }
      // TODO: Delete this - test forbidden page
      // setTimeout((): void => {
      //   setSignedInUser(null);
      // }, 3_000);
    }
    // Wipe the history stack and navigate to the required path
    appLogger.debug("Wiping window navigation history.");
    navigate(navigationPath, { replace: true });
  }, [navigate, signedInUser]);

  // Monitor IPC TLS API readiness
  useEffect((): void => {
    appLogger.info(`Main IPC TLS readiness changed: ${isMainIPCTLSReady.toString()}.`);
  }, [isMainIPCTLSReady]);
  useEffect((): void => {
    appLogger.info(`Renderer IPC TLS readiness changed: ${isRendererIPCTLSReady.toString()}.`);
  }, [isRendererIPCTLSReady]);
  useEffect((): (() => void) => {
    isIPCTLSReadyUpdateTimeoutRef.current = window.setTimeout((): void => {
      if (isIPCTLSReady) {
        enqueueSnackbar({ message: "Secure connection established.", variant: "success" });
      } else {
        enqueueSnackbar({ message: "Secure connection lost.", variant: "warning" });
      }
      isIPCTLSReadyUpdateTimeoutRef.current = null;
    }, IS_IPC_TLS_READY_UPDATE_TIMEOUT_DELAY_MS);
    return (): void => {
      if (isIPCTLSReadyUpdateTimeoutRef.current !== null) {
        clearTimeout(isIPCTLSReadyUpdateTimeoutRef.current);
        isIPCTLSReadyUpdateTimeoutRef.current = null;
        appLogger.debug("Cleared yet unran IPC TLS readiness change timeout.");
      }
    };
  }, [isIPCTLSReady]);

  // Monitor User Account Storage changes
  useEffect((): void => {
    appLogger.info(`Current User Account Storage changed: ${JSON.stringify(currentUserAccountStorageConfig, null, 2)}.`);
  }, [currentUserAccountStorageConfig]);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering App Root component.");
    // Get initial app root context
    const GET_CURRENT_USER_ACCOUNT_STORAGE_RESPONSE: IPCAPIResponse<IPublicUserAccountStorageConfig | null> =
      window.userAPI.getCurrentUserAccountStorageConfig();
    if (GET_CURRENT_USER_ACCOUNT_STORAGE_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      enqueueSnackbar({ message: "Error getting current User Account Storage Config.", variant: "error" });
      setCurrentUserAccountStorageConfig(null);
    } else {
      setCurrentUserAccountStorageConfig(GET_CURRENT_USER_ACCOUNT_STORAGE_RESPONSE.data);
    }
    const GET_SIGNED_IN_USER_RESPONSE: IPCAPIResponse<IPublicSignedInUser | null> = window.userAPI.getSignedInUser();
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
    const removeOnSignedInUserChangedListener: () => void = window.userAPI.onSignedInUserChanged(
      (newSignedInUser: IPublicSignedInUser | null): void => {
        setSignedInUser(newSignedInUser);
      }
    );
    // Monitor changes to User Account Storage set status
    const removeOnCurrentUserAccountStorageChangedListener: () => void = window.userAPI.onCurrentUserAccountStorageChanged(
      (newCurrentUserAccountStorageConfig: IPublicUserAccountStorageConfig | null): void => {
        setCurrentUserAccountStorageConfig(newCurrentUserAccountStorageConfig);
      }
    );
    // Monitor changes to User Account Storage open status
    const removeOnUserAccountStorageOpenChangedListener: () => void = window.userAPI.onUserAccountStorageOpenChanged(
      (newIsUserAccountStorageOpen: boolean): void => {
        setCurrentUserAccountStorageConfig(
          (prevCurrentUserAccountStorageConfig: IPublicUserAccountStorageConfig | null): IPublicUserAccountStorageConfig | null => {
            if (prevCurrentUserAccountStorageConfig === null) {
              appLogger.warn("Current User Account Storage open state changed callback invoked with no current User Account Storage set! No-op.");
              enqueueSnackbar({ message: "Current User Account Storage open state received without being set.", variant: "warning" });
              return null;
            }
            return {
              ...prevCurrentUserAccountStorageConfig,
              isOpen: newIsUserAccountStorageOpen
            };
          }
        );
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
            signedInNavigationEntryIndex: signedInNavigationEntryIndex,
            currentUserAccountStorageConfig: currentUserAccountStorageConfig,
            isIPCTLSReady: {
              main: isMainIPCTLSReady,
              renderer: isRendererIPCTLSReady,
              both: isIPCTLSReady
            }
          } satisfies IAppRootContext
        }
      />
    </Box>
  );
};

export default AppRoot;
