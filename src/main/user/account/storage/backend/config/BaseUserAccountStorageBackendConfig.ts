import { UserAccountStorageBackendType } from "@shared/user/account/storage/backend/UserAccountStorageBackendType";

// Every user account storage must have at least the type in its config (should be further narrowed down to its own in the specific config)
export interface IBaseUserAccountStorageBackendConfig {
  type: UserAccountStorageBackendType;
}
