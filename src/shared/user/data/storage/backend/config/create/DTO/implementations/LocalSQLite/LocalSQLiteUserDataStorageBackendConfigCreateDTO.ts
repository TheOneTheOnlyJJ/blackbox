import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendConfigCreateDTO } from "../../BaseUserDataStorageBackendConfigCreateDTO";
import { LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "../../../../../constants/implementations/LocalSQLite/LocalSQLiteUserDataStorageBackendConstants";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";

export interface ILocalSQLiteUserDataStorageBackendConfigCreateDTO extends IBaseUserDataStorageBackendConfigCreateDTO {
  type: UserDataStorageBackendTypes["LocalSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

export const LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_DTO_JSON_SCHEMA: JSONSchemaType<ILocalSQLiteUserDataStorageBackendConfigCreateDTO> =
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite],
        default: USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite,
        ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type
      },
      dbDirPath: {
        type: "string",
        ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbDirPath
      },
      dbFileName: {
        type: "string",
        ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbFileName
      }
    },
    required: ["type", "dbDirPath", "dbFileName"],
    additionalProperties: false
  } as const;
