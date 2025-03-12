import { IIPCTLSAPI } from "@shared/IPC/APIs/IPCTLSAPI";
import { IUserAPI } from "@shared/IPC/APIs/UserAPI";
import { IUtilsAPI } from "@shared/IPC/APIs/UtilsAPI";

declare global {
  interface Window {
    IPCTLSAPI: IIPCTLSAPI;
    userAPI: IUserAPI;
    utilsAPI: IUtilsAPI;
  }
}

// Ensure TypeScript recognizes this file as part of the global declarations
export {};
