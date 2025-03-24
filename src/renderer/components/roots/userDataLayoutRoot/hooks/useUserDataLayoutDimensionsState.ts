import { LogFunctions } from "electron-log";
import { useState, useCallback, useLayoutEffect, MutableRefObject, useEffect } from "react";

export const DEFAULT_USER_DATA_NAVIGATION_BAR_WIDTH = 240;

export const useUserDataLayoutDimensionsState = (
  logger: LogFunctions,
  userDataNavigationBarRef: MutableRefObject<HTMLDivElement | null>
): { userDataNavigationBarWidth: number } => {
  const [userDataNavigationBarWidth, setUserDataNavigationBarWidth] = useState<number>(DEFAULT_USER_DATA_NAVIGATION_BAR_WIDTH);

  useEffect((): void => {
    logger.silly(`Updated Data Navigation Bar width: ${userDataNavigationBarWidth.toString()}.`);
  }, [logger, userDataNavigationBarWidth]);

  const updateUserDataNavigationBarWidth = useCallback((): void => {
    if (userDataNavigationBarRef.current) {
      setUserDataNavigationBarWidth(userDataNavigationBarRef.current.clientWidth);
    }
  }, [userDataNavigationBarRef]);

  const updateUserDataLayoutComponentDimensions = useCallback((): void => {
    updateUserDataNavigationBarWidth();
  }, [updateUserDataNavigationBarWidth]);

  // Measure the necessary component dimensions
  useLayoutEffect((): (() => void) => {
    // Set initial dimensions
    updateUserDataLayoutComponentDimensions();
    // Add event listener for window resize
    window.addEventListener("resize", updateUserDataLayoutComponentDimensions);
    // Cleanup event listener on component unmount
    return (): void => {
      window.removeEventListener("resize", updateUserDataLayoutComponentDimensions);
    };
  }, [updateUserDataLayoutComponentDimensions]);

  return {
    userDataNavigationBarWidth: userDataNavigationBarWidth
  };
};
