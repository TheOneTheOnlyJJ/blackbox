import { IEncryptedData, isEncryptedDataValid } from "@shared/utils/EncryptedData";
import { UUID } from "node:crypto";
import { IPrivateStorageSecuredUserDataStorageConfig } from "./PrivateStorageSecuredUserDataStorageConfig";

export interface IStorageSecuredUserDataStorageConfig {
  storageId: UUID;
  userId: UUID;
  visibilityGroupId: UUID | null;
  encryptedPrivateStorageSecuredUserDataStorageConfig: IEncryptedData<IPrivateStorageSecuredUserDataStorageConfig>;
}

export const isStorageSecuredUserDataStorageConfigValid = (data: unknown): data is IStorageSecuredUserDataStorageConfig => {
  return (
    typeof data === "object" &&
    data !== null &&
    "storageId" in data &&
    "visibilityGroupId" in data &&
    "userId" in data &&
    "encryptedPrivateStorageSecuredUserDataStorageConfig" in data &&
    typeof data.storageId === "string" &&
    typeof data.userId === "string" &&
    (typeof data.visibilityGroupId === "string" || data.visibilityGroupId === null) &&
    isEncryptedDataValid(data.encryptedPrivateStorageSecuredUserDataStorageConfig)
  );
};
