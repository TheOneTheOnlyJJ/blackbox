import { ICurrentlySignedInUser } from "@shared/user/account/CurrentlySignedInUser";
import { IEncryptedUserSignUpData } from "@shared/user/account/encrypted/EncryptedUserSignUpData";
import { IEncryptedUserSignInData } from "@shared/user/account/encrypted/EncryptedUserSignInData";
import { IPCAPIResponse } from "@shared/IPC/IPCAPIResponse";

// Utility types
export type UserAccountStorageAvailabilityChangeCallback = (isAvailable: boolean) => void;
export type CurrentlySignedInUserChangeCallback = (newSignedInUser: ICurrentlySignedInUser | null) => void;

// API
export interface IUserAPI {
  signUp: (encryptedBaseNewUserData: IEncryptedUserSignUpData) => IPCAPIResponse<boolean>;
  signIn: (encryptedSignInCredentials: IEncryptedUserSignInData) => IPCAPIResponse<boolean>;
  signOut: () => IPCAPIResponse;
  isAccountStorageAvailable: () => IPCAPIResponse<boolean>;
  isUsernameAvailable: (username: string) => IPCAPIResponse<boolean>;
  getUserCount: () => IPCAPIResponse<number>;
  getCurrentlySignedInUser: () => IPCAPIResponse<ICurrentlySignedInUser | null>;
  onAccountStorageAvailabilityChange: (callback: UserAccountStorageAvailabilityChangeCallback) => () => void;
  onCurrentlySignedInUserChange: (callback: CurrentlySignedInUserChangeCallback) => () => void;
}
