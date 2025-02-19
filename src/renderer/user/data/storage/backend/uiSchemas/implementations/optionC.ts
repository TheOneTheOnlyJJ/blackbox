import { UiSchema } from "@rjsf/utils";
import { IOptionCUserDataStorageBackendConfigCreateInput } from "@shared/user/data/storage/backend/createInput/implementations/optionC";

export const OPTION_C_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IOptionCUserDataStorageBackendConfigCreateInput> = {
  "ui:title": "Option C",
  "ui:options": {
    label: false
  },
  type: {
    "ui:widget": "hidden"
  }
} as const;
