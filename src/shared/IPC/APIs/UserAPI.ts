import { ICurrentlySignedInUser } from "@shared/user/account/CurrentlySignedInUser";
import { EncryptedUserSignUpData } from "@shared/user/account/encrypted/EncryptedUserSignUpData";
import { EncryptedUserSignInData } from "@shared/user/account/encrypted/EncryptedUserSignInData";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { EncryptedUserDataStorageConfigCreateDTO } from "@shared/user/account/encrypted/EncryptedUserDataStorageConfigCreateDTO";

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
