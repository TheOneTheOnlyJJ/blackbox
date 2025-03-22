import { IUserDataStorageBackendConfigMap, UserDataStorageBackendConfig } from "../UserDataStorageBackendConfig";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { ILocalSQLiteUserDataStorageBackendConfig } from "../../implementations/localSQLite/LocalSQLiteUserDataStorageBackend";
import { IOptionBUserDataStorageBackendConfig } from "../../implementations/optionB/optionB";
import { IOptionCUserDataStorageBackendConfig } from "../../implementations/optionC/optionC";
import { LogFunctions } from "electron-log";
import {
  IUserDataStorageBackendConfigInfoMap,
  UserDataStorageBackendConfigInfo
} from "@shared/user/data/storage/backend/config/info/UserDataStorageBackendConfigInfo";
import { ILocalSQLiteUserDataStorageBackendConfigInfo } from "@shared/user/data/storage/backend/config/info/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConfigInfo";
import { IOptionBUserDataStorageBackendConfigInfo } from "@shared/user/data/storage/backend/config/info/implementations/optionB/OptionBUserDataStorageBackendConfigInfo";
import { IOptionCUserDataStorageBackendConfigInfo } from "@shared/user/data/storage/backend/config/info/implementations/optionC/OptionCUserDataStorageBackendConfigInfo";

type UserDataStorageBackendConfigToUserDataStorageBackendConfigInfoFunctionMap = {
  [K in UserDataStorageBackendType]: (userDataStorageBackendConfig: IUserDataStorageBackendConfigMap[K]) => IUserDataStorageBackendConfigInfoMap[K];
};
const USER_DATA_STORAGE_BACKEND_CONFIG_TO_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_FUNCTION_MAP: UserDataStorageBackendConfigToUserDataStorageBackendConfigInfoFunctionMap =
  {
    [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: (
      userDataStorageBackendConfig: ILocalSQLiteUserDataStorageBackendConfig
    ): ILocalSQLiteUserDataStorageBackendConfigInfo => {
      return {
        ...userDataStorageBackendConfig,
        isLocal: true
      } satisfies ILocalSQLiteUserDataStorageBackendConfigInfo;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: (
      userDataStorageBackendConfig: IOptionBUserDataStorageBackendConfig
    ): IOptionBUserDataStorageBackendConfigInfo => {
      return {
        ...userDataStorageBackendConfig,
        isLocal: true
      } satisfies IOptionBUserDataStorageBackendConfigInfo;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: (
      userDataStorageBackendConfig: IOptionCUserDataStorageBackendConfig
    ): IOptionCUserDataStorageBackendConfigInfo => {
      return {
        ...userDataStorageBackendConfig,
        isLocal: false
      } satisfies IOptionCUserDataStorageBackendConfigInfo;
    }
  };

export const userDataStorageBackendConfigToUserDataStorageBackendConfigInfo = (
  userDataStorageBackendConfig: UserDataStorageBackendConfig,
  logger: LogFunctions | null
): UserDataStorageBackendConfigInfo => {
  logger?.debug(`Converting "${userDataStorageBackendConfig.type}" User Data Storage Backend Config to User Data Storage Backend Config Info.`);
  // TODO: Ocasionally check if TypeScript can manage not throwing a type error here (TS 5.9)
  switch (userDataStorageBackendConfig.type) {
    case USER_DATA_STORAGE_BACKEND_TYPES.localSQLite:
      return USER_DATA_STORAGE_BACKEND_CONFIG_TO_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_FUNCTION_MAP[userDataStorageBackendConfig.type](
        userDataStorageBackendConfig
      );
    case USER_DATA_STORAGE_BACKEND_TYPES.optionB:
      return USER_DATA_STORAGE_BACKEND_CONFIG_TO_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_FUNCTION_MAP[userDataStorageBackendConfig.type](
        userDataStorageBackendConfig
      );
    case USER_DATA_STORAGE_BACKEND_TYPES.optionC:
      return USER_DATA_STORAGE_BACKEND_CONFIG_TO_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_FUNCTION_MAP[userDataStorageBackendConfig.type](
        userDataStorageBackendConfig
      );
    default:
      throw new Error(`Invalid User Data Storage Backend Config type "${(userDataStorageBackendConfig as { type: string }).type}"`);
  }
};
