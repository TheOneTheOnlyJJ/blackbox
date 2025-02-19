import { UiSchema } from "@rjsf/utils";
import { ILocalSQLiteUserDataStorageBackendConfigCreateInput } from "@shared/user/data/storage/backend/createInput/implementations/LocalSQLiteUserDataStorageBackendConfigCreateInput";

export const LOCAL_SQLITE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_INPUT_UI_SCHEMA: UiSchema<ILocalSQLiteUserDataStorageBackendConfigCreateInput> = {
  "ui:title": "Local SQLite",
  "ui:options": {
    label: false
  },
  type: {
    "ui:widget": "hidden"
  }
} as const;
