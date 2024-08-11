import { UserStorageConfig } from "../../user/storage/types";

// Declare API interfaces
export interface IUserStorageAPI {
  getDefaultConfig: () => Promise<UserStorageConfig>;
  new: (config: UserStorageConfig) => Promise<boolean>;
}
