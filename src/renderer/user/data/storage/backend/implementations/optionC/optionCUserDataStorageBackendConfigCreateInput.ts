import { JSONSchemaType } from "ajv";
import { IBaseUserDataStorageBackendConfigCreateInput } from "../../config/create/input/BaseUserDataStorageBackendConfigCreateInput";
import { UiSchema } from "@rjsf/utils";
import { OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/optionC/OptionCUserDataStorageBackendConstants";
import { USER_DATA_STORAGE_BACKEND_TYPES, UserDataStorageBackendTypes } from "@shared/user/data/storage/backend/UserDataStorageBackendType";

export interface IOptionCUserDataStorageBackendConfigCreateInput extends IBaseUserDataStorageBackendConfigCreateInput {
  type: UserDataStorageBackendTypes["optionC"];
  optionC: string;
}

export const OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IOptionCUserDataStorageBackendConfigCreateInput> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.optionC],
      default: USER_DATA_STORAGE_BACKEND_TYPES.optionC,
      ...OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type
    },
    optionC: {
      type: "string",
      ...OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionC
    }
  },
  required: ["type", "optionC"],
  additionalProperties: false
} as const;

export const OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IOptionCUserDataStorageBackendConfigCreateInput> = {
  "ui:title": OPTION_C_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type.title,
  "ui:options": {
    label: false
  },
  type: {
    "ui:widget": "hidden"
  }
} as const;
