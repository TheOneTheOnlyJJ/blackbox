import { sendLogToMainProcess } from "@preload/utils/sendLogToMainProcess";
import {
  IUserDataBoxAPI,
  IUserDataBoxNameAvailabilityRequest,
  USER_DATA_BOX_API_IPC_CHANNELS,
  UserDataBoxAPIIPCChannel
} from "@shared/IPC/APIs/IUserDataBoxAPI";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IUserDataBoxConfigCreateDTO } from "@shared/user/data/box/create/DTO/UserDataBoxConfigCreateDTO";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { ipcRenderer } from "electron";

const PRELOAD_IPC_USER_DATA_BOX_API_LOG_SCOPE = "p-ipc-udata-box-api";

export const USER_DATA_BOX_API_PRELOAD_HANDLERS: IUserDataBoxAPI = {
  isUserDataBoxNameAvailableForUserDataStorage: (
    encryptedUserDataBoxNameAvailabilityRequest: IEncryptedData<IUserDataBoxNameAvailabilityRequest>
  ): IPCAPIResponse<boolean> => {
    const CHANNEL: UserDataBoxAPIIPCChannel = USER_DATA_BOX_API_IPC_CHANNELS.isUserDataBoxNameAvailableForUserDataStorage;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_BOX_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserDataBoxNameAvailabilityRequest) as IPCAPIResponse<boolean>;
  },
  addNewUserDataBox: (encryptedUserDataBoxConfigCreateDTO: IEncryptedData<IUserDataBoxConfigCreateDTO>): IPCAPIResponse<boolean> => {
    const CHANNEL: UserDataBoxAPIIPCChannel = USER_DATA_BOX_API_IPC_CHANNELS.addNewUserDataBox;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_BOX_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserDataBoxConfigCreateDTO) as IPCAPIResponse<boolean>;
  }
};
