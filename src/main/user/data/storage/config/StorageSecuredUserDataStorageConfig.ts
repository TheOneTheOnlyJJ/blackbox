import { IEncryptedData, isEncryptedDataValid } from "@shared/utils/EncryptedData";
import { UUID } from "node:crypto";
import { IPrivateStorageSecuredUserDataStorageConfig } from "./PrivateStorageSecuredUserDataStorageConfig";

export interface IStorageSecuredUserDataStorageConfig {
  storageId: UUID;
  userId: UUID;
  visibilityGroupId: UUID | null;
  encryptedPrivateStorageSecuredUserDataStorageConfig: IEncryptedData<IPrivateStorageSecuredUserDataStorageConfig>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isStorageSecuredUserDataStorageConfigValid = (data: any): data is IStorageSecuredUserDataStorageConfig => {
  return (
    // TODO: Use typeof here? And there is one more place 9secured password?
    typeof data === "object" &&
    data !== null &&
    "storageId" in data &&
    "visibilityGroupId" in data &&
    "userId" in data &&
    "encryptedPrivateStorageSecuredUserDataStorageConfig" in data &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.storageId === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.userId === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (typeof data.visibilityGroupId === "string" || data.visibilityGroupId === null) &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    isEncryptedDataValid(data.encryptedPrivateStorageSecuredUserDataStorageConfig)
  );
};
