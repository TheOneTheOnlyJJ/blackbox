import { ICurrentlySignedInUser } from "@shared/user/account/CurrentlySignedInUser";
import { EncryptedUserSignUpData } from "@shared/user/account/encrypted/EncryptedUserSignUpData";
import { EncryptedUserSignInData } from "@shared/user/account/encrypted/EncryptedUserSignInData";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";
import { EncryptedNewUserDataStorageConfigWithMetadataDTO } from "@shared/user/account/encrypted/EncryptedNewUserDataStorageConfigWithMetadataDTO";

// Utility types
export type UserAccountStorageAvailabilityChangeCallback = (isAvailable: boolean) => void;
export type CurrentlySignedInUserChangeCallback = (newSignedInUser: ICurrentlySignedInUser | null) => void;

// API
export interface IUserAPI {
  signUp: (encryptedUserSignUpData: EncryptedUserSignUpData) => IPCAPIResponse<boolean>;
  signIn: (encryptedUserSignInData: EncryptedUserSignInData) => IPCAPIResponse<boolean>;
  signOut: () => IPCAPIResponse;
  isAccountStorageAvailable: () => IPCAPIResponse<boolean>;
  isUsernameAvailable: (username: string) => IPCAPIResponse<boolean>;
  getUserCount: () => IPCAPIResponse<number>;
  getCurrentlySignedInUser: () => IPCAPIResponse<ICurrentlySignedInUser | null>;
  addNewUserDataStorageConfigWithMetadataToUser: (
    encryptedNewUserDataStorageConfigWithMetadataDTO: EncryptedNewUserDataStorageConfigWithMetadataDTO
  ) => IPCAPIResponse<boolean>;
  onAccountStorageAvailabilityChange: (callback: UserAccountStorageAvailabilityChangeCallback) => () => void;
  onCurrentlySignedInUserChange: (callback: CurrentlySignedInUserChangeCallback) => () => void;
}
