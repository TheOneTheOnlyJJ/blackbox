import { IEncryptedData } from "@shared/utils/EncryptedData";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";
import { IPCAPIResponse } from "../IPCAPIResponse";
import { IUserDataStorageVisibilityGroupConfigCreateDTO } from "@shared/user/data/storage/visibilityGroup/config/create/DTO/UserDataStorageVisibilityGroupConfigCreateDTO";
import { IUserDataStorageVisibilityGroupsOpenRequestDTO } from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";

export type OpenUserDataStorageVisibilityGroupsChangedCallback = (
  encryptedUserDataStorageVisibilityGroupsInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>>
) => void;

export interface IUserDataStorageVisibilityGroupAPI {
  isUserDataStorageVisibilityGroupNameAvailableForSignedInUser: (name: string) => IPCAPIResponse<boolean>;
  addUserDataStorageVisibilityGroupConfig: (
    encryptedUserDataStorageVisibilityGroupConfigCreateDTO: IEncryptedData<IUserDataStorageVisibilityGroupConfigCreateDTO>
  ) => IPCAPIResponse<boolean>;
  openUserDataStorageVisibilityGroups: (
    encryptedUserDataStorageVisibilityGroupsOpenRequestDTO: IEncryptedData<IUserDataStorageVisibilityGroupsOpenRequestDTO>
  ) => IPCAPIResponse<number>;
  closeUserDataStorageVisibilityGroups: (userDataStorageVisibilityGroupIds: string[]) => IPCAPIResponse<number>;
  getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo: () => IPCAPIResponse<IEncryptedData<IUserDataStorageVisibilityGroupInfo[]>>;
  onOpenUserDataStorageVisibilityGroupsChanged: (callback: OpenUserDataStorageVisibilityGroupsChangedCallback) => () => void;
}

export type UserDataStorageVisibilityGroupAPIIPCChannels = TransformToIPCAPIChannels<
  "UserDataStorageVisibilityGroupAPI",
  IUserDataStorageVisibilityGroupAPI
>;
export type UserDataStorageVisibilityGroupAPIIPCChannel =
  UserDataStorageVisibilityGroupAPIIPCChannels[keyof UserDataStorageVisibilityGroupAPIIPCChannels];

export const USER_DATA_STORAGE_VISIBILITY_GROUP_API_IPC_CHANNELS: UserDataStorageVisibilityGroupAPIIPCChannels = {
  isUserDataStorageVisibilityGroupNameAvailableForSignedInUser:
    "UserDataStorageVisibilityGroupAPI:isUserDataStorageVisibilityGroupNameAvailableForSignedInUser",
  addUserDataStorageVisibilityGroupConfig: "UserDataStorageVisibilityGroupAPI:addUserDataStorageVisibilityGroupConfig",
  openUserDataStorageVisibilityGroups: "UserDataStorageVisibilityGroupAPI:openUserDataStorageVisibilityGroups",
  closeUserDataStorageVisibilityGroups: "UserDataStorageVisibilityGroupAPI:closeUserDataStorageVisibilityGroups",
  getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo:
    "UserDataStorageVisibilityGroupAPI:getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo",
  onOpenUserDataStorageVisibilityGroupsChanged: "UserDataStorageVisibilityGroupAPI:onOpenUserDataStorageVisibilityGroupsChanged"
};
