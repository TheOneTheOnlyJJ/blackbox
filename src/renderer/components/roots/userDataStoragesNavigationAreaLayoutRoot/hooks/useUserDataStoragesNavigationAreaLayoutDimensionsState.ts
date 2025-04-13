import { LogFunctions } from "electron-log";
import { useState, useCallback, useLayoutEffect, MutableRefObject, useEffect } from "react";

export const DEFAULT_USER_DATA_STORAGES_NAVIGATION_AREA_BAR_WIDTH = 240;

export const useUserDataStoragesNavigationAreaLayoutDimensionsState = (
  logger: LogFunctions,
  userDataStoragesNavigationAreaBarRef: MutableRefObject<HTMLDivElement | null>
): { userDataStoragesNavigationAreaBarWidth: number } => {
  const [userDataStoragesNavigationAreaBarWidth, setUserDataStoragesNavigationAreaBarWidth] = useState<number>(
    DEFAULT_USER_DATA_STORAGES_NAVIGATION_AREA_BAR_WIDTH
  );

  useEffect((): void => {
    logger.silly(`Updated User Data Storages Navigation Area Bar width: ${userDataStoragesNavigationAreaBarWidth.toString()}.`);
  }, [logger, userDataStoragesNavigationAreaBarWidth]);

  const updateUserDataStoragesNavigationAreaBarWidth = useCallback((): void => {
    if (userDataStoragesNavigationAreaBarRef.current) {
      setUserDataStoragesNavigationAreaBarWidth(userDataStoragesNavigationAreaBarRef.current.clientWidth);
    }
  }, [userDataStoragesNavigationAreaBarRef]);

  const updateUserDataStoragesNavigationAreaLayoutComponentDimensions = useCallback((): void => {
    updateUserDataStoragesNavigationAreaBarWidth();
  }, [updateUserDataStoragesNavigationAreaBarWidth]);

  // Measure the necessary component dimensions
  useLayoutEffect((): (() => void) => {
    // Set initial dimensions
    updateUserDataStoragesNavigationAreaLayoutComponentDimensions();
    // Add event listener for window resize
    window.addEventListener("resize", updateUserDataStoragesNavigationAreaLayoutComponentDimensions);
    // Cleanup event listener on component unmount
    return (): void => {
      window.removeEventListener("resize", updateUserDataStoragesNavigationAreaLayoutComponentDimensions);
    };
  }, [updateUserDataStoragesNavigationAreaLayoutComponentDimensions]);

  return {
    userDataStoragesNavigationAreaBarWidth: userDataStoragesNavigationAreaBarWidth
  };
};
