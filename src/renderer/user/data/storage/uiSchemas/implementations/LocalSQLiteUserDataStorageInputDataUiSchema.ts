import { UiSchema } from "@rjsf/utils";
import { ILocalSQLiteUserDataStorageConfigInputData } from "@shared/user/data/storage/inputData/implementations/LocalSQLiteUserDataStorageConfigInputData";

export const LOCAL_SQLITE_USER_DATA_STORAGE_CONFIG_INPUT_DATA_UI_SCHEMA: UiSchema<ILocalSQLiteUserDataStorageConfigInputData> = {
  "ui:title": "Local SQLite",
  "ui:options": {
    label: false
  },
  type: {
    "ui:widget": "hidden"
  },
  dbDirPath: {
    "ui:title": "Database directory path"
  },
  dbFileName: {
    "ui:title": "Database file name"
  }
};
