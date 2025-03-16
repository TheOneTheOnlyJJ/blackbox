import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IUserSignUpDTO } from "@shared/user/account/UserSignUpDTO";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataStoragesInfoChangedDiff } from "@shared/user/data/storage/info/UserDataStoragesInfoChangedDiff";
import { IUserDataStorageVisibilityGroupCreateDTO } from "@shared/user/data/storage/visibilityGroup/create/DTO/UserDataStorageVisibilityGroupCreateDTO";
import { IUserDataStorageVisibilityGroupsOpenRequestDTO } from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { IUserDataStorageVisibilityGroupsInfoChangedDiff } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfoChangedDiff";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";

// Utility types
export type UserAccountStorageChangedCallback = (newUserAccountStorageInfo: IUserAccountStorageInfo | null) => void;
export type UserAccountStorageOpenChangedCallback = (newIsUserAccountStorageOpen: boolean) => void;
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
  addUserDataStorageVisibilityGroup: (
    encryptedUserDataStorageVisibilityGroupCreateDTO: IEncryptedData<IUserDataStorageVisibilityGroupCreateDTO>
  ) => IPCAPIResponse<boolean>;
  openUserDataStorageVisibilityGroups: (
    encryptedUserDataStorageVisibilityGroupsOpenRequestDTO: IEncryptedData<IUserDataStorageVisibilityGroupsOpenRequestDTO>
  ) => IPCAPIResponse<number>;
  closeUserDataStorageVisibilityGroups: (userDataStorageVisibilityGroupIds: string[]) => IPCAPIResponse<number>;
  getUserAccountStorageInfo: () => IPCAPIResponse<IUserAccountStorageInfo | null>;
  getAllSignedInUserAvailableDataStoragesInfo: () => IPCAPIResponse<IEncryptedData<IUserDataStorageInfo[]>>;
  getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo: () => IPCAPIResponse<IEncryptedData<IUserDataStorageVisibilityGroupInfo[]>>;
  onUserAccountStorageChanged: (callback: UserAccountStorageChangedCallback) => () => void;
  onUserAccountStorageOpenChanged: (callback: UserAccountStorageOpenChangedCallback) => () => void;
  onSignedInUserChanged: (callback: SignedInUserChangedCallback) => () => void;
  onAvailableUserDataStoragesChanged: (callback: AvailableUserDataStoragesChangedCallback) => () => void;
  onOpenUserDataStorageVisibilityGroupsChanged: (callback: OpenUserDataStorageVisibilityGroupsChangedCallback) => () => void;
}

export const USER_API_IPC_CHANNELS = {
  signUp: "userAPI:signUp",
  signIn: "userAPI:signIn",
  signOut: "userAPI:signOut",
  isUserAccountStorageOpen: "userAPI:isUserAccountStorageOpen",
  isUsernameAvailable: "userAPI:isUsernameAvailable",
  isUserDataStorageVisibilityGroupNameAvailableForSignedInUser: "userAPI:isUserDataStorageVisibilityGroupNameAvailableForSignedInUser",
  getUserCount: "userAPI:getUserCount",
  getUsernameForUserId: "userAPI:getUsernameForUserId",
  getSignedInUserInfo: "userAPI:getSignedInUserInfo",
  addUserDataStorageConfig: "userAPI:addUserDataStorageConfig",
  addUserDataStorageVisibilityGroup: "userAPI:addUserDataStorageVisibilityGroup",
  openUserDataStorageVisibilityGroups: "userAPI:openUserDataStorageVisibilityGroups",
  closeUserDataStorageVisibilityGroups: "userAPI:closeUserDataStorageVisibilityGroups",
  getUserAccountStorageInfo: "userAPI:getUserAccountStorageInfo",
  getAllSignedInUserAvailableDataStoragesInfo: "userAPI:getAllSignedInUserAvailableDataStoragesInfo",
  getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo: "userAPI:getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo",
  onUserAccountStorageChanged: "userAPI:onUserAccountStorageChanged",
  onUserAccountStorageOpenChanged: "userAPI:onUserAccountStorageOpenChanged",
  onSignedInUserChanged: "userAPI:onSignedInUserChanged",
  onAvailableUserDataStoragesChanged: "userAPI:onAvailableUserDataStoragesChanged",
  onOpenUserDataStorageVisibilityGroupsChanged: "userAPI:onOpenUserDataStorageVisibilityGroupsChanged"
} as const;
export type UserAPIIPCChannels = typeof USER_API_IPC_CHANNELS;
export type UserAPIIPCChannel = UserAPIIPCChannels[keyof UserAPIIPCChannels];
