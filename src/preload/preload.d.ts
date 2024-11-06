import { IIPCTLSAPI } from "@shared/IPC/APIs/IPCTLSAPI";
import { IUserAPI } from "@shared/IPC/APIs/UserAPI";

declare global {
  interface Window {
    IPCTLSAPI: IIPCTLSAPI;
    userAPI: IUserAPI;
  }
}

// Ensure TypeScript recognizes this file as part of the global declarations
export {};
