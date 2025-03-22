import { LogFunctions } from "electron-log";
import { LocalSQLiteUserAccountStorageBackend } from "./implementations/localSQLite/LocalSQLiteUserAccountStorageBackend";
import {
  USER_ACCOUNT_STORAGE_BACKEND_TYPES,
  UserAccountStorageBackendType
} from "@shared/user/account/storage/backend/UserAccountStorageBackendType";
import { IUserAccountStorageBackendConfigMap } from "./config/UserAccountStorageBackendConfig";
import { IUserAccountStorageBackendMap } from "./UserAccountStorageBackend";
import { IUserAccountStorageBackendInfoMap } from "@shared/user/account/storage/backend/info/UserAccountStorageBackendInfo";

export function userAccountStorageBackendFactory<T extends UserAccountStorageBackendType>(
  config: IUserAccountStorageBackendConfigMap[T],
  logScope: string,
  onInfoChanged: (newInfo: Readonly<IUserAccountStorageBackendInfoMap[T]>) => void,
  logger: LogFunctions | null
): IUserAccountStorageBackendMap[T] {
  logger?.debug("Running User Acount Storage Backend factory.");
  switch (config.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case USER_ACCOUNT_STORAGE_BACKEND_TYPES.localSQLite:
      return new LocalSQLiteUserAccountStorageBackend(config, logScope, onInfoChanged);
    default:
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      throw new Error(`Invalid User Acount Storage Backend config received: ${String(config)}`);
  }
}
