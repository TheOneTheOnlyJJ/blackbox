import { JSONSchemaType } from "ajv";
import { LocalSQLiteUserDataStorage, ILocalSQLiteUserDataStorageConfig } from "./implementations/LocalSQLiteUserDataStorage";

// Union of all user data storage concrete implementation config interfaces
export type UserDataStorageConfig = ILocalSQLiteUserDataStorageConfig;

export const USER_DATA_STORAGE_CONFIG_SCHEMA: JSONSchemaType<UserDataStorageConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  anyOf: [LocalSQLiteUserDataStorage.CONFIG_SCHEMA]
} as const;
