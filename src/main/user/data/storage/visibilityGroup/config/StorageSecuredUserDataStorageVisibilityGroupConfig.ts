import { IEncryptedData, isEncryptedDataValid } from "@shared/utils/EncryptedData";
import { UUID } from "crypto";
import { IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig } from "./PrivateStorageSecuredUserDataStorageVisibilityGroupConfig";

export interface IStorageSecuredUserDataStorageVisibilityGroupConfig {
  visibilityGroupId: UUID;
  userId: UUID;
  encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig: IEncryptedData<IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig>;
}

export const isStorageSecuredUserDataStorageVisibilityGroupConfigValid = (
  data: unknown
): data is IStorageSecuredUserDataStorageVisibilityGroupConfig => {
  return (
    typeof data === "object" &&
    data !== null &&
    "visibilityGroupId" in data &&
    "userId" in data &&
    "encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig" in data &&
    typeof data.visibilityGroupId === "string" &&
    typeof data.userId === "string" &&
    isEncryptedDataValid(data.encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig)
  );
};
