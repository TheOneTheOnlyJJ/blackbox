import { UiSchema } from "@rjsf/utils";
import { IOptionBUserDataStorageConfigInputData } from "@shared/user/data/storage/inputData/implementations/optionB";

export const OPTION_B_USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA: UiSchema<IOptionBUserDataStorageConfigInputData> = {
  "ui:title": "Option B",
  "ui:options": {
    label: false
  },
  type: {
    "ui:widget": "hidden"
  },
  optionB: {
    "ui:title": "OPTION B TITLE"
  }
} as const;
