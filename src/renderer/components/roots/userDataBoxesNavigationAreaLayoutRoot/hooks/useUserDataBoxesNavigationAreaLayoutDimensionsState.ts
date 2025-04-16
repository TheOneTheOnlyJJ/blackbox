import { LogFunctions } from "electron-log";
import { useState, useCallback, useLayoutEffect, MutableRefObject, useEffect } from "react";

export const DEFAULT_USER_DATA_BOXES_NAVIGATION_AREA_BAR_WIDTH = 240;

export const useUserDataBoxesNavigationAreaLayoutDimensionsState = (
  logger: LogFunctions,
  userDataBoxesNavigationAreaBarRef: MutableRefObject<HTMLDivElement | null>
): { userDataBoxesNavigationAreaBarWidth: number } => {
  const [userDataBoxesNavigationAreaBarWidth, setUserDataBoxesNavigationAreaBarWidth] = useState<number>(
    DEFAULT_USER_DATA_BOXES_NAVIGATION_AREA_BAR_WIDTH
  );

  useEffect((): void => {
    logger.silly(`Updated User Data Boxes Navigation Area Bar width: ${userDataBoxesNavigationAreaBarWidth.toString()}.`);
  }, [logger, userDataBoxesNavigationAreaBarWidth]);

  const updateUserDataBoxesNavigationAreaBarWidth = useCallback((): void => {
    if (userDataBoxesNavigationAreaBarRef.current) {
      setUserDataBoxesNavigationAreaBarWidth(userDataBoxesNavigationAreaBarRef.current.clientWidth);
    }
  }, [userDataBoxesNavigationAreaBarRef]);

  const updateUserDataBoxesNavigationAreaLayoutComponentDimensions = useCallback((): void => {
    updateUserDataBoxesNavigationAreaBarWidth();
  }, [updateUserDataBoxesNavigationAreaBarWidth]);

  // Measure the necessary component dimensions
  useLayoutEffect((): (() => void) => {
    // Set initial dimensions
    updateUserDataBoxesNavigationAreaLayoutComponentDimensions();
    // Add event listener for window resize
    window.addEventListener("resize", updateUserDataBoxesNavigationAreaLayoutComponentDimensions);
    // Cleanup event listener on component unmount
    return (): void => {
      window.removeEventListener("resize", updateUserDataBoxesNavigationAreaLayoutComponentDimensions);
    };
  }, [updateUserDataBoxesNavigationAreaLayoutComponentDimensions]);

  return {
    userDataBoxesNavigationAreaBarWidth: userDataBoxesNavigationAreaBarWidth
  };
};
