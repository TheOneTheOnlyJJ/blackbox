import { UserStorageConfig } from "../../user/storage/types";

// Declare API interfaces
export interface IUserStorageAPI {
  getConfig: () => Promise<UserStorageConfig>;
  initialise: () => Promise<boolean>;
  close: () => Promise<boolean>;
}
