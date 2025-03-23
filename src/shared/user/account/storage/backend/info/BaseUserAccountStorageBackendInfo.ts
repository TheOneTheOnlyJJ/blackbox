import { UserAccountStorageBackendType } from "../UserAccountStorageBackendType";

export interface IBaseUserAccountStorageBackendInfo {
  type: UserAccountStorageBackendType;
  isOpen: boolean;
  isLocal: boolean;
}

export const BASE_USER_ACCOUNT_STORAGE_BACKEND_INFO_JSON_SCHEMA_CONSTANTS = {
  type: {
    title: "Type"
  },
  isOpen: {
    title: "Open"
  },
  isLocal: {
    title: "Local"
  }
} as const;
