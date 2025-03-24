import { FC, useEffect } from "react";
import { appLogger } from "@renderer/utils/loggers";
import { Outlet, useLocation, Location } from "react-router-dom";
import { IAppRootContext } from "./AppRootContext";
import { SnackbarProvider } from "notistack";
import Box from "@mui/material/Box/Box";
import { IIPCTLSReadinessInfo, useIPCTLSReadinessState } from "./hooks/useIPCTLSReadinessState";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { useUserAccountStorageInfoState } from "./hooks/useUserAccountStorageInfoState";
import { useSignedInUserInfoState } from "./hooks/useSignedInUserInfoState";

const AppRoot: FC = () => {
  const location: Location = useLocation();
  const isIPCTLSReady: IIPCTLSReadinessInfo = useIPCTLSReadinessState(appLogger);
  const userAccountStorageInfo: IUserAccountStorageInfo | null = useUserAccountStorageInfoState(appLogger);
  const { signedInUserInfo, signedInNavigationEntryIndex } = useSignedInUserInfoState(appLogger);

  useEffect((): void => {
    appLogger.info(`Navigated to: "${location.pathname}".`);
  }, [location]);

  useEffect((): (() => void) => {
    appLogger.debug("Rendering App Root component.");
    return (): void => {
      appLogger.debug("Removing App Root component.");
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
            signedInUserInfo: signedInUserInfo,
            signedInNavigationEntryIndex: signedInNavigationEntryIndex,
            userAccountStorageInfo: userAccountStorageInfo,
            isIPCTLSReady: isIPCTLSReady
          } satisfies IAppRootContext
        }
      />
    </Box>
  );
};

export default AppRoot;
