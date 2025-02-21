import { UserDataStorageBackendType } from "@shared/user/data/storage/backend/UserDataStorageBackendType";

export interface IBaseUserDataStorageBackendConfigCreateInput {
  type: UserDataStorageBackendType;
}
