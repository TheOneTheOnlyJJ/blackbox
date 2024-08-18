import { IIPCEncryptionAPI } from "../shared/IPC/APIs/IIPCEncryptionAPI";
import { IUserAPI } from "../shared/IPC/APIs/IUserAPI";

declare global {
  interface Window {
    IPCEncryptionAPI: IIPCEncryptionAPI;
    userAPI: IUserAPI;
  }
}

// Ensure TypeScript recognizes this file as part of the global declarations
export {};
