import { JSONSchemaType } from "ajv";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import {
  ILocalSQLiteUserDataStorageBackendConfigInfo,
  LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA
} from "./implementations/localSQLite/LocalSQLiteUserDataStorageBackendConfigInfo";
import {
  IOptionBUserDataStorageBackendConfigInfo,
  OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA
} from "./implementations/optionB/OptionBUserDataStorageBackendConfigInfo";
import {
  IOptionCUserDataStorageBackendConfigInfo,
  OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA
} from "./implementations/optionC/OptionCUserDataStorageBackendConfigInfo";

// Map of every user data storage backend type to its corresponding config info type
export interface IUserDataStorageBackendConfigInfoMap {
  [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: ILocalSQLiteUserDataStorageBackendConfigInfo;
  [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: IOptionBUserDataStorageBackendConfigInfo;
  [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: IOptionCUserDataStorageBackendConfigInfo;
}
// Union of all concrete user data storage backend config info interfaces
export type UserDataStorageBackendConfigInfo = IUserDataStorageBackendConfigInfoMap[keyof IUserDataStorageBackendConfigInfoMap];

type UserDataStorageBackendConfigInfoJSONSchemaMap = {
  [K in UserDataStorageBackendType]: JSONSchemaType<IUserDataStorageBackendConfigInfoMap[K]>;
};
export const USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_MAP: UserDataStorageBackendConfigInfoJSONSchemaMap = {
  [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA
} as const;

export const USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA: JSONSchemaType<UserDataStorageBackendConfigInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataStorageBackendConfigInfo>[]>(
      (accumulator: JSONSchemaType<UserDataStorageBackendConfigInfo>[], currentValue: string): JSONSchemaType<UserDataStorageBackendConfigInfo>[] => {
        accumulator.push(USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_MAP[currentValue as keyof UserDataStorageBackendConfigInfoJSONSchemaMap]);
        return accumulator;
      },
      []
    )
} as const;
