import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IUserSignUpDTO } from "@shared/user/account/UserSignUpDTO";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataStoragesInfoChangedDiff } from "@shared/user/data/storage/info/UserDataStoragesInfoChangedDiff";
import { IUserDataStorageVisibilityGroupConfigCreateDTO } from "@shared/user/data/storage/visibilityGroup/config/create/DTO/UserDataStorageVisibilityGroupConfigCreateDTO";
import { IUserDataStorageVisibilityGroupsOpenRequestDTO } from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { IUserDataStorageVisibilityGroupsInfoChangedDiff } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfoChangedDiff";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";

// Utility types
export type UserAccountStorageChangedCallback = (newUserAccountStorageInfo: IUserAccountStorageInfo | null) => void;
export type UserAccountStorageInfoChangedCallback = (newUserAccountStorageInfo: IUserAccountStorageInfo) => void;
export type SignedInUserChangedCallback = (newSignedInUserInfo: ISignedInUserInfo | null) => void;
export type AvailableUserDataStoragesChangedCallback = (
  encryptedAvailableUserDataStoragesInfoChangedDiff: IEncryptedData<IUserDataStoragesInfoChangedDiff>
) => void;
export type OpenUserDataStorageVisibilityGroupsChangedCallback = (
  encryptedUserDataStorageVisibilityGroupsInfoChangedDiff: IEncryptedData<IUserDataStorageVisibilityGroupsInfoChangedDiff>
) => void;

// API
export interface IUserAPI {
  signUp: (encryptedUserSignUpDTO: IEncryptedData<IUserSignUpDTO>) => IPCAPIResponse<boolean>;
  signIn: (encryptedUserSignInDTO: IEncryptedData<IUserSignInDTO>) => IPCAPIResponse<boolean>;
  signOut: () => IPCAPIResponse<ISignedInUserInfo | null>;
  isUserAccountStorageOpen: () => IPCAPIResponse<boolean>;
  isUsernameAvailable: (username: string) => IPCAPIResponse<boolean>;
  isUserDataStorageVisibilityGroupNameAvailableForSignedInUser: (name: string) => IPCAPIResponse<boolean>;
  getUserCount: () => IPCAPIResponse<number>;
  getUsernameForUserId: (userId: string) => IPCAPIResponse<string | null>;
  getSignedInUserInfo: () => IPCAPIResponse<ISignedInUserInfo | null>;
  addUserDataStorageConfig: (encryptedUserDataStorageConfigCreateDTO: IEncryptedData<IUserDataStorageConfigCreateDTO>) => IPCAPIResponse<boolean>;
  addUserDataStorageVisibilityGroupConfig: (
    encryptedUserDataStorageVisibilityGroupConfigCreateDTO: IEncryptedData<IUserDataStorageVisibilityGroupConfigCreateDTO>
  ) => IPCAPIResponse<boolean>;
  openUserDataStorageVisibilityGroups: (
    encryptedUserDataStorageVisibilityGroupsOpenRequestDTO: IEncryptedData<IUserDataStorageVisibilityGroupsOpenRequestDTO>
  ) => IPCAPIResponse<number>;
  closeUserDataStorageVisibilityGroups: (userDataStorageVisibilityGroupIds: string[]) => IPCAPIResponse<number>;
  getUserAccountStorageInfo: () => IPCAPIResponse<IUserAccountStorageInfo | null>;
  getAllSignedInUserAvailableDataStoragesInfo: () => IPCAPIResponse<IEncryptedData<IUserDataStorageInfo[]>>;
  getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo: () => IPCAPIResponse<IEncryptedData<IUserDataStorageVisibilityGroupInfo[]>>;
  onUserAccountStorageChanged: (callback: UserAccountStorageChangedCallback) => () => void;
  onUserAccountStorageInfoChanged: (callback: UserAccountStorageInfoChangedCallback) => () => void;
  onSignedInUserChanged: (callback: SignedInUserChangedCallback) => () => void;
  onAvailableUserDataStoragesChanged: (callback: AvailableUserDataStoragesChangedCallback) => () => void;
  onOpenUserDataStorageVisibilityGroupsChanged: (callback: OpenUserDataStorageVisibilityGroupsChangedCallback) => () => void;
}

export type UserAPIIPCChannels = TransformToIPCAPIChannels<"UserAPI", IUserAPI>;
export type UserAPIIPCChannel = UserAPIIPCChannels[keyof UserAPIIPCChannels];

export const USER_API_IPC_CHANNELS: UserAPIIPCChannels = {
  signUp: "UserAPI:signUp",
  signIn: "UserAPI:signIn",
  signOut: "UserAPI:signOut",
  isUserAccountStorageOpen: "UserAPI:isUserAccountStorageOpen",
  isUsernameAvailable: "UserAPI:isUsernameAvailable",
  isUserDataStorageVisibilityGroupNameAvailableForSignedInUser: "UserAPI:isUserDataStorageVisibilityGroupNameAvailableForSignedInUser",
  getUserCount: "UserAPI:getUserCount",
  getUsernameForUserId: "UserAPI:getUsernameForUserId",
  getSignedInUserInfo: "UserAPI:getSignedInUserInfo",
  addUserDataStorageConfig: "UserAPI:addUserDataStorageConfig",
  addUserDataStorageVisibilityGroupConfig: "UserAPI:addUserDataStorageVisibilityGroupConfig",
  openUserDataStorageVisibilityGroups: "UserAPI:openUserDataStorageVisibilityGroups",
  closeUserDataStorageVisibilityGroups: "UserAPI:closeUserDataStorageVisibilityGroups",
  getUserAccountStorageInfo: "UserAPI:getUserAccountStorageInfo",
  getAllSignedInUserAvailableDataStoragesInfo: "UserAPI:getAllSignedInUserAvailableDataStoragesInfo",
  getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo: "UserAPI:getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo",
  onUserAccountStorageChanged: "UserAPI:onUserAccountStorageChanged",
  onUserAccountStorageInfoChanged: "UserAPI:onUserAccountStorageInfoChanged",
  onSignedInUserChanged: "UserAPI:onSignedInUserChanged",
  onAvailableUserDataStoragesChanged: "UserAPI:onAvailableUserDataStoragesChanged",
  onOpenUserDataStorageVisibilityGroupsChanged: "UserAPI:onOpenUserDataStorageVisibilityGroupsChanged"
} as const;
