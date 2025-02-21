import { JSONSchemaType } from "ajv";
import {
  USER_DATA_STORAGE_BACKEND_TYPES,
  UserDataStorageBackendTypes
} from "../../../../../../../shared/user/data/storage/backend/UserDataStorageBackendType";
import { IBaseUserDataStorageBackendConfigCreateInput } from "../../config/create/input/BaseUserDataStorageBackendConfigCreateInput";
import { UiSchema } from "@rjsf/utils";

export interface IOptionCUserDataStorageBackendConfigCreateInput extends IBaseUserDataStorageBackendConfigCreateInput {
  type: UserDataStorageBackendTypes["OptionC"];
  optionC: string;
}

export const OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_JSON_SCHEMA: JSONSchemaType<IOptionCUserDataStorageBackendConfigCreateInput> = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: [USER_DATA_STORAGE_BACKEND_TYPES.OptionC],
      default: USER_DATA_STORAGE_BACKEND_TYPES.OptionC
    },
    optionC: {
      type: "string",
      title: "This is Option C Title",
      minLength: 10
    }
  },
  required: ["type", "optionC"],
  additionalProperties: false
} as const;

export const OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IOptionCUserDataStorageBackendConfigCreateInput> = {
  "ui:title": "Option C",
  "ui:options": {
    label: false
  },
  type: {
    "ui:widget": "hidden"
  }
} as const;
