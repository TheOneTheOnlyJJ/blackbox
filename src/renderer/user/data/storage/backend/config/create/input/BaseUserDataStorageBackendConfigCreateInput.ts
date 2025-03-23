import { UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";

export interface IBaseUserDataStorageBackendConfigCreateInput {
  type: UserDataStorageBackendType;
}

export const BASE_USER_DATA_STORAGE_BACKEND_CONFIG_CREATE_JSON_SCHEMA_CONSTANTS = {
  type: {
    title: "Type"
  }
} as const;
