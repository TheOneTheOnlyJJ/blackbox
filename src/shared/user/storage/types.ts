import { JSONSchemaType } from "ajv";

// Enum of strings representing every concrete implementation of user storage
export enum UserStorageType {
  SQLite = "SQLite"
}

// Every user storage must have at least the type in its config (should be further narrowed down to its own in the specific config)
export interface BaseUserStorageConfig {
  type: UserStorageType;
}

// Configs for every user storage implementation
export interface SQLiteUserStorageConfig extends BaseUserStorageConfig {
  type: UserStorageType.SQLite;
  dbDirPath: string;
  dbFileName: string;
}
export const SQLITE_USER_STORAGE_CONFIG_SCHEMA: JSONSchemaType<SQLiteUserStorageConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [UserStorageType.SQLite]
    },
    dbDirPath: {
      type: "string",
      minLength: 1
    },
    dbFileName: {
      type: "string",
      minLength: 1
    }
  },
  required: ["type", "dbDirPath", "dbFileName"],
  additionalProperties: false
};

// Reunion of all user storage concrete implementation configuration interfaces
export type UserStorageConfig = SQLiteUserStorageConfig;
export const USER_STORAGE_CONFIG_SCHEMA: JSONSchemaType<UserStorageConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Add all user storage concrete implementation JSON schemas here
  oneOf: [SQLITE_USER_STORAGE_CONFIG_SCHEMA]
};
