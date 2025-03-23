import { LogFunctions } from "electron-log";
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef, useState } from "react";

export const useDialogOpenState = (logger: LogFunctions, dialogPurposeToLog?: string): [boolean, Dispatch<SetStateAction<boolean>>] => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isInitialMount: MutableRefObject<boolean> = useRef<boolean>(true);

  useEffect((): void => {
    if (isInitialMount.current) {
      // Skip logging on the initial render
      isInitialMount.current = false;
      return;
    }
    logger.debug(`${isOpen ? "Opened" : "Closed"} ${dialogPurposeToLog !== undefined ? `${dialogPurposeToLog} ` : ""}dialog.`);
  }, [isOpen, logger, dialogPurposeToLog]);

  return [isOpen, setIsOpen];
};
