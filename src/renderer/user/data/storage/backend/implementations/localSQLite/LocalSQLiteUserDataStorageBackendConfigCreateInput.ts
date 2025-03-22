import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendConfigCreateInput } from "../../config/create/input/BaseUserDataStorageBackendConfigCreateInput";
import { UiSchema } from "@rjsf/utils";
import { LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/localSQLite/LocalSQLiteUserDataStorageBackendConstants";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";
import RJSFDirectoryPickerWidget from "@renderer/components/RJSFWidgets/RJSFDirectoryPickerWidget";
import { BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/config/info/BaseUserDataStorageBackendConfigInfo";
import { USER_DATA_STORAGE_BACKEND_TYPE_NAMES } from "@shared/user/data/storage/backend/UserDataStorageBackendTypeName";

export interface ILocalSQLiteUserDataStorageBackendConfigCreateInput extends IBaseUserDataStorageBackendConfigCreateInput {
  type: UserDataStorageBackendTypes["localSQLite"];
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
        enum: [USER_DATA_STORAGE_BACKEND_TYPES.localSQLite],
        default: USER_DATA_STORAGE_BACKEND_TYPES.localSQLite,
        ...BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS.type
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

export const LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<ILocalSQLiteUserDataStorageBackendConfigCreateInput> = {
  "ui:title": USER_DATA_STORAGE_BACKEND_TYPE_NAMES[USER_DATA_STORAGE_BACKEND_TYPES.localSQLite],
  "ui:options": {
    label: false
  },
  type: {
    "ui:widget": "hidden"
  },
  dbDirPath: {
    "ui:title": LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.dbDirPath.title,
    "ui:description": "Absolute folder path at which the SQLite file will be created",
    "ui:widget": RJSFDirectoryPickerWidget,
    "ui:options": {
      pickerTitle: "Select folder for SQLite Data Storage file"
    }
  },
  dbFileName: {
    "ui:enableMarkdownInDescription": true,
    "ui:description": "File extension **not** required"
  }
} as const;
