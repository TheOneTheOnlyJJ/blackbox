import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { ISignedInUserInfo } from "@shared/user/account/SignedInUserInfo";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IUserSignUpDTO } from "@shared/user/account/UserSignUpDTO";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { IUserDataStorageVisibilityGroupConfigCreateDTO } from "@shared/user/data/storage/visibilityGroup/config/create/DTO/UserDataStorageVisibilityGroupConfigCreateDTO";
import { IUserDataStorageVisibilityGroupsOpenRequestDTO } from "@shared/user/data/storage/visibilityGroup/openRequest/DTO/UserDataStorageVisibilityGroupsOpenRequestDTO";
import { IUserDataStorageVisibilityGroupInfo } from "@shared/user/data/storage/visibilityGroup/info/UserDataStorageVisibilityGroupInfo";
import { TransformToIPCAPIChannels } from "../IPCAPIChannels";
import { IUserDataStorageConfigInfo } from "@shared/user/data/storage/config/info/UserDataStorageConfigInfo";
import { IDataChangedDiff } from "@shared/utils/DataChangedDiff";

// Utility types
export type UserAccountStorageChangedCallback = (newUserAccountStorageInfo: IUserAccountStorageInfo | null) => void;
export type UserAccountStorageInfoChangedCallback = (newUserAccountStorageInfo: IUserAccountStorageInfo) => void;
export type SignedInUserChangedCallback = (newSignedInUserInfo: ISignedInUserInfo | null) => void;
export type AvailableUserDataStorageConfigsChangedCallback = (
  encryptedAvailableUserDataStorageConfigsInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataStorageConfigInfo>>
) => void;
export type OpenUserDataStorageVisibilityGroupsChangedCallback = (
  encryptedUserDataStorageVisibilityGroupsInfoChangedDiff: IEncryptedData<IDataChangedDiff<string, IUserDataStorageVisibilityGroupInfo>>
) => void;

// API
export interface IUserAccountAPI {
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
  getAllSignedInUserAvailableDataStorageConfigsInfo: () => IPCAPIResponse<IEncryptedData<IUserDataStorageConfigInfo[]>>;
  getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo: () => IPCAPIResponse<IEncryptedData<IUserDataStorageVisibilityGroupInfo[]>>;
  onUserAccountStorageChanged: (callback: UserAccountStorageChangedCallback) => () => void;
  onUserAccountStorageInfoChanged: (callback: UserAccountStorageInfoChangedCallback) => () => void;
  onSignedInUserChanged: (callback: SignedInUserChangedCallback) => () => void;
  onAvailableUserDataStorageConfigsChanged: (callback: AvailableUserDataStorageConfigsChangedCallback) => () => void;
  onOpenUserDataStorageVisibilityGroupsChanged: (callback: OpenUserDataStorageVisibilityGroupsChangedCallback) => () => void;
}

export type UserAccountAPIIPCChannels = TransformToIPCAPIChannels<"UserAccountAPI", IUserAccountAPI>;
export type UserAccountAPIIPCChannel = UserAccountAPIIPCChannels[keyof UserAccountAPIIPCChannels];

export const USER_ACCOUNT_API_IPC_CHANNELS: UserAccountAPIIPCChannels = {
  signUp: "UserAccountAPI:signUp",
  signIn: "UserAccountAPI:signIn",
  signOut: "UserAccountAPI:signOut",
  isUserAccountStorageOpen: "UserAccountAPI:isUserAccountStorageOpen",
  isUsernameAvailable: "UserAccountAPI:isUsernameAvailable",
  isUserDataStorageVisibilityGroupNameAvailableForSignedInUser: "UserAccountAPI:isUserDataStorageVisibilityGroupNameAvailableForSignedInUser",
  getUserCount: "UserAccountAPI:getUserCount",
  getUsernameForUserId: "UserAccountAPI:getUsernameForUserId",
  getSignedInUserInfo: "UserAccountAPI:getSignedInUserInfo",
  addUserDataStorageConfig: "UserAccountAPI:addUserDataStorageConfig",
  addUserDataStorageVisibilityGroupConfig: "UserAccountAPI:addUserDataStorageVisibilityGroupConfig",
  openUserDataStorageVisibilityGroups: "UserAccountAPI:openUserDataStorageVisibilityGroups",
  closeUserDataStorageVisibilityGroups: "UserAccountAPI:closeUserDataStorageVisibilityGroups",
  getUserAccountStorageInfo: "UserAccountAPI:getUserAccountStorageInfo",
  getAllSignedInUserAvailableDataStorageConfigsInfo: "UserAccountAPI:getAllSignedInUserAvailableDataStorageConfigsInfo",
  getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo: "UserAccountAPI:getAllSignedInUserOpenUserDataStorageVisibilityGroupsInfo",
  onUserAccountStorageChanged: "UserAccountAPI:onUserAccountStorageChanged",
  onUserAccountStorageInfoChanged: "UserAccountAPI:onUserAccountStorageInfoChanged",
  onSignedInUserChanged: "UserAccountAPI:onSignedInUserChanged",
  onAvailableUserDataStorageConfigsChanged: "UserAccountAPI:onAvailableUserDataStorageConfigsChanged",
  onOpenUserDataStorageVisibilityGroupsChanged: "UserAccountAPI:onOpenUserDataStorageVisibilityGroupsChanged"
} as const;
