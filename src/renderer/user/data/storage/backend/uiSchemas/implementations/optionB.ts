import { UiSchema } from "@rjsf/utils";
import { IOptionBUserDataStorageBackendConfigCreateInput } from "@shared/user/data/storage/backend/createInput/implementations/optionB";

export const OPTION_B_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IOptionBUserDataStorageBackendConfigCreateInput> = {
  "ui:title": "Option B",
  "ui:options": {
    label: false
  },
  type: {
    "ui:widget": "hidden"
  }
} as const;
