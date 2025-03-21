import { UserAccountStorageBackendInfo } from "../backend/info/UserAccountStorageBackendInfo";

export interface IUserAccountStorageInfo {
  storageId: string;
  name: string;
  backend: UserAccountStorageBackendInfo;
}
