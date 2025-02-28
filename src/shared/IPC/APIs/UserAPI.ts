import { EncryptedUserSignUpDTO } from "@shared/user/account/encrypted/EncryptedUserSignUpDTO";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { EncryptedUserDataStorageConfigCreateDTO } from "@shared/user/account/encrypted/EncryptedUserDataStorageConfigCreateDTO";
import { EncryptedUserSignInDTO } from "@shared/user/account/encrypted/EncryptedUserSignInDTO";
import { IPublicUserAccountStorageConfig } from "@shared/user/account/storage/PublicUserAccountStorageConfig";
import { IPublicSignedInUser } from "@shared/user/account/PublicSignedInUser";
import { IPublicUserDataStorageConfig } from "@shared/user/data/storage/PublicUserDataStorageConfig";

// Utility types
export type CurrentUserAccountStorageChangedCallback = (currentUserAccountStorage: IPublicUserAccountStorageConfig | null) => void;
export type UserAccountStorageOpenChangedCallback = (isUserAccountStorageOpen: boolean) => void;
export type SignedInUserChangedCallback = (publicSignedInUser: IPublicSignedInUser | null) => void;

// API
export interface IUserAPI {
  signUp: (encryptedUserSignUpDTO: EncryptedUserSignUpDTO) => IPCAPIResponse<boolean>;
  signIn: (encryptedUserSignInDTO: EncryptedUserSignInDTO) => IPCAPIResponse<boolean>;
  signOut: () => IPCAPIResponse<IPublicSignedInUser | null>;
  isUserAccountStorageOpen: () => IPCAPIResponse<boolean>;
  isUsernameAvailable: (username: string) => IPCAPIResponse<boolean>;
  getUserCount: () => IPCAPIResponse<number>;
  getSignedInUser: () => IPCAPIResponse<IPublicSignedInUser | null>;
  addUserDataStorageConfig: (encryptedUserDataStorageConfigCreateDTO: EncryptedUserDataStorageConfigCreateDTO) => IPCAPIResponse<boolean>; // TODO: Move to data API?
  getCurrentUserAccountStorageConfig: () => IPCAPIResponse<IPublicUserAccountStorageConfig | null>;
  getAllSignedInUserUserDataStorageConfigs: () => IPCAPIResponse<IPublicUserDataStorageConfig[]>; // TODO: Move to data API?
  onCurrentUserAccountStorageChanged: (callback: CurrentUserAccountStorageChangedCallback) => () => void;
  onUserAccountStorageOpenChanged: (callback: UserAccountStorageOpenChangedCallback) => () => void;
  onSignedInUserChanged: (callback: SignedInUserChangedCallback) => () => void;
}

export const USER_API_IPC_CHANNELS = {
  signUp: "userAPI:signUp",
  signIn: "userAPI:signIn",
  signOut: "userAPI:signOut",
  isUserAccountStorageOpen: "userAPI:isUserAccountStorageOpen",
  isUsernameAvailable: "userAPI:isUsernameAvailable",
  getUserCount: "userAPI:getUserCount",
  getSignedInUser: "userAPI:getSignedInUser",
  addUserDataStorageConfig: "userAPI:addUserDataStorageConfig",
  getCurrentUserAccountStorageConfig: "userAPI:getCurrentUserAccountStorageConfig",
  getAllSignedInUserUserDataStorageConfigs: "userAPI:getAllSignedInUserUserDataStorageConfigs",
  onCurrentUserAccountStorageChanged: "userAPI:onCurrentUserAccountStorageChanged",
  onUserAccountStorageOpenChanged: "userAPI:onUserAccountStorageOpenChanged",
  onSignedInUserChanged: "userAPI:onSignedInUserChanged"
} as const;
export type UserAPIIPCChannels = typeof USER_API_IPC_CHANNELS;
export type UserAPIIPCChannel = UserAPIIPCChannels[keyof UserAPIIPCChannels];
