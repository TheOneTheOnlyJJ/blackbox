import { UiSchema } from "@rjsf/utils";
import { IUserDataStorageConfigCreateInput } from "@shared/user/data/storage/UserDataStorageConfigCreateInput";
import { USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA } from "./backend/uiSchemas/UserDataStorageBackendConfigCreateInputUiSchema";

export const USER_DATA_STORAGE_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<IUserDataStorageConfigCreateInput> = {
  "ui:title": "New Data Storage",
  visibilityPassword: {
    "ui:description":
      "**Important:** The visibility password **does not encrypt the data**; it only restricts visibility. \
      Leaving this field empty will create a **visible Data Storage** by default. \
      If you set a visibility password, **do not forget it**, as you will need it to access the Data Storage.",
    "ui:enableMarkdownInDescription": true
  },
  backendConfig: USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA
} as const;
