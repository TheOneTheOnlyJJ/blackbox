import { SQLiteUserStorage, SQLiteUserStorageConfig } from "./implementations/SQLiteUserStorage";
import { JSONSchemaType } from "ajv";
import { UserStorageType } from "./UserStorageType";

// Reunion of all user storage concrete implementation configuration interfaces
export type UserStorageConfig = SQLiteUserStorageConfig;

// JSON schema matching any of the individual implementations' schemas
export const USER_STORAGE_CONFIG_SCHEMA: JSONSchemaType<UserStorageConfig> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // Add all user storage concrete implementation JSON schemas here
  oneOf: [SQLiteUserStorage.CONFIG_SCHEMA]
};

export function getUserStorageConfigSchemaForType(type: UserStorageType): JSONSchemaType<UserStorageConfig> {
  switch (type) {
    case UserStorageType.SQLite:
      return SQLiteUserStorage.CONFIG_SCHEMA;
    default:
      // This is here as a last-resort option, but ESlint bitches about it
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Invalid user storage type received: ${type}`);
  }
}
