import { JSONSchemaType } from "ajv";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { UiSchema } from "@rjsf/utils";
import {
  ILocalSQLiteUserDataStorageBackendConfigCreateInput,
  LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA
} from "@renderer/user/data/storage/backend/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConfigCreateInput";
import {
  IOptionBUserDataStorageBackendConfigCreateInput,
  OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA
} from "@renderer/user/data/storage/backend/implementations/optionB/optionBUserDataStorageBackendConfigCreateInput";
import {
  IOptionCUserDataStorageBackendConfigCreateInput,
  OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA
} from "@renderer/user/data/storage/backend/implementations/optionC/optionCUserDataStorageBackendConfigCreateInput";

export interface IUserDataStorageBackendConfigCreateInputMap {
  [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: ILocalSQLiteUserDataStorageBackendConfigCreateInput;
  [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: IOptionBUserDataStorageBackendConfigCreateInput;
  [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: IOptionCUserDataStorageBackendConfigCreateInput;
}
export type UserDataStorageBackendConfigCreateInput = IUserDataStorageBackendConfigCreateInputMap[keyof IUserDataStorageBackendConfigCreateInputMap];

type UserDataStorageBackendConfigCreateInputJSONSchemaMap = {
  [K in UserDataStorageBackendType]: JSONSchemaType<IUserDataStorageBackendConfigCreateInputMap[K]>;
};
export const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA_MAP: UserDataStorageBackendConfigCreateInputJSONSchemaMap = {
  [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA
} as const;

export const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<UserDataStorageBackendConfigCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataStorageBackendConfigCreateInput>[]>(
      (
        accumulator: JSONSchemaType<UserDataStorageBackendConfigCreateInput>[],
        currentValue: string
      ): JSONSchemaType<UserDataStorageBackendConfigCreateInput>[] => {
        accumulator.push(
          USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA_MAP[currentValue as keyof UserDataStorageBackendConfigCreateInputJSONSchemaMap]
        );
        return accumulator;
      },
      []
    )
} as const;

type UserDataStorageBackendConfigCreateInputUiSchemaMap = {
  [K in UserDataStorageBackendType]: UiSchema<IUserDataStorageBackendConfigCreateInputMap[K]>;
};
export const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA_MAP: UserDataStorageBackendConfigCreateInputUiSchemaMap = {
  [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite]: LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.optionB]: OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.optionC]: OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA
} as const;

export const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<UserDataStorageBackendConfigCreateInput> = {
  "ui:title": "Backend Type",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA_MAP)
    .sort()
    .reduce<UiSchema<UserDataStorageBackendConfigCreateInput>[]>(
      (
        accumulator: UiSchema<UserDataStorageBackendConfigCreateInput>[],
        currentValue: string
      ): UiSchema<UserDataStorageBackendConfigCreateInput>[] => {
        accumulator.push(
          USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA_MAP[
            currentValue as keyof UserDataStorageBackendConfigCreateInputUiSchemaMap
          ] as UiSchema<UserDataStorageBackendConfigCreateInput> // Apparently this is required here
        );
        return accumulator;
      },
      []
    )
} as const;
