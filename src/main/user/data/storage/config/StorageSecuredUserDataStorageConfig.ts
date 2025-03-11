import { IEncryptedData, isEncryptedDataValid } from "@shared/utils/EncryptedData";
import { UUID } from "node:crypto";
import { IPrivateStorageSecuredUserDataStorageConfig } from "./PrivateStorageSecuredUserDataStorageConfig";

export interface IStorageSecuredUserDataStorageConfig {
  storageId: UUID;
  userId: UUID;
  encryptedPrivateStorageSecuredUserDataStorageConfig: IEncryptedData<IPrivateStorageSecuredUserDataStorageConfig>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isStorageSecuredUserDataStorageConfigValid = (data: any): data is IStorageSecuredUserDataStorageConfig => {
  return (
    typeof data === "object" &&
    data !== null &&
    "storageId" in data &&
    "userId" in data &&
    "encryptedPrivateStorageSecuredUserDataStorageConfig" in data &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.storageId === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof data.userId === "string" &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    isEncryptedDataValid(data.encryptedPrivateStorageSecuredUserDataStorageConfig)
  );
};
