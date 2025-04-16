import { UserDataBoxesNavigationArea } from "@renderer/navigationAreas/UserDataBoxesNavigationAreas";
import { LogFunctions } from "electron-log";
import { useState, useEffect, Dispatch, SetStateAction } from "react";

export const useUserDataBoxesNavigationAreaState = (
  logger: LogFunctions
): [UserDataBoxesNavigationArea | null, Dispatch<SetStateAction<UserDataBoxesNavigationArea | null>>] => {
  const [userDataBoxesNavigationArea, setUserDataBoxesNavigationArea] = useState<UserDataBoxesNavigationArea | null>(null);

  useEffect((): void => {
    logger.info(`User data boxes navigation area changed: ${userDataBoxesNavigationArea === null ? "null" : `"${userDataBoxesNavigationArea}"`}.`);
  }, [logger, userDataBoxesNavigationArea]);

  return [userDataBoxesNavigationArea, setUserDataBoxesNavigationArea];
};
