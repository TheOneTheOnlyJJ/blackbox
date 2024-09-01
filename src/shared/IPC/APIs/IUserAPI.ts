import { ICurrentlySignedInUser } from "../../user/ICurrentlySignedInUser";
import { IEncryptedBaseNewUserData } from "../../user/encrypted/IEncryptedBaseNewUserData";
import { IEncryptedUserSignInCredentials } from "../../user/encrypted/IEncryptedUserSignInCredentials";
import { IPCAPIResponse } from "../IPCAPIResponse";

// Utility types
export type UserStorageAvailabilityChangeCallback = (isAvailable: boolean) => void;
export type CurrentlySignedInUserChangeCallback = (newSignedInUser: ICurrentlySignedInUser | null) => void;

// API
export interface IUserAPI {
  signUp: (encryptedBaseNewUserData: IEncryptedBaseNewUserData) => IPCAPIResponse<boolean>;
  signIn: (encryptedSignInCredentials: IEncryptedUserSignInCredentials) => IPCAPIResponse<boolean>;
  signOut: () => IPCAPIResponse;
  isStorageAvailable: () => IPCAPIResponse<boolean>;
  isUsernameAvailable: (username: string) => IPCAPIResponse<boolean>;
  getUserCount: () => IPCAPIResponse<number>;
  getCurrentlySignedInUser: () => IPCAPIResponse<ICurrentlySignedInUser | null>;
  onUserStorageAvailabilityChange: (callback: UserStorageAvailabilityChangeCallback) => () => void;
  onCurrentlySignedInUserChange: (callback: CurrentlySignedInUserChangeCallback) => () => void;
}
