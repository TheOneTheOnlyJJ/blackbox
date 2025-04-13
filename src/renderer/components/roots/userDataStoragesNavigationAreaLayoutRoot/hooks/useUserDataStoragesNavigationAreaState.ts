import { UserDataStoragesNavigationArea } from "@renderer/navigationAreas/UserDataStoragesNavigationAreas";
import { LogFunctions } from "electron-log";
import { useState, useEffect, Dispatch, SetStateAction } from "react";

export const useUserDataStoragesNavigationAreaState = (
  logger: LogFunctions
): [UserDataStoragesNavigationArea | null, Dispatch<SetStateAction<UserDataStoragesNavigationArea | null>>] => {
  const [userDataStoragesNavigationArea, setUserDataStoragesNavigationArea] = useState<UserDataStoragesNavigationArea | null>(null);

  useEffect((): void => {
    logger.info(
      `User data storages navigation area changed: ${userDataStoragesNavigationArea === null ? "null" : `"${userDataStoragesNavigationArea}"`}.`
    );
  }, [logger, userDataStoragesNavigationArea]);

  return [userDataStoragesNavigationArea, setUserDataStoragesNavigationArea];
};
