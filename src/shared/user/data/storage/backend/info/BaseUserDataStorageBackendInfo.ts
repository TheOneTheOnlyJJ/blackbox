import { UserDataStorageBackendType } from "../UserDataStorageBackendType";

export interface IBaseUserDataStorageBackendInfo {
  type: UserDataStorageBackendType;
  isLocal: boolean;
  isOpen: boolean;
}

export const BASE_USER_DATA_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS = {
  type: {
    title: "Type"
  },
  isOpen: {
    title: "Is Open"
  },
  isLocal: {
    title: "Is Local"
  }
} as const;
