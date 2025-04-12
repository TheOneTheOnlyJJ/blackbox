import { sendLogToMainProcess } from "@preload/utils/sendLogToMainProcess";
import {
  AvailableUserDataBoxesChangedCallback,
  IUserDataBoxAPI,
  USER_DATA_BOX_API_IPC_CHANNELS,
  UserDataBoxAPIIPCChannel
} from "@shared/IPC/APIs/IUserDataBoxAPI";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IUserDataBoxConfigCreateDTO } from "@shared/user/data/box/create/DTO/UserDataBoxConfigCreateDTO";
import { IUserDataBoxNameAvailabilityRequest } from "@shared/user/data/box/create/UserDataBoxNameAvailabilityRequest";
import { IUserDataBoxInfo } from "@shared/user/data/box/info/UserDataBoxInfo";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { ipcRenderer, IpcRendererEvent } from "electron";

const PRELOAD_IPC_USER_DATA_BOX_API_LOG_SCOPE = "p-ipc-udata-box-api";

export const USER_DATA_BOX_API_PRELOAD_HANDLERS: IUserDataBoxAPI = {
  isUserDataBoxNameAvailableForUserDataStorage: (
    encryptedUserDataBoxNameAvailabilityRequest: IEncryptedData<IUserDataBoxNameAvailabilityRequest>
  ): IPCAPIResponse<boolean> => {
    const CHANNEL: UserDataBoxAPIIPCChannel = USER_DATA_BOX_API_IPC_CHANNELS.isUserDataBoxNameAvailableForUserDataStorage;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_BOX_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserDataBoxNameAvailabilityRequest) as IPCAPIResponse<boolean>;
  },
  addUserDataBoxConfig: (encryptedUserDataBoxConfigCreateDTO: IEncryptedData<IUserDataBoxConfigCreateDTO>): IPCAPIResponse<boolean> => {
    const CHANNEL: UserDataBoxAPIIPCChannel = USER_DATA_BOX_API_IPC_CHANNELS.addUserDataBoxConfig;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_BOX_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserDataBoxConfigCreateDTO) as IPCAPIResponse<boolean>;
  },
  getAllSignedInUserAvailableUserDataBoxesInfo: (): IPCAPIResponse<IEncryptedData<IUserDataBoxInfo[]>> => {
    const CHANNEL: UserDataBoxAPIIPCChannel = USER_DATA_BOX_API_IPC_CHANNELS.getAllSignedInUserAvailableUserDataBoxesInfo;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_BOX_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<IEncryptedData<IUserDataBoxInfo[]>>;
  },
  onAvailableUserDataBoxesChanged: (callback: AvailableUserDataBoxesChangedCallback): (() => void) => {
    const CHANNEL: UserDataBoxAPIIPCChannel = USER_DATA_BOX_API_IPC_CHANNELS.onAvailableUserDataBoxesChanged;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_BOX_API_LOG_SCOPE, "debug", `Adding listener from main on channel: "${CHANNEL}".`);
    const LISTENER = (
      _: IpcRendererEvent,
      encryptedAvailableUserDataBoxesInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataBoxInfo>>
    ): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_DATA_BOX_API_LOG_SCOPE, "debug", `Received message from main on channel: "${CHANNEL}".`);
      callback(encryptedAvailableUserDataBoxesInfoChangedDiff);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_DATA_BOX_API_LOG_SCOPE, "debug", `Removing listener from main on channel: "${CHANNEL}".`);
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  }
};
