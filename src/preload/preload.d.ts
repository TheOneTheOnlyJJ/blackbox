import { IUserStorageAPI } from "src/shared/IPC/types";

declare global {
  interface Window {
    userStorageAPI: IUserStorageAPI;
  }
}

// Ensure TypeScript recognizes this file as part of the global declarations
export {};
