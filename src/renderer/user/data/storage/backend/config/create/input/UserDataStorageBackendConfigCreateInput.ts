import { JSONSchemaType } from "ajv";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { UiSchema } from "@rjsf/utils";
import {
  ILocalSQLiteUserDataStorageBackendConfigCreateInput,
  LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA
} from "@renderer/user/data/storage/backend/implementations/LocalSQLite/LocalSQLiteUserDataStorageBackendConfigCreateInput";
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

// Map of every user data storage backend type to its corresponding config create input type
export interface IUserDataStorageBackendConfigCreateInputMap {
  [USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite]: ILocalSQLiteUserDataStorageBackendConfigCreateInput;
  [USER_DATA_STORAGE_BACKEND_TYPES.OptionB]: IOptionBUserDataStorageBackendConfigCreateInput;
  [USER_DATA_STORAGE_BACKEND_TYPES.OptionC]: IOptionCUserDataStorageBackendConfigCreateInput;
}
// Union of all concrete user data storage backend config create input interfaces
export type UserDataStorageBackendConfigCreateInput = IUserDataStorageBackendConfigCreateInputMap[keyof IUserDataStorageBackendConfigCreateInputMap];

type UserDataStorageBackendConfigCreateInputJSONSchemaMap = {
  [K in UserDataStorageBackendType]: JSONSchemaType<IUserDataStorageBackendConfigCreateInputMap[K]>;
};
export const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA_MAP: UserDataStorageBackendConfigCreateInputJSONSchemaMap = {
  [USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite]: LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.OptionB]: OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.OptionC]: OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA
} as const;

export const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<UserDataStorageBackendConfigCreateInput> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA_MAP)
    .sort()
    .reduce<JSONSchemaType<UserDataStorageBackendConfigCreateInput>[]>(
      (accumulator: JSONSchemaType<UserDataStorageBackendConfigCreateInput>[], currentValue: string) => {
        accumulator.push(
          USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA_MAP[
            currentValue as keyof typeof USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA_MAP
          ]
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
  [USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite]: LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.OptionB]: OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA,
  [USER_DATA_STORAGE_BACKEND_TYPES.OptionC]: OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA
} as const;

export const USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<UserDataStorageBackendConfigCreateInput> = {
  "ui:title": "Backend Type",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA_MAP)
    .sort()
    .reduce<UiSchema<UserDataStorageBackendConfigCreateInput>[]>(
      (accumulator: UiSchema<UserDataStorageBackendConfigCreateInput>[], currentValue: string) => {
        accumulator.push(
          USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA_MAP[
            currentValue as keyof typeof USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA_MAP
          ] as UiSchema<UserDataStorageBackendConfigCreateInput> // Type cast required here due to generic invariance
        );
        return accumulator;
      },
      []
    )
} as const;
