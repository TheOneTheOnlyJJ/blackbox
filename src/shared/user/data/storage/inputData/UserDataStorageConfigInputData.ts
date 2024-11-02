import { JSONSchemaType } from "ajv";
import {
  LOCAL_SQLITE_USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA,
  LocalSQLiteUserDataStorageConfigInputData
} from "./implementations/LocalSQLiteUserDataStorageConfigInputData";

// Union of all user data storage concrete implementation config input data interfaces
export type UserDataStorageConfigInputData = LocalSQLiteUserDataStorageConfigInputData;

// TODO: Find a way to sync order of these and UiSchemas from renderer (runtime generated mapping?)
export const USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA: JSONSchemaType<UserDataStorageConfigInputData> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  anyOf: [LOCAL_SQLITE_USER_DATA_STORAGE_CONFIG_INPUT_DATA_SCHEMA]
};
