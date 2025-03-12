import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendConfigCreateInput } from "../../config/create/input/BaseUserDataStorageBackendConfigCreateInput";
import { UiSchema } from "@rjsf/utils";
import { LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/implementations/LocalSQLite/LocalSQLiteUserDataStorageBackendConfigConstants";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import RJSFDirectoryPickerWidget from "@renderer/components/RJSFWidgets/RJSFDirectoryPickerWidget";

export interface ILocalSQLiteUserDataStorageBackendConfigCreateInput extends IBaseUserDataStorageBackendConfigCreateInput {
  type: UserDataStorageBackendTypes["LocalSQLite"];
  dbDirPath: string;
  dbFileName: string;
}

export const LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<ILocalSQLiteUserDataStorageBackendConfigCreateInput> =
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: [USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite],
        default: USER_DATA_STORAGE_BACKEND_TYPES.LocalSQLite,
        ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS.type
      },
      dbDirPath: {
        type: "string",
        ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS.dbDirPath
      },
      dbFileName: {
        type: "string",
        ...LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS.dbFileName
      }
    },
    required: ["type", "dbDirPath", "dbFileName"],
    additionalProperties: false
  } as const;

export const LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<ILocalSQLiteUserDataStorageBackendConfigCreateInput> = {
  "ui:title": "Local SQLite",
  "ui:options": {
    label: false
  },
  type: {
    "ui:widget": "hidden"
  },
  dbDirPath: {
    "ui:title": LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_JSON_SCHEMA_CONSTANTS.dbDirPath.title,
    "ui:description": "The absolute directory path at which the SQLite file will be created",
    "ui:widget": RJSFDirectoryPickerWidget
  },
  dbFileName: {
    "ui:enableMarkdownInDescription": true,
    "ui:description": "File extension **not** required"
  }
} as const;
