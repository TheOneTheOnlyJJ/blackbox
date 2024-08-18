import { INewUserRawData } from "../../user/accountSchemas";

// Declare API interfaces
export interface IUserAPI {
  isStorageAvailable: () => boolean;
  onStorageAvailabilityChange: (callback: (isAvailable: boolean) => void) => void;
  isUsernameAvailable: (username: string) => boolean;
  register: (userData: INewUserRawData) => boolean;
}
