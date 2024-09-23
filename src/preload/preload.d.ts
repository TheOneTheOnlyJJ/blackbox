import { IIPCTLSAPI } from "../shared/IPC/APIs/IIPCTLSAPI";
import { IUserAPI } from "../shared/IPC/APIs/IUserAPI";

declare global {
  interface Window {
    IPCTLSAPI: IIPCTLSAPI;
    userAPI: IUserAPI;
  }
}

// Ensure TypeScript recognizes this file as part of the global declarations
export {};
