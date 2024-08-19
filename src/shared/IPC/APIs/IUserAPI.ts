import { IBaseNewUserData } from "../../user/IBaseNewUserData";

// Declare API interfaces
export interface IUserAPI {
  isStorageAvailable: () => boolean;
  onStorageAvailabilityChange: (callback: (isAvailable: boolean) => void) => void;
  isUsernameAvailable: (username: string) => boolean;
  register: (userData: IBaseNewUserData) => boolean;
}
