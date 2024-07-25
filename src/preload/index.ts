import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  newUserStorage: () => ipcRenderer.send("new-user-storage")
});
