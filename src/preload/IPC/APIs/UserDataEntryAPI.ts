import { sendLogToMainProcess } from "@preload/utils/sendLogToMainProcess";
import {
  AvailableUserDataEntriesChangedCallback,
  IUserDataEntryAPI,
  USER_DATA_ENTRY_API_IPC_CHANNELS,
  UserDataEntryAPIIPCChannel
} from "@shared/IPC/APIs/UserDataEntryAPI";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IUserDataEntryCreateDTO } from "@shared/user/data/entry/create/DTO/UserDataEntryCreateDTO";
import { IUserDataEntryIdentifier } from "@shared/user/data/entry/identifier/UserDataEntryIdentifier";
import { IUserDataEntryInfo } from "@shared/user/data/entry/info/UserDataEntryInfo";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { ipcRenderer, IpcRendererEvent } from "electron";

const PRELOAD_IPC_USER_DATA_ENTRY_API_LOG_SCOPE = "p-ipc-udata-ent-api";

export const USER_DATA_ENTRY_API_PRELOAD_HANDLERS: IUserDataEntryAPI = {
  addUserDataEntry: (encryptedUserDataEntryCreateDTO: IEncryptedData<IUserDataEntryCreateDTO>): IPCAPIResponse<boolean> => {
    const CHANNEL: UserDataEntryAPIIPCChannel = USER_DATA_ENTRY_API_IPC_CHANNELS.addUserDataEntry;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_ENTRY_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserDataEntryCreateDTO) as IPCAPIResponse<boolean>;
  },
  getAllSignedInUserAvailableUserDataEntriesInfo: (): IPCAPIResponse<IEncryptedData<IUserDataEntryInfo[]>> => {
    const CHANNEL: UserDataEntryAPIIPCChannel = USER_DATA_ENTRY_API_IPC_CHANNELS.getAllSignedInUserAvailableUserDataEntriesInfo;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_ENTRY_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<IEncryptedData<IUserDataEntryInfo[]>>;
  },
  onAvailableUserDataEntriesChanged: (callback: AvailableUserDataEntriesChangedCallback): (() => void) => {
    const CHANNEL: UserDataEntryAPIIPCChannel = USER_DATA_ENTRY_API_IPC_CHANNELS.onAvailableUserDataEntriesChanged;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_ENTRY_API_LOG_SCOPE, "debug", `Adding listener from main on channel: "${CHANNEL}".`);
    const LISTENER = (
      _: IpcRendererEvent,
      encryptedAvailableUserDataEntriesInfoChangedDiff: IEncryptedData<IDataChangedDiff<IUserDataEntryIdentifier, IUserDataEntryInfo>>
    ): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_DATA_ENTRY_API_LOG_SCOPE, "debug", `Received message from main on channel: "${CHANNEL}".`);
      callback(encryptedAvailableUserDataEntriesInfoChangedDiff);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_DATA_ENTRY_API_LOG_SCOPE, "debug", `Removing listener from main on channel: "${CHANNEL}".`);
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  }
};
