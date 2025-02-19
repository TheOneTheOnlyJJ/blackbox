import { UiSchema } from "@rjsf/utils";
import {
  UserDataStorageBackendConfigCreateInput,
  IUserDataStorageBackendConfigCreateInputMap
} from "@shared/user/data/storage/backend/createInput/UserDataStorageBackendConfigCreateInput";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import { LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA } from "./implementations/LocalSQLiteUserDataStorageBackendConfigCreateInputUiSchema";
import { OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA } from "./implementations/optionB";
import { OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA } from "./implementations/optionC";

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
