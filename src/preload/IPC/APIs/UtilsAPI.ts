import { sendLogToMainProcess } from "@preload/utils/sendLogToMainProcess";
import { IUtilsAPI, UtilsAPIIPCChannel, UTILS_API_IPC_CHANNELS, IGetDirectoryPathWithPickerOptions } from "@shared/IPC/APIs/UtilsAPI";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { ipcRenderer } from "electron";

const PRELOAD_IPC_UTILS_API_LOG_SCOPE = "p-ipc-utls-api";

export const UTILS_API_PRELOAD_HANDLERS: IUtilsAPI = {
  getDirectoryPathWithPicker: async (options: IGetDirectoryPathWithPickerOptions): Promise<IPCAPIResponse<IEncryptedData<string[]> | null>> => {
    const CHANNEL: UtilsAPIIPCChannel = UTILS_API_IPC_CHANNELS.getDirectoryPathWithPicker;
    sendLogToMainProcess(PRELOAD_IPC_UTILS_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.invoke(CHANNEL, options) as Promise<IPCAPIResponse<IEncryptedData<string[]> | null>>;
  }
} as const;
