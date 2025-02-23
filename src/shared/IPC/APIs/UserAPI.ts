import { ISignedInUser } from "@shared/user/account/SignedInUser";
import { EncryptedUserSignUpDTO } from "@shared/user/account/encrypted/EncryptedUserSignUpDTO";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { EncryptedUserDataStorageConfigCreateDTO } from "@shared/user/account/encrypted/EncryptedUserDataStorageConfigCreateDTO";
import { EncryptedUserSignInDTO } from "@shared/user/account/encrypted/EncryptedUserSignInDTO";
import { ICurrentUserAccountStorage } from "@shared/user/account/storage/CurrentUserAccountStorage";

// Utility types
export type CurrentUserAccountStorageChangedCallback = (currentUserAccountStorage: ICurrentUserAccountStorage | null) => void;
export type UserAccountStorageOpenChangedCallback = (isUserAccountStorageOpen: boolean) => void;
export type SignedInUserChangedCallback = (signedInUser: ISignedInUser | null) => void;

// API
export interface IUserAPI {
  signUp: (encryptedUserSignUpDTO: EncryptedUserSignUpDTO) => IPCAPIResponse<boolean>;
  signIn: (encryptedUserSignInDTO: EncryptedUserSignInDTO) => IPCAPIResponse<boolean>;
  signOut: () => IPCAPIResponse<ISignedInUser | null>;
  isUserAccountStorageOpen: () => IPCAPIResponse<boolean>;
  isUsernameAvailable: (username: string) => IPCAPIResponse<boolean>;
  getUserCount: () => IPCAPIResponse<number>;
  getSignedInUser: () => IPCAPIResponse<ISignedInUser | null>;
  addUserDataStorageConfigToUser: (encryptedUserDataStorageConfigCreateDTO: EncryptedUserDataStorageConfigCreateDTO) => IPCAPIResponse<boolean>;
  getCurrentUserAccountStorage: () => IPCAPIResponse<ICurrentUserAccountStorage | null>;
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
  addUserDataStorageConfigToUser: "userAPI:addUserDataStorageConfigToUser",
  getCurrentUserAccountStorage: "userAPI:getCurrentUserAccountStorage",
  onCurrentUserAccountStorageChanged: "userAPI:onCurrentUserAccountStorageChanged",
  onUserAccountStorageOpenChanged: "userAPI:onUserAccountStorageOpenChanged",
  onSignedInUserChanged: "userAPI:onSignedInUserChanged"
} as const;
export type UserAPIIPCChannels = typeof USER_API_IPC_CHANNELS;
export type UserAPIIPCChannel = UserAPIIPCChannels[keyof UserAPIIPCChannels];
