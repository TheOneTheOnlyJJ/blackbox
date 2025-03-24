import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPC_API_RESPONSE_STATUSES } from "@shared/IPC/IPCAPIResponseStatus";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { LogFunctions } from "electron-log";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";

export const useSignedInUserInfoState = (
  logger: LogFunctions
): {
  signedInUserInfo: ISignedInUserInfo | null;
  signedInNavigationEntryIndex: number;
} => {
  const navigate: NavigateFunction = useNavigate();
  const [signedInUserInfo, setSignedInUserInfo] = useState<ISignedInUserInfo | null>(null);
  const [signedInNavigationEntryIndex, setSignedInNavigationEntryIndex] = useState<number>(0);

  useEffect((): void => {
    logger.info(`Signed in navigation entry index: ${signedInNavigationEntryIndex.toString()}.`);
  }, [logger, signedInNavigationEntryIndex]);

  useEffect((): void => {
    logger.info(`Signed in user info changed: ${JSON.stringify(signedInUserInfo, null, 2)}.`);
    let navigationPath: string;
    if (signedInUserInfo === null) {
      navigationPath = "/";
      setSignedInNavigationEntryIndex(0);
    } else {
      navigationPath = `/users/${signedInUserInfo.userId}/dashboard`;
      if (window.navigation.currentEntry === null) {
        logger.error("Window DOM navigation API current entry is null!");
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
    logger.debug("Wiping window navigation history.");
    navigate(navigationPath, { replace: true });
  }, [logger, navigate, signedInUserInfo]);

  useEffect((): (() => void) => {
    const GET_SIGNED_IN_USER_INFO_RESPONSE: IPCAPIResponse<ISignedInUserInfo | null> = window.userAPI.getSignedInUserInfo();
    if (GET_SIGNED_IN_USER_INFO_RESPONSE.status !== IPC_API_RESPONSE_STATUSES.SUCCESS) {
      enqueueSnackbar({ message: "Error getting signed in user info.", variant: "error" });
      setSignedInUserInfo(null);
    } else {
      setSignedInUserInfo(GET_SIGNED_IN_USER_INFO_RESPONSE.data);
    }
    // Monitor changes to signed in user
    const removeOnSignedInUserChangedListener: () => void = window.userAPI.onSignedInUserChanged(
      (newSignedInUserInfo: ISignedInUserInfo | null): void => {
        setSignedInUserInfo(newSignedInUserInfo);
      }
    );
    return (): void => {
      logger.debug("Removing signed in user event listeners.");
      removeOnSignedInUserChangedListener();
    };
  }, [logger]);

  return {
    signedInUserInfo: signedInUserInfo,
    signedInNavigationEntryIndex: signedInNavigationEntryIndex
  };
};
