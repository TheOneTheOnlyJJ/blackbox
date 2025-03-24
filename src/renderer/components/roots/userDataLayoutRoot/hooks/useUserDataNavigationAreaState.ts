import { UserDataNavigationArea } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import { LogFunctions } from "electron-log";
import { useState, useEffect, Dispatch, SetStateAction } from "react";

export const useUserDataNavigationAreaState = (
  logger: LogFunctions
): [UserDataNavigationArea | null, Dispatch<SetStateAction<UserDataNavigationArea | null>>] => {
  const [userDataNavigationArea, setUserDataNavigationArea] = useState<UserDataNavigationArea | null>(null);

  useEffect((): void => {
    logger.info(`User data navigation area changed: ${userDataNavigationArea === null ? "null" : `"${userDataNavigationArea}"`}.`);
  }, [logger, userDataNavigationArea]);

  return [userDataNavigationArea, setUserDataNavigationArea];
};
