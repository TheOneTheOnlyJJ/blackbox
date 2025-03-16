import { LogFunctions } from "electron-log";
import { USER_ACCOUNT_STORAGE_BACKEND_TYPES, UserAccountStorageBackendType } from "../../UserAccountStorageBackendType";
import { IUserAccountStorageBackendConfigMap, UserAccountStorageBackendConfig } from "../UserAccountStorageBackendConfig";
import {
  IUserAccountStorageBackendInfoMap,
  UserAccountStorageBackendInfo
} from "@shared/user/account/storage/backend/info/UserAccountStorageBackendInfo";
import { ILocalSQLiteUserAccountStorageBackendConfig } from "../../implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackend";
import { ILocalSQLiteUserAccountStorageBackendInfo } from "@shared/user/account/storage/backend/info/implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackendInfo";
import { LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/account/storage/backend/constants/implementations/LocalSQLite/LocalSQLiteUserAccountStorageBackendConstants";

type UserAccountStorageBackendConfigToUserAccountStorageBackendInfoFunctionMap = {
  [K in UserAccountStorageBackendType]: (
    userAccountStorageBackendConfig: IUserAccountStorageBackendConfigMap[K]
  ) => IUserAccountStorageBackendInfoMap[K];
};
const USER_ACCOUNT_STORAGE_BACKEND_CONFIG_TO_USER_ACCOUNT_STORAGE_BACKEND_INFO_FUNCTION_MAP: UserAccountStorageBackendConfigToUserAccountStorageBackendInfoFunctionMap =
  {
    [USER_ACCOUNT_STORAGE_BACKEND_TYPES.LocalSQLite]: (
      userAccountStorageBackendConfig: ILocalSQLiteUserAccountStorageBackendConfig
    ): ILocalSQLiteUserAccountStorageBackendInfo => {
      return {
        ...userAccountStorageBackendConfig,
        type: LOCAL_SQLITE_USER_ACCOUNT_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type.title
      } satisfies ILocalSQLiteUserAccountStorageBackendInfo;
    }
  };

export const userAccountStorageBackendConfigToUserAccountStorageBackendInfo = (
  userAccountStorageBackendConfig: UserAccountStorageBackendConfig,
  logger: LogFunctions | null
): UserAccountStorageBackendInfo => {
  logger?.debug(
    `Converting "${userAccountStorageBackendConfig.type}" User Account Storage Backend Config to User Account Storage Backend Config Info.`
  );
  // TODO: Ocasionally check if TypeScript can manage not throwing a type error here (TS 5.9)
  switch (userAccountStorageBackendConfig.type) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    case USER_ACCOUNT_STORAGE_BACKEND_TYPES.LocalSQLite:
      return USER_ACCOUNT_STORAGE_BACKEND_CONFIG_TO_USER_ACCOUNT_STORAGE_BACKEND_INFO_FUNCTION_MAP[userAccountStorageBackendConfig.type](
        userAccountStorageBackendConfig
      );
    default:
      throw new Error(`Invalid User Account Storage Backend Config type "${(userAccountStorageBackendConfig as { type: string }).type}"`);
  }
};
