import { UiSchema } from "@rjsf/utils";
import { IOptionCUserDataStorageConfigInputData } from "@shared/user/data/storage/inputData/implementations/optionC";

export const OPTION_C_USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA: UiSchema<IOptionCUserDataStorageConfigInputData> = {
  "ui:title": "Option C",
  "ui:options": {
    label: false
  },
  type: {
    "ui:widget": "hidden"
  },
  optionC: {
    "ui:title": "This is Option C Title"
  }
} as const;
