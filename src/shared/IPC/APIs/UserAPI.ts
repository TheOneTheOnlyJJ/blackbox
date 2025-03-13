import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IUserAccountStorageInfo } from "@shared/user/account/storage/info/UserAccountStorageInfo";
import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IUserSignUpDTO } from "@shared/user/account/UserSignUpDTO";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { IUserDataStorageInfo } from "@shared/user/data/storage/info/UserDataStorageInfo";
import { IUserDataStoragesInfoChangedDiff } from "@shared/user/data/storage/info/UserDataStoragesInfoChangedDiff";

// Utility types
export type UserAccountStorageChangedCallback = (newUserAccountStorageInfo: IUserAccountStorageInfo | null) => void;
export type UserAccountStorageOpenChangedCallback = (newIsUserAccountStorageOpen: boolean) => void;
export type SignedInUserChangedCallback = (newPublicSignedInUser: IPublicSignedInUser | null) => void;
export type UserDataStoragesChangedCallback = (encryptedUserDataStoragesInfoChangedDiff: IEncryptedData<IUserDataStoragesInfoChangedDiff>) => void;

// API
export interface IUserAPI {
  signUp: (encryptedUserSignUpDTO: IEncryptedData<IUserSignUpDTO>) => IPCAPIResponse<boolean>;
  signIn: (encryptedUserSignInDTO: IEncryptedData<IUserSignInDTO>) => IPCAPIResponse<boolean>;
  signOut: () => IPCAPIResponse<IPublicSignedInUser | null>;
  isUserAccountStorageOpen: () => IPCAPIResponse<boolean>;
  isUsernameAvailable: (username: string) => IPCAPIResponse<boolean>;
  getUserCount: () => IPCAPIResponse<number>;
  getUsernameForUserId: (userId: string) => IPCAPIResponse<string | null>;
  getSignedInUser: () => IPCAPIResponse<IPublicSignedInUser | null>;
  addUserDataStorageConfig: (encryptedUserDataStorageConfigCreateDTO: IEncryptedData<IUserDataStorageConfigCreateDTO>) => IPCAPIResponse<boolean>;
  getUserAccountStorageInfo: () => IPCAPIResponse<IUserAccountStorageInfo | null>;
  getAllSignedInUserDataStoragesInfo: () => IPCAPIResponse<IEncryptedData<IUserDataStorageInfo[]>>;
  onUserAccountStorageChanged: (callback: UserAccountStorageChangedCallback) => () => void;
  onUserAccountStorageOpenChanged: (callback: UserAccountStorageOpenChangedCallback) => () => void;
  onSignedInUserChanged: (callback: SignedInUserChangedCallback) => () => void;
  onUserDataStoragesChanged: (callback: UserDataStoragesChangedCallback) => () => void;
}

export const USER_API_IPC_CHANNELS = {
  signUp: "userAPI:signUp",
  signIn: "userAPI:signIn",
  signOut: "userAPI:signOut",
  isUserAccountStorageOpen: "userAPI:isUserAccountStorageOpen",
  isUsernameAvailable: "userAPI:isUsernameAvailable",
  getUserCount: "userAPI:getUserCount",
  getUsernameForUserId: "userAPI:getUsernameForUserId",
  getSignedInUser: "userAPI:getSignedInUser",
  addUserDataStorageConfig: "userAPI:addUserDataStorageConfig",
  getUserAccountStorageInfo: "userAPI:getUserAccountStorageInfo",
  getAllSignedInUserDataStoragesInfo: "userAPI:getAllSignedInUserDataStoragesInfo",
  onUserAccountStorageChanged: "userAPI:onUserAccountStorageChanged",
  onUserAccountStorageOpenChanged: "userAPI:onUserAccountStorageOpenChanged",
  onSignedInUserChanged: "userAPI:onSignedInUserChanged",
  onUserDataStoragesChanged: "userAPI:onUserDataStoragesChanged"
} as const;
export type UserAPIIPCChannels = typeof USER_API_IPC_CHANNELS;
export type UserAPIIPCChannel = UserAPIIPCChannels[keyof UserAPIIPCChannels];
