import { UserDataStorageBackendType } from "../../UserDataStorageBackendType";

export interface IBaseUserDataStorageBackendConfigInfo {
  type: UserDataStorageBackendType;
  isLocal: boolean;
}

export const BASE_USER_DATA_STORAGE_BACKEND_CONFIG_INFO_JSON_SCHEMA_CONSTANTS = {
  type: {
    title: "Type"
  },
  isLocal: {
    title: "Local"
  }
} as const;
