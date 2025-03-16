import { JSONSchemaType } from "ajv";
import {
  USER_DATA_STORAGE_BACKEND_TYPES,
  UserDataStorageBackendTypes
} from "../../../../../../../shared/user/data/storage/backend/UserDataStorageBackendType";
import { IBaseUserDataStorageBackendConfigCreateInput } from "../../config/create/input/BaseUserDataStorageBackendConfigCreateInput";
import { UiSchema } from "@rjsf/utils";
import { OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS } from "@shared/user/data/storage/backend/constants/implementations/optionB/OptionBUserDataStorageBackendConstants";

export interface IOptionBUserDataStorageBackendConfigCreateInput extends IBaseUserDataStorageBackendConfigCreateInput {
  type: UserDataStorageBackendTypes["OptionB"];
  optionB: string;
}

export const OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IOptionBUserDataStorageBackendConfigCreateInput> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.OptionB],
      default: USER_DATA_STORAGE_BACKEND_TYPES.OptionB,
      ...OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type
    },
    optionB: {
      type: "string",
      ...OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.optionB
    }
  },
  required: ["type", "optionB"],
  additionalProperties: false
} as const;

export const OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IOptionBUserDataStorageBackendConfigCreateInput> = {
  "ui:title": OPTION_B_USER_DATA_STORAGE_BACKEND_JSON_SCHEMA_CONSTANTS.type.title,
  "ui:options": {
    label: false
  },
  type: {
    "ui:widget": "hidden"
  }
} as const;
