import { GridApi, GridAutosizeOptions } from "@mui/x-data-grid";
import { LogFunctions } from "electron-log";
import { MutableRefObject, useCallback, useEffect, useRef } from "react";

export const DEFAULT_GRID_AUTOSIZE_COLUMNS_DELAY_ON_WINDOW_RESIZE_MS = 150;

export interface IUseMUIXDataGridAutosizeColumnsOnWindowResizeProps {
  logger: LogFunctions;
  gridAPIRef: MutableRefObject<GridApi>;
  autosizeOptions: GridAutosizeOptions;
  autosizeDelayMs?: number;
  gridPurposeToLog?: string;
}

export const useMUIXDataGridAutosizeColumnsOnWindowResize = (
  props: IUseMUIXDataGridAutosizeColumnsOnWindowResizeProps
): { gridAutosizeColumns: () => void } => {
  const { logger, gridAPIRef, autosizeOptions, autosizeDelayMs, gridPurposeToLog } = props;
  const autosizeTimer: MutableRefObject<number> = useRef<number>(0);

  // TODO: Make this parametrizes so it can be used in onColumnVisibilityModelChange
  const gridAutosizeColumns = useCallback((): void => {
    gridAPIRef.current
      .autosizeColumns(autosizeOptions)
      .then(
        (): void => {
          logger.info(`Resolved ${gridPurposeToLog ?? ""} grid column autosize.`);
        },
        (reason: unknown): void => {
          const REASON_MESSAGE = reason instanceof Error ? reason.message : String(reason);
          logger.warn(`Rejected ${gridPurposeToLog ?? ""} grid column autosize! Reason: ${REASON_MESSAGE}!`);
        }
      )
      .catch((error: unknown): void => {
        const ERROR_MESSAGE: string = error instanceof Error ? error.message : String(error);
        logger.error(`Error autosizing ${gridPurposeToLog ?? ""} grid columns! Error: ${ERROR_MESSAGE}!`);
      });
  }, [logger, gridAPIRef, autosizeOptions, gridPurposeToLog]);

  const handleWindowResize = useCallback((): void => {
    if (autosizeTimer.current) {
      clearTimeout(autosizeTimer.current);
    }
    autosizeTimer.current = setTimeout((): void => {
      logger.debug(`Autosizing ${gridPurposeToLog ?? ""} grid columns after window resize.`);
      gridAutosizeColumns();
    }, autosizeDelayMs ?? DEFAULT_GRID_AUTOSIZE_COLUMNS_DELAY_ON_WINDOW_RESIZE_MS);
  }, [logger, autosizeDelayMs, gridPurposeToLog, gridAutosizeColumns]);

  useEffect((): (() => void) => {
    window.addEventListener("resize", handleWindowResize);
    return (): void => {
      window.removeEventListener("resize", handleWindowResize);
      if (autosizeTimer.current) {
        clearTimeout(autosizeTimer.current);
      }
    };
  }, [handleWindowResize]);

  return { gridAutosizeColumns: gridAutosizeColumns };
};
