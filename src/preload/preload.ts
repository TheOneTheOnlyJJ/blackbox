import { contextBridge } from "electron";
import { USER_AUTH_API_PRELOAD_HANDLERS } from "./IPC/APIs/UserAuthenticationAPI";
import { USER_ACCOUNT_STORAGE_API_PRELOAD_HANDLERS } from "./IPC/APIs/UserAccountStorageAPI";
import { USER_DATA_STORAGE_CONFIG_API_PRELOAD_HANDLERS } from "./IPC/APIs/UserDataStorageConfigAPI";
import { USER_DATA_STORAGE_VISIBILITY_GROUP_API_PRELOAD_HANDLERS } from "./IPC/APIs/UserDataStorageVisibilityGroupAPI";
import { UTILS_API_PRELOAD_HANDLERS } from "./IPC/APIs/UtilsAPI";
import { bootstrapIPCTLS, IPC_TLS_API_PRELOAD_HANDLERS } from "./IPC/APIs/IPCTLSAPI";

void bootstrapIPCTLS();
// Expose the APIs in the renderer
contextBridge.exposeInMainWorld("IPCTLSAPI", IPC_TLS_API_PRELOAD_HANDLERS);
contextBridge.exposeInMainWorld("userAuthAPI", USER_AUTH_API_PRELOAD_HANDLERS);
contextBridge.exposeInMainWorld("userAccountStorageAPI", USER_ACCOUNT_STORAGE_API_PRELOAD_HANDLERS);
contextBridge.exposeInMainWorld("userDataStorageConfigAPI", USER_DATA_STORAGE_CONFIG_API_PRELOAD_HANDLERS);
contextBridge.exposeInMainWorld("userDataStorageVisibilityGroupAPI", USER_DATA_STORAGE_VISIBILITY_GROUP_API_PRELOAD_HANDLERS);
contextBridge.exposeInMainWorld("utilsAPI", UTILS_API_PRELOAD_HANDLERS);
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
