import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { IPublicUserAccountStorageConfig } from "@shared/user/account/storage/PublicUserAccountStorageConfig";
import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { IEncryptedData } from "@shared/utils/EncryptedData";
import { IUserSignUpDTO } from "@shared/user/account/UserSignUpDTO";
import { IUserSignInDTO } from "@shared/user/account/UserSignInDTO";
import { IUserDataStorageConfigCreateDTO } from "@shared/user/data/storage/config/create/DTO/UserDataStorageConfigCreateDTO";
import { IPublicUserDataStorageConfig } from "@shared/user/data/storage/config/public/PublicUserDataStorageConfig";
import { IPublicUserDataStoragesChangedDiff } from "@shared/user/data/storage/config/public/PublicUserDataStoragesChangedDiff";

// Utility types
export type CurrentUserAccountStorageChangedCallback = (newCurrentUserAccountStorage: IPublicUserAccountStorageConfig | null) => void;
export type UserAccountStorageOpenChangedCallback = (newIsUserAccountStorageOpen: boolean) => void;
export type SignedInUserChangedCallback = (newPublicSignedInUser: IPublicSignedInUser | null) => void;
export type UserDataStoragesChangedCallback = (
  encryptedPublicUserDataStoragesChangedDiff: IEncryptedData<IPublicUserDataStoragesChangedDiff>
) => void;

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
  getCurrentUserAccountStorageConfig: () => IPCAPIResponse<IPublicUserAccountStorageConfig | null>;
  getAllSignedInUserPublicUserDataStorageConfigs: () => IPCAPIResponse<IEncryptedData<IPublicUserDataStorageConfig[]>>;
  onCurrentUserAccountStorageChanged: (callback: CurrentUserAccountStorageChangedCallback) => () => void;
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
  getCurrentUserAccountStorageConfig: "userAPI:getCurrentUserAccountStorageConfig",
  getAllSignedInUserPublicUserDataStorageConfigs: "userAPI:getAllSignedInUserPublicUserDataStorageConfigs",
  onCurrentUserAccountStorageChanged: "userAPI:onCurrentUserAccountStorageChanged",
  onUserAccountStorageOpenChanged: "userAPI:onUserAccountStorageOpenChanged",
  onSignedInUserChanged: "userAPI:onSignedInUserChanged",
  onUserDataStoragesChanged: "userAPI:onUserDataStoragesChanged"
} as const;
export type UserAPIIPCChannels = typeof USER_API_IPC_CHANNELS;
export type UserAPIIPCChannel = UserAPIIPCChannels[keyof UserAPIIPCChannels];
