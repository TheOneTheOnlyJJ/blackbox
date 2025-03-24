import { LogFunctions } from "electron-log";
import { enqueueSnackbar } from "notistack";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";

export interface IIPCTLSReadinessInfo {
  main: boolean;
  renderer: boolean;
  both: boolean;
}

export const IS_IPC_TLS_READY_UPDATE_TIMEOUT_DELAY_MS = 1_000;

export const useIPCTLSReadinessState = (logger: LogFunctions, readyUpdateTimeoutDelayMs?: number): IIPCTLSReadinessInfo => {
  const [isMainIPCTLSReady, setIsMainIPCTLSReady] = useState<boolean>(false);
  const [isRendererIPCTLSReady, setIsRendererIPCTLSReady] = useState<boolean>(false);
  const isIPCTLSReady: boolean = useMemo<boolean>((): boolean => {
    return isMainIPCTLSReady && isRendererIPCTLSReady;
  }, [isMainIPCTLSReady, isRendererIPCTLSReady]);

  const isIPCTLSReadyUpdateTimer: MutableRefObject<number> = useRef<number>(0);

  useEffect((): void => {
    logger.info(`Main IPC TLS readiness changed: ${isMainIPCTLSReady.toString()}.`);
  }, [logger, isMainIPCTLSReady]);

  useEffect((): void => {
    logger.info(`Renderer IPC TLS readiness changed: ${isRendererIPCTLSReady.toString()}.`);
  }, [logger, isRendererIPCTLSReady]);

  useEffect((): (() => void) => {
    if (isIPCTLSReadyUpdateTimer.current) {
      clearTimeout(isIPCTLSReadyUpdateTimer.current);
    }
    isIPCTLSReadyUpdateTimer.current = window.setTimeout((): void => {
      if (isIPCTLSReady) {
        enqueueSnackbar({ message: "Secure connection established.", variant: "success" });
      } else {
        enqueueSnackbar({ message: "Secure connection lost.", variant: "warning" });
      }
    }, readyUpdateTimeoutDelayMs ?? IS_IPC_TLS_READY_UPDATE_TIMEOUT_DELAY_MS);
    return (): void => {
      if (isIPCTLSReadyUpdateTimer.current) {
        clearTimeout(isIPCTLSReadyUpdateTimer.current);
        logger.debug("Cleared yet unran IPC TLS readiness change timeout.");
      }
    };
  }, [logger, isIPCTLSReady, readyUpdateTimeoutDelayMs]);

  useEffect((): (() => void) => {
    setIsMainIPCTLSReady(window.IPCTLSAPI.getMainReadiness());
    setIsRendererIPCTLSReady(window.IPCTLSAPI.getRendererReadiness());
    // Monitor changes to main IPC TLS readiness
    const removeOnMainIPCTLSReadinessChangedListener: () => void = window.IPCTLSAPI.onMainReadinessChanged((newIsMainIPCTLSReady: boolean): void => {
      setIsMainIPCTLSReady(newIsMainIPCTLSReady);
    });
    // Monitor changes to renderer IPC TLS readiness
    const removeOnRendererIPCTLSReadinessChangedListener: () => void = window.IPCTLSAPI.onRendererReadinessChanged(
      (newIsRendererIPCTLSReady: boolean): void => {
        setIsRendererIPCTLSReady(newIsRendererIPCTLSReady);
      }
    );
    return (): void => {
      logger.debug("Removing IPC TLS Readiness event listeners.");
      removeOnMainIPCTLSReadinessChangedListener();
      removeOnRendererIPCTLSReadinessChangedListener();
    };
  }, [logger]);

  return {
    main: isMainIPCTLSReady,
    renderer: isRendererIPCTLSReady,
    both: isIPCTLSReady
  } satisfies IIPCTLSReadinessInfo;
};
