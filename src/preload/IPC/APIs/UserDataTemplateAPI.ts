import { sendLogToMainProcess } from "@preload/utils/sendLogToMainProcess";
import {
  AvailableUserDataTemplatesChangedCallback,
  IUserDataTemplateAPI,
  USER_DATA_TEMPLATE_API_IPC_CHANNELS,
  UserDataTemplateAPIIPCChannel
} from "@shared/IPC/APIs/UserDataTemplateAPI";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IUserDataTemplateCreateDTO } from "@shared/user/data/template/create/DTO/UserDataTemplateCreateDTO";
import { IUserDataTemplateNameAvailabilityRequest } from "@shared/user/data/template/create/UserDataTemplateNameAvailabilityRequest";
import { IUserDataTemplateInfo } from "@shared/user/data/template/info/UserDataTemplateInfo";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { ipcRenderer, IpcRendererEvent } from "electron";

const PRELOAD_IPC_USER_DATA_TEMPLATE_API_LOG_SCOPE = "p-ipc-udata-tmpl-api";

export const USER_DATA_TEMPLATE_API_PRELOAD_HANDLERS: IUserDataTemplateAPI = {
  isUserDataTemplateNameAvailable: (
    encryptedUserDataTemplateNameAvailabilityRequest: IEncryptedData<IUserDataTemplateNameAvailabilityRequest>
  ): IPCAPIResponse<boolean> => {
    const CHANNEL: UserDataTemplateAPIIPCChannel = USER_DATA_TEMPLATE_API_IPC_CHANNELS.isUserDataTemplateNameAvailable;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_TEMPLATE_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserDataTemplateNameAvailabilityRequest) as IPCAPIResponse<boolean>;
  },
  addUserDataTemplate: (encryptedUserDataTemplateCreateDTO: IEncryptedData<IUserDataTemplateCreateDTO>): IPCAPIResponse<boolean> => {
    const CHANNEL: UserDataTemplateAPIIPCChannel = USER_DATA_TEMPLATE_API_IPC_CHANNELS.addUserDataTemplate;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_TEMPLATE_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserDataTemplateCreateDTO) as IPCAPIResponse<boolean>;
  },
  getAllSignedInUserAvailableUserDataTemplateInfo: (): IPCAPIResponse<IEncryptedData<IUserDataTemplateInfo[]>> => {
    const CHANNEL: UserDataTemplateAPIIPCChannel = USER_DATA_TEMPLATE_API_IPC_CHANNELS.getAllSignedInUserAvailableUserDataTemplateInfo;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_TEMPLATE_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<IEncryptedData<IUserDataTemplateInfo[]>>;
  },
  onAvailableUserDataTemplatesChanged: (callback: AvailableUserDataTemplatesChangedCallback): (() => void) => {
    const CHANNEL: UserDataTemplateAPIIPCChannel = USER_DATA_TEMPLATE_API_IPC_CHANNELS.onAvailableUserDataTemplatesChanged;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_TEMPLATE_API_LOG_SCOPE, "debug", `Adding listener from main on channel: "${CHANNEL}".`);
    const LISTENER = (
      _: IpcRendererEvent,
      encryptedAvailableUserDataTemplatesInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataTemplateInfo>>
    ): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_DATA_TEMPLATE_API_LOG_SCOPE, "debug", `Received message from main on channel: "${CHANNEL}".`);
      callback(encryptedAvailableUserDataTemplatesInfoChangedDiff);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(PRELOAD_IPC_USER_DATA_TEMPLATE_API_LOG_SCOPE, "debug", `Removing listener from main on channel: "${CHANNEL}".`);
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  }
};
