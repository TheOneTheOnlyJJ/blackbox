import { UiSchema } from "@rjsf/utils";
import { IUserDataStorageConfigWithMetadataInputData } from "@shared/user/data/storage/inputData/UserDataStorageConfigWithMetadataInputData";
import { USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA } from "./UserDataStorageConfigInputDataUiSchemas";

export const USER_DATA_STORAGE_CONFIG_WITH_METADATA_INPUT_DATA_UI_SCHEMA: UiSchema<IUserDataStorageConfigWithMetadataInputData> = {
  "ui:title": "Data Storage",
  visibilityPassword: {
    "ui:description":
      "**Important:** The visibility password **does not encrypt the data**; it only restricts visibility. \
      Leaving this field empty will create a **visible Data Storage** by default. \
      If you set a visibility password, **do not forget it**, as you will need it to access the Data Storage.",
    "ui:enableMarkdownInDescription": true
  },
  config: USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA
} as const;
