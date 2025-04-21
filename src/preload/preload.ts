import { contextBridge } from "electron";
import { bootstrapIPCTLS, IPC_TLS_API_PRELOAD_HANDLERS } from "./IPC/APIs/IPCTLSAPI";
import { USER_AUTH_API_PRELOAD_HANDLERS } from "./IPC/APIs/UserAuthAPI";
import { USER_ACCOUNT_STORAGE_API_PRELOAD_HANDLERS } from "./IPC/APIs/UserAccountStorageAPI";
import { USER_DATA_STORAGE_CONFIG_API_PRELOAD_HANDLERS } from "./IPC/APIs/UserDataStorageConfigAPI";
import { USER_DATA_STORAGE_VISIBILITY_GROUP_API_PRELOAD_HANDLERS } from "./IPC/APIs/UserDataStorageVisibilityGroupAPI";
import { UTILS_API_PRELOAD_HANDLERS } from "./IPC/APIs/UtilsAPI";
import { USER_DATA_STORAGE_API_PRELOAD_HANDLERS } from "./IPC/APIs/UserDataStorageAPI";
import { USER_DATA_BOX_API_PRELOAD_HANDLERS } from "./IPC/APIs/UserDataBoxAPI";
import { USER_DATA_TEMPLATE_API_PRELOAD_HANDLERS } from "./IPC/APIs/UserDataTemplateAPI";

void bootstrapIPCTLS();
// Expose the APIs in the renderer
// Exposing these API types to the global Window interface is done in the preload.d.ts file
contextBridge.exposeInMainWorld("IPCTLSAPI", IPC_TLS_API_PRELOAD_HANDLERS);
contextBridge.exposeInMainWorld("userAuthAPI", USER_AUTH_API_PRELOAD_HANDLERS);
contextBridge.exposeInMainWorld("userAccountStorageAPI", USER_ACCOUNT_STORAGE_API_PRELOAD_HANDLERS);
contextBridge.exposeInMainWorld("userDataStorageConfigAPI", USER_DATA_STORAGE_CONFIG_API_PRELOAD_HANDLERS);
contextBridge.exposeInMainWorld("userDataStorageAPI", USER_DATA_STORAGE_API_PRELOAD_HANDLERS);
contextBridge.exposeInMainWorld("userDataStorageVisibilityGroupAPI", USER_DATA_STORAGE_VISIBILITY_GROUP_API_PRELOAD_HANDLERS);
contextBridge.exposeInMainWorld("userDataBoxAPI", USER_DATA_BOX_API_PRELOAD_HANDLERS);
contextBridge.exposeInMainWorld("userDataTemplateAPI", USER_DATA_TEMPLATE_API_PRELOAD_HANDLERS);
contextBridge.exposeInMainWorld("utilsAPI", UTILS_API_PRELOAD_HANDLERS);
