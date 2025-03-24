import { LogFunctions } from "electron-log";
import { useState, useCallback } from "react";

export const DEFAULT_FORBIDDEN_LOCATION_NAME = "this";

export const useForbiddenLocationNameState = (logger: LogFunctions): [string, (newForbiddenLocationName: string) => void] => {
  const [forbiddenLocationName, setForbiddenLocationName] = useState<string>(DEFAULT_FORBIDDEN_LOCATION_NAME);
  const URIencodeAndSetForbiddenLocationName = useCallback(
    (newForbiddenLocationname: string): void => {
      try {
        newForbiddenLocationname = encodeURIComponent(newForbiddenLocationname);
      } catch (error: unknown) {
        const ERROR_MESSAGE = error instanceof Error ? error.message : String(error);
        logger.error(`Could not set forbidden location name: ${ERROR_MESSAGE}!`);
        newForbiddenLocationname = DEFAULT_FORBIDDEN_LOCATION_NAME;
      } finally {
        setForbiddenLocationName(newForbiddenLocationname);
      }
    },
    [logger]
  );

  return [forbiddenLocationName, URIencodeAndSetForbiddenLocationName];
};
