import { IIPCTLSAPI } from "@shared/IPC/APIs/IPCTLSAPI";
import { IUserAuthAPI } from "@shared/IPC/APIs/UserAuthAPI";
import { IUserAccountStorageAPI } from "@shared/IPC/APIs/UserAccountStorageAPI";
import { IUserDataStorageConfigAPI } from "@shared/IPC/APIs/UserDataStorageConfigAPI";
import { IUtilsAPI } from "@shared/IPC/APIs/UtilsAPI";
import { IUserDataStorageVisibilityGroupAPI } from "@shared/IPC/APIs/UserDataStorageVisibilityGroupAPI";
import { IUserDataStorageAPI } from "@shared/IPC/APIs/UserDataStorageAPI";

declare global {
  interface Window {
    IPCTLSAPI: IIPCTLSAPI;
    userAuthAPI: IUserAuthAPI;
    userAccountStorageAPI: IUserAccountStorageAPI;
    userDataStorageConfigAPI: IUserDataStorageConfigAPI;
    userDataStorageAPI: IUserDataStorageAPI;
    userDataStorageVisibilityGroupAPI: IUserDataStorageVisibilityGroupAPI;
    utilsAPI: IUtilsAPI;
  }
}

// Ensure TypeScript recognizes this file as part of the global declarations
export {};
