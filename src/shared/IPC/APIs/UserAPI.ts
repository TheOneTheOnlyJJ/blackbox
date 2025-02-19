import { ICurrentlySignedInUser } from "@shared/user/account/CurrentlySignedInUser";
import { EncryptedUserSignUpData } from "@shared/user/account/encrypted/EncryptedUserSignUpData";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { EncryptedUserDataStorageConfigCreateDTO } from "@shared/user/account/encrypted/EncryptedUserDataStorageConfigCreateDTO";
import { EncryptedUserSignInData } from "@shared/user/account/encrypted/EncryptedUserSignInData";

// Utility types
export type UserAccountStorageBackendAvailabilityChangedCallback = (isUserAccountStorageBackendAvailable: boolean) => void;
export type CurrentlySignedInUserChangedCallback = (newCurrentlySignedInUser: ICurrentlySignedInUser | null) => void;

// API
export interface IUserAPI {
  signUp: (encryptedUserSignUpData: EncryptedUserSignUpData) => IPCAPIResponse<boolean>;
  signIn: (encryptedUserSignInData: EncryptedUserSignInData) => IPCAPIResponse<boolean>;
  signOut: () => IPCAPIResponse;
  isAccountStorageBackendAvailable: () => IPCAPIResponse<boolean>;
  isUsernameAvailable: (username: string) => IPCAPIResponse<boolean>;
  getUserCount: () => IPCAPIResponse<number>;
  getCurrentlySignedInUser: () => IPCAPIResponse<ICurrentlySignedInUser | null>;
  addUserDataStorageConfigToUser: (encryptedUserDataStorageConfigCreateDTO: EncryptedUserDataStorageConfigCreateDTO) => IPCAPIResponse<boolean>;
  onAccountStorageBackendAvailabilityChanged: (callback: UserAccountStorageBackendAvailabilityChangedCallback) => () => void;
  onCurrentlySignedInUserChanged: (callback: CurrentlySignedInUserChangedCallback) => () => void;
}

export const USER_API_IPC_CHANNELS = {
  isAccountStorageBackendAvailable: "userAPI:isAccountStorageBackendAvailable",
  onAccountStorageBackendAvailabilityChanged: "userAPI:onAccountStorageBackendAvailabilityChanged",
  isUsernameAvailable: "userAPI:isUsernameAvailable",
  signUp: "userAPI:signUp",
  getUserCount: "userAPI:getUserCount",
  signIn: "userAPI:signIn",
  signOut: "userAPI:signOut",
  addUserDataStorageConfigToUser: "userAPI:addUserDataStorageConfigToUser",
  getCurrentlySignedInUser: "userAPI:getCurrentlySignedInUser",
  onCurrentlySignedInUserChanged: "userAPI:onCurrentlySignedInUserChanged"
} as const;
export type UserAPIIPCChannels = typeof USER_API_IPC_CHANNELS;
export type UserAPIIPCChannel = UserAPIIPCChannels[keyof UserAPIIPCChannels];
