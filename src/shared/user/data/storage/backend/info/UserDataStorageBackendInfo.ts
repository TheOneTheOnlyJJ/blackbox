import { JSONSchemaType } from "ajv";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import {
  ILocalSQLiteUserDataStorageBackendInfo,
  LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA
} from "./implementations/localSQLite/LocalSQLiteUserDataStorageBackendInfo";
import {
  IOptionBUserDataStorageBackendInfo,
  OPTION_B_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA
} from "./implementations/optionB/OptionBUserDataStorageBackendInfo";
import {
  IOptionCUserDataStorageBackendInfo,
  OPTION_C_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA
} from "./implementations/optionC/OptionCUserDataStorageBackendInfo";

export interface IUserDataStorageBackendInfoMap {
  [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: ILocalSQLiteUserDataStorageBackendInfo;
  [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: IOptionBUserDataStorageBackendInfo;
  [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: IOptionCUserDataStorageBackendInfo;
}
export type UserDataStorageBackendInfo = IUserDataStorageBackendInfoMap[keyof IUserDataStorageBackendInfoMap];

type UserDataStorageBackendInfoJSONSchemaMap = {
  [K in UserDataStorageBackendType]: JSONSchemaType<IUserDataStorageBackendInfoMap[K]>;
};
export const USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_MAP: UserDataStorageBackendInfoJSONSchemaMap = {
  [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: OPTION_B_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: OPTION_C_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA
} as const;

export const USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA: JSONSchemaType<UserDataStorageBackendInfo> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataStorageBackendInfo>[]>(
      (accumulator: JSONSchemaType<UserDataStorageBackendInfo>[], currentValue: string): JSONSchemaType<UserDataStorageBackendInfo>[] => {
        accumulator.push(USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_MAP[currentValue as keyof UserDataStorageBackendInfoJSONSchemaMap]);
        return accumulator;
      },
      []
    )
} as const;
