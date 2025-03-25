import { IIPCTLSAPI } from "@shared/IPC/APIs/IPCTLSAPI";
import { IUserAccountAPI } from "@shared/IPC/APIs/UserAPI";
import { IUtilsAPI } from "@shared/IPC/APIs/UtilsAPI";

declare global {
  interface Window {
    IPCTLSAPI: IIPCTLSAPI;
    userAccountAPI: IUserAccountAPI;
    utilsAPI: IUtilsAPI;
  }
}

// Ensure TypeScript recognizes this file as part of the global declarations
export {};
