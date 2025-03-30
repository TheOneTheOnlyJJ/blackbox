import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IPCAPIResponse } from "../IPCAPIResponse";

export type InitialisedUserDataStoragesChangedCallback = (
  encryptedInitialisedUserDataStoragesInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataStorageInfo>>
) => void;
export type InitialisedUserDataStorageInfoChangedCallback = (encryptedNewUserDataStorageInfo: IEncryptedData<IUserDataStorageInfo>) => void;

export interface IUserDataStorageAPI {
  initialiseUserDataStorage: (storageId: string) => IPCAPIResponse<IEncryptedData<boolean>>;
  terminateUserDataStorage: (storageId: string) => IPCAPIResponse<IEncryptedData<boolean>>;
  openUserDataStorage: (storageId: string) => IPCAPIResponse<IEncryptedData<boolean>>;
  closeUserDataStorage: (storageId: string) => IPCAPIResponse<IEncryptedData<boolean>>;
  getAllSignedInUserInitialisedDataStoragesInfo: () => IPCAPIResponse<IEncryptedData<IUserDataStorageInfo[]>>;
  onInitialisedUserDataStoragesChanged: (callback: InitialisedUserDataStoragesChangedCallback) => () => void;
  onInitialisedUserDataStorageInfoChanged: (callback: InitialisedUserDataStorageInfoChangedCallback) => () => void;
}

export type UserDataStorageAPIIPCChannels = TransformToIPCAPIChannels<"UserDataStorageAPI", IUserDataStorageAPI>;
export type UserDataStorageAPIIPCChannel = UserDataStorageAPIIPCChannels[keyof UserDataStorageAPIIPCChannels];

export const USER_DATA_STORAGE_API_IPC_CHANNELS: UserDataStorageAPIIPCChannels = {
  initialiseUserDataStorage: "UserDataStorageAPI:initialiseUserDataStorage",
  terminateUserDataStorage: "UserDataStorageAPI:terminateUserDataStorage",
  openUserDataStorage: "UserDataStorageAPI:openUserDataStorage",
  closeUserDataStorage: "UserDataStorageAPI:closeUserDataStorage",
  getAllSignedInUserInitialisedDataStoragesInfo: "UserDataStorageAPI:getAllSignedInUserInitialisedDataStoragesInfo",
  onInitialisedUserDataStoragesChanged: "UserDataStorageAPI:onInitialisedUserDataStoragesChanged",
  onInitialisedUserDataStorageInfoChanged: "UserDataStorageAPI:onInitialisedUserDataStorageInfoChanged"
};
