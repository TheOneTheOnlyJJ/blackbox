import { IEncryptedBaseNewUserData } from "../../user/IEncryptedBaseNewUserData";

// Declare API interfaces
export interface IUserAPI {
  isStorageAvailable: () => boolean;
  onStorageAvailabilityChange: (callback: (isAvailable: boolean) => void) => void;
  isUsernameAvailable: (username: string) => boolean;
  register: (encryptedBaseNewUserData: IEncryptedBaseNewUserData) => boolean;
  getUserCount: () => number;
}
