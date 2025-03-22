import { LogFunctions } from "electron-log";
import { LocalSQLiteUserDataStorageBackend } from "./implementations/localSQLite/LocalSQLiteUserDataStorageBackend";
import { IUserDataStorageBackendConfigMap } from "./config/UserDataStorageBackendConfig";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { OptionBUserDataStorageBackend } from "./implementations/optionB/optionB";
import { OptionCUserDataStorageBackend } from "./implementations/optionC/optionC";
import { UserDataStorageBackend } from "./UserDataStorageBackend";
import { IUserDataStorageBackendInfoMap } from "@shared/user/data/storage/backend/info/UserDataStorageBackendInfo";

export function userDataStorageBackendFactory<T extends UserDataStorageBackendType>(
  config: IUserDataStorageBackendConfigMap[T],
  logScope: string,
  onInfoChanged: (newInfo: Readonly<IUserDataStorageBackendInfoMap[T]>) => void,
  logger: LogFunctions | null
): UserDataStorageBackend {
  /// TOD: Remove ts-expect-error when 5.9 releases
  logger?.debug("Running User Data Storage Backend factory.");
  switch (config.type) {
    case USER_DATA_STORAGE_BACKEND_TYPES.localSQLite:
      // @ts-expect-error This will get fixes in TS 5.9 fingers crossed
      return new LocalSQLiteUserDataStorageBackend(config, logScope, onInfoChanged);
    case USER_DATA_STORAGE_BACKEND_TYPES.optionB:
      // @ts-expect-error This will get fixes in TS 5.9 fingers crossed
      return new OptionBUserDataStorageBackend(config, logScope, onInfoChanged);
    case USER_DATA_STORAGE_BACKEND_TYPES.optionC:
      // @ts-expect-error This will get fixes in TS 5.9 fingers crossed
      return new OptionCUserDataStorageBackend(config, logScope, onInfoChanged);
    default:
      throw new Error(`Invalid User Data Storage Backend config received: ${String(config)}`);
  }
}
