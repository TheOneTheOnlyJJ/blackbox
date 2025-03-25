import { sendLogToMainProcess } from "@preload/utils/sendLogToMainProcess";
import {
  IUserDataStorageVisibilityGroupAPI,
  UserDataStorageVisibilityGroupAPIIPCChannel,
  USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS,
  OpenUserDataStorageVisibilityGroupsChangedCallback
} from "@shared/IPC/APIs/UserDataStorageVisibilityGroupAPI";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IUserDataStorageVisibilityGroupConfigCreateDTO } from "@shared/user/data/storage/visibilityGroup/config/create/DTO/UserDataStorageVisibilityGroupConfigCreateDTO";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { IUserDataStorageVisibilityGroupsOpenRequestDTO } from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { ipcRenderer, IpcRendererEvent } from "electron";

const PRELOAD_IPC_USER_DATA_STORAGE_VISIBILITY_GROUP_API_LOG_SCOPE = "preload-ipc-user-data-storage-visibility-group-api";

export const USER_DATA_STORAGE_VISIBILITY_GROUP_API_PRELOAD_HANDLERS: IUserDataStorageVisibilityGroupAPI = {
  isUserDataStorageVisibilityGroupNameAvailableForSignedInUser: (name: string): IPCAPIResponse<boolean> => {
    const CHANNEL: UserDataStorageVisibilityGroupAPIIPCChannel =
      USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.isUserDataStorageVisibilityGroupNameAvailableForSignedInUser;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_VISIBILITY_GROUP_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, name) as IPCAPIResponse<boolean>;
  },
  addUserDataStorageVisibilityGroupConfig: (
    encryptedUserDataStorageVisibilityGroupConfigCreateDTO: IEncryptedData<IUserDataStorageVisibilityGroupConfigCreateDTO>
  ): IPCAPIResponse<boolean> => {
    const CHANNEL: UserDataStorageVisibilityGroupAPIIPCChannel =
      USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.addUserDataStorageVisibilityGroupConfig;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_VISIBILITY_GROUP_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserDataStorageVisibilityGroupConfigCreateDTO) as IPCAPIResponse<boolean>;
  },
  openUserDataStorageVisibilityGroups: (
    encryptedUserDataStorageVisibilityGroupsOpenRequestDTO: IEncryptedData<IUserDataStorageVisibilityGroupsOpenRequestDTO>
  ): IPCAPIResponse<number> => {
    const CHANNEL: UserDataStorageVisibilityGroupAPIIPCChannel =
      USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.openUserDataStorageVisibilityGroups;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_VISIBILITY_GROUP_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, encryptedUserDataStorageVisibilityGroupsOpenRequestDTO) as IPCAPIResponse<number>;
  },
  closeUserDataStorageVisibilityGroups: (userDataStorageVisibilityGroupIds: string[]): IPCAPIResponse<number> => {
    const CHANNEL: UserDataStorageVisibilityGroupAPIIPCChannel =
      USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.closeUserDataStorageVisibilityGroups;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_VISIBILITY_GROUP_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL, userDataStorageVisibilityGroupIds) as IPCAPIResponse<number>;
  },
  getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo: (): IPCAPIResponse<IEncryptedData<IUserDataStorageVisibilityGroupInfo[]>> => {
    const CHANNEL: UserDataStorageVisibilityGroupAPIIPCChannel =
      USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo;
    sendLogToMainProcess(PRELOAD_IPC_USER_DATA_STORAGE_VISIBILITY_GROUP_API_LOG_SCOPE, "debug", `Messaging main on channel: "${CHANNEL}".`);
    return ipcRenderer.sendSync(CHANNEL) as IPCAPIResponse<IEncryptedData<IUserDataStorageVisibilityGroupInfo[]>>;
  },
  onOpenUserDataStorageVisibilityGroupsChanged: (callback: OpenUserDataStorageVisibilityGroupsChangedCallback): (() => void) => {
    const CHANNEL: UserDataStorageVisibilityGroupAPIIPCChannel =
      USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS.onOpenUserDataStorageVisibilityGroupsChanged;
    sendLogToMainProcess(
      PRELOAD_IPC_USER_DATA_STORAGE_VISIBILITY_GROUP_API_LOG_SCOPE,
      "debug",
      `Adding listener from main on channel: "${CHANNEL}".`
    );
    const LISTENER = (
      _: IpcRendererEvent,
      encryptedUserDataStorageVisibilityGroupsInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>>
    ): void => {
      sendLogToMainProcess(
        PRELOAD_IPC_USER_DATA_STORAGE_VISIBILITY_GROUP_API_LOG_SCOPE,
        "debug",
        `Received message from main on channel: "${CHANNEL}".`
      );
      callback(encryptedUserDataStorageVisibilityGroupsInfoChangedDiff);
    };
    ipcRenderer.on(CHANNEL, LISTENER);
    return (): void => {
      sendLogToMainProcess(
        PRELOAD_IPC_USER_DATA_STORAGE_VISIBILITY_GROUP_API_LOG_SCOPE,
        "debug",
        `Removing listener from main on channel: "${CHANNEL}".`
      );
      ipcRenderer.removeListener(CHANNEL, LISTENER);
    };
  }
};
