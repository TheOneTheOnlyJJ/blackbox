import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  newUserAccountManager: () => {
    ipcRenderer.send("new-user-account-manager");
  },
  onCreatedUserAccountManager: (callback: () => void) => ipcRenderer.on("created-user-account-manager", callback),
  onFailedCreatingUserAccountManager: (callback: () => void) => ipcRenderer.on("failed-creating-user-account-manager", callback)
});
