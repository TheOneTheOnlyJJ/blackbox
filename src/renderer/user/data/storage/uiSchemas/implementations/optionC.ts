import { UiSchema } from "@rjsf/utils";
import { OptionCUserDataStorageConfigInputData } from "@shared/user/data/storage/inputData/implementations/optionC";
import { USER_DATA_STORAGE_TYPES } from "@shared/user/data/storage/UserDataStorageType";

export const OPTION_C_USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA: UiSchema<OptionCUserDataStorageConfigInputData> = {
  "ui:title": USER_DATA_STORAGE_TYPES.OptionC,
  "ui:options": {
    label: false
  },
  type: {
    "ui:widget": "hidden"
  },
  optionC: {
    "ui:title": "This is Option C Title"
  }
};
