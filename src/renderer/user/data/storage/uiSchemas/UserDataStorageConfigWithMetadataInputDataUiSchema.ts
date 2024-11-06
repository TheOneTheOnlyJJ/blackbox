import { UiSchema } from "@rjsf/utils";
import { IUserDataStorageConfigWithMetadataInputData } from "@shared/user/data/storage/inputData/UserDataStorageConfigWithMetadataInputData";
import { USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA } from "./UserDataStorageConfigInputDataUiSchemas";

export const USER_DATA_STORAGE_CONFIG_WITH_METADATA_INPUT_DATA_UI_SCHEMA: UiSchema<IUserDataStorageConfigWithMetadataInputData> = {
  "ui:title": "Data Storage",
  name: {
    "ui:title": "Name"
  },
  config: USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA
} as const;
