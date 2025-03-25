import { IEncryptedData } from "@shared/utils/EncryptedData";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";
import { IPCAPIResponse } from "../IPCAPIResponse";
import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";

export type AvailableUserDataStorageConfigsChangedCallback = (
  encryptedAvailableUserDataStorageConfigsInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataStorageConfigInfo>>
) => void;

export interface IUserDataStorageConfigAPI {
  addUserDataStorageConfig: (encryptedUserDataStorageConfigCreateDTO: IEncryptedData<IUserDataStorageConfigCreateDTO>) => IPCAPIResponse<boolean>;
  getAllSignedInUserAvailableDataStorageConfigsInfo: () => IPCAPIResponse<IEncryptedData<IUserDataStorageConfigInfo[]>>;
  onAvailableUserDataStorageConfigsChanged: (callback: AvailableUserDataStorageConfigsChangedCallback) => () => void;
}

export type UserDataStorageConfigAPIIPCChannels = TransformToIPCAPIChannels<"UserDataStorageConfigAPI", IUserDataStorageConfigAPI>;
export type UserDataStorageConfigAPIIPCChannel = UserDataStorageConfigAPIIPCChannels[keyof UserDataStorageConfigAPIIPCChannels];

export const USER_DATA_STORAGE_CONFIG_API_IPC_CHANNELS: UserDataStorageConfigAPIIPCChannels = {
  addUserDataStorageConfig: "UserDataStorageConfigAPI:addUserDataStorageConfig",
  getAllSignedInUserAvailableDataStorageConfigsInfo: "UserDataStorageConfigAPI:getAllSignedInUserAvailableDataStorageConfigsInfo",
  onAvailableUserDataStorageConfigsChanged: "UserDataStorageConfigAPI:onAvailableUserDataStorageConfigsChanged"
};
