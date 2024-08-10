import { contextBridge, ipcRenderer } from "electron";
import type { AccountManagerConfig } from "../main/user/accountManager/accountManagerFactory";
import { IPCChannel } from "../main/utils/IPCUtils";

// Expose the APIs in the renderer
contextBridge.exposeInMainWorld("userStorageAPI", {
  getDefaultConfig: () => {
    return ipcRenderer.invoke(IPCChannel.userStorageGetDefaultConfig) as Promise<AccountManagerConfig>;
  },
  new: (config: AccountManagerConfig) => {
    return ipcRenderer.invoke(IPCChannel.UserStorageNew, config) as Promise<boolean>;
  }
});
// Exposing these APIs to the global Window interface is done in the preload.d.ts file
