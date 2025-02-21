import { UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";

// Every user data storage backend must have at least the type in its config (should be further narrowed down to its own in the specific config)
export interface IBaseUserDataStorageBackendConfig {
  type: UserDataStorageBackendType;
}
