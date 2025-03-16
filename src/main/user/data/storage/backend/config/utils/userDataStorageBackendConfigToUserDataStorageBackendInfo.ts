import { IUserDataStorageBackendInfoMap, UserDataStorageBackendInfo } from "@shared/user/data/storage/backend/info/UserDataStorageBackendInfo";
import { IUserDataStorageBackendConfigMap, UserDataStorageBackendConfig } from "../UserDataStorageBackendConfig";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { ILocalSQLiteUserDataStorageBackendConfig } from "../../implementations/LocalSQLite/LocalSQLiteUserDataStorageBackend";
import { ILocalSQLiteUserDataStorageBackendInfo } from "@shared/user/data/storage/backend/info/implementations/LocalSQLite/LocalSQLiteUserDataStorageBackendInfo";
import { IOptionBUserDataStorageBackendConfig } from "../../implementations/optionB/optionB";
import { IOptionBUserDataStorageBackendInfo } from "@shared/user/data/storage/backend/info/implementations/optionB/OptionBUserDataStorageBackendInfo";
import { IOptionCUserDataStorageBackendConfig } from "../../implementations/optionC/optionC";
import { IOptionCUserDataStorageBackendInfo } from "@shared/user/data/storage/backend/info/implementations/optionC/OptionCUserDataStorageBackendInfo";
import { LogFunctions } from "electron-log";
import { LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/LocalSQLite/LocalSQLiteUserDataStorageBackendConstants";
import { OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/optionB/OptionBUserDataStorageBackendConstants";
import { OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/optionC/OptionCUserDataStorageBackendConstants";

type UserDataStorageBackendConfigToUserDataStorageBackendInfoFunctionMap = {
  [K in UserDataStorageBackendType]: (userDataStorageBackendConfig: IUserDataStorageBackendConfigMap[K]) => IUserDataStorageBackendInfoMap[K];
};
const USER_DATA_STORAGE_BACKEND_CONFIG_TO_USER_DATA_STORAGE_BACKEND_INFO_FUNCTION_MAP: UserDataStorageBackendConfigToUserDataStorageBackendInfoFunctionMap =
  {
    [USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite]: (
      userDataStorageBackendConfig: ILocalSQLiteUserDataStorageBackendConfig
    ): ILocalSQLiteUserDataStorageBackendInfo => {
      return {
        ...userDataStorageBackendConfig,
        type: LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type.title
      } satisfies ILocalSQLiteUserDataStorageBackendInfo;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.OptionB]: (
      userDataStorageBackendConfig: IOptionBUserDataStorageBackendConfig
    ): IOptionBUserDataStorageBackendInfo => {
      return {
        ...userDataStorageBackendConfig,
        type: OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type.title
      } satisfies IOptionBUserDataStorageBackendInfo;
    },
    [USER_DATA_STORAGE_BACKEND_TYPES.OptionC]: (
      userDataStorageBackendConfig: IOptionCUserDataStorageBackendConfig
    ): IOptionCUserDataStorageBackendInfo => {
      return {
        ...userDataStorageBackendConfig,
        type: OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type.title
      } satisfies IOptionCUserDataStorageBackendInfo;
    }
  };

export const userDataStorageBackendConfigToUserDataStorageBackendInfo = (
  userDataStorageBackendConfig: UserDataStorageBackendConfig,
  logger: LogFunctions | null
): UserDataStorageBackendInfo => {
  logger?.debug(`Converting "${userDataStorageBackendConfig.type}" User Data Storage Backend Config to User Data Storage Backend Config Info.`);
  // TODO: Ocasionally check if TypeScript can manage not throwing a type error here (TS 5.9)
  switch (userDataStorageBackendConfig.type) {
    case USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite:
      return USER_DATA_STORAGE_BACKEND_CONFIG_TO_USER_DATA_STORAGE_BACKEND_INFO_FUNCTION_MAP[userDataStorageBackendConfig.type](
        userDataStorageBackendConfig
      );
    case USER_DATA_STORAGE_BACKEND_TYPES.OptionB:
      return USER_DATA_STORAGE_BACKEND_CONFIG_TO_USER_DATA_STORAGE_BACKEND_INFO_FUNCTION_MAP[userDataStorageBackendConfig.type](
        userDataStorageBackendConfig
      );
    case USER_DATA_STORAGE_BACKEND_TYPES.OptionC:
      return USER_DATA_STORAGE_BACKEND_CONFIG_TO_USER_DATA_STORAGE_BACKEND_INFO_FUNCTION_MAP[userDataStorageBackendConfig.type](
        userDataStorageBackendConfig
      );
    default:
      throw new Error(`Invalid User Data Storage Backend Config type "${(userDataStorageBackendConfig as { type: string }).type}"`);
  }
};
