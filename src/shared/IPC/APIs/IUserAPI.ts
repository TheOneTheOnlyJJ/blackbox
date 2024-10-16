import { ICurrentlySignedInUser } from "@shared/user/ICurrentlySignedInUser";
import { IEncryptedBaseNewUserData } from "@shared/user/encrypted/IEncryptedBaseNewUserData";
import { IEncryptedUserSignInCredentials } from "@shared/user/encrypted/IEncryptedUserSignInCredentials";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";

// Utility types
export type UserAccountStorageAvailabilityChangeCallback = (isAvailable: boolean) => void;
export type CurrentlySignedInUserChangeCallback = (newSignedInUser: ICurrentlySignedInUser | null) => void;

// API
export interface IUserAPI {
  signUp: (encryptedBaseNewUserData: IEncryptedBaseNewUserData) => IPCAPIResponse<boolean>;
  signIn: (encryptedSignInCredentials: IEncryptedUserSignInCredentials) => IPCAPIResponse<boolean>;
  signOut: () => IPCAPIResponse;
  isAccountStorageAvailable: () => IPCAPIResponse<boolean>;
  isUsernameAvailable: (username: string) => IPCAPIResponse<boolean>;
  getUserCount: () => IPCAPIResponse<number>;
  getCurrentlySignedInUser: () => IPCAPIResponse<ICurrentlySignedInUser | null>;
  onAccountStorageAvailabilityChange: (callback: UserAccountStorageAvailabilityChangeCallback) => () => void;
  onCurrentlySignedInUserChange: (callback: CurrentlySignedInUserChangeCallback) => () => void;
}
