import { IEncryptedData, isEncryptedDataValid } from "@shared/utils/EncryptedData";
import { UUID } from "node:crypto";
import { IPrivateStorageSecuredUserDataStorageConfig } from "./PrivateStorageSecuredUserDataStorageConfig";
import { isValidUUID } from "@main/utils/dataValidation/isValidUUID";

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
    isValidUUID(data.storageId) &&
    isValidUUID(data.userId) &&
    (isValidUUID(data.visibilityGroupId) || data.visibilityGroupId === null) &&
    isEncryptedDataValid(data.encryptedPrivateStorageSecuredUserDataStorageConfig)
  );
};
