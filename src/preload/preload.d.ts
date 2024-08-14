import { IUserAPI } from "src/shared/IPC/APIs/types";

declare global {
  interface Window {
    userAPI: IUserAPI;
  }
}

// Ensure TypeScript recognizes this file as part of the global declarations
export {};
