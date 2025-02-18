import { UiSchema } from "@rjsf/utils";
import {
  UserDataStorageConfigInputData,
  IUserDataStorageConfigInputDataMap
} from "@shared/user/data/storage/inputData/UserDataStorageConfigInputData";
import { USER_DATA_STORAGE_TYPES, UserDataStorageType } from "@shared/user/data/storage/UserDataStorageType";
import { LOCAL_SQLITE_USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA } from "./implementations/LocalSQLiteUserDataStorageInputDataUiSchema";
import { OPTION_B_USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA } from "./implementations/optionB";
import { OPTION_C_USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA } from "./implementations/optionC";

type UserDataStorageConfigInputDataUiSchemaMap = {
  [K in UserDataStorageType]: UiSchema<IUserDataStorageConfigInputDataMap[K]>;
};
export const USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA_MAP: UserDataStorageConfigInputDataUiSchemaMap = {
  [USER_DATA_STORAGE_TYPES.LocalSQLite]: LOCAL_SQLITE_USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA,
  [USER_DATA_STORAGE_TYPES.OptionB]: OPTION_B_USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA,
  [USER_DATA_STORAGE_TYPES.OptionC]: OPTION_C_USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA
} as const;

export const USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA: UiSchema<UserDataStorageConfigInputData> = {
  "ui:title": "Backend Type",
  // Sort by keys to ensure the order is the same even if definitions change around
  anyOf: Object.keys(USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA_MAP)
    .sort()
    .reduce<UiSchema<UserDataStorageConfigInputData>[]>((accumulator: UiSchema<UserDataStorageConfigInputData>[], currentValue: string) => {
      accumulator.push(
        USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA_MAP[
          currentValue as keyof typeof USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA_MAP
        ] as UiSchema<UserDataStorageConfigInputData> // Type cast required here due to generic invariance
      );
      return accumulator;
    }, [])
} as const;
