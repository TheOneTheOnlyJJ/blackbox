import { ICurrentlyLoggedInUser } from "../../user/ICurrentlyLoggedInUser";
import { IEncryptedBaseNewUserData } from "../../user/IEncryptedBaseNewUserData";
import { IEncryptedUserLoginCredentials } from "../../user/IEncryptedUserLoginCredentials";

export type UserStorageAvailabilityChangeCallback = (isAvailable: boolean) => void;
export type CurrentlyLoggedInUserChangeCallback = (newLoggedInUser: ICurrentlyLoggedInUser | null) => void;

// Declare API interfaces
export interface IUserAPI {
  isStorageAvailable: () => boolean;
  onUserStorageAvailabilityChange: (callback: UserStorageAvailabilityChangeCallback) => void;
  isUsernameAvailable: (username: string) => boolean;
  register: (encryptedBaseNewUserData: IEncryptedBaseNewUserData) => boolean;
  getUserCount: () => number;
  login: (encryptedLoginCredentials: IEncryptedUserLoginCredentials) => boolean;
  onCurrentlyLoggedInUserChange: (callback: CurrentlyLoggedInUserChangeCallback) => void;
}
