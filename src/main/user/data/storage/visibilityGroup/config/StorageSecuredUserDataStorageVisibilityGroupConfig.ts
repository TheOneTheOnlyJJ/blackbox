import { IEncryptedData, isEncryptedDataValid } from "@shared/utils/EncryptedData";
import { UUID } from "crypto";
import { IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig } from "./PrivateStorageSecuredUserDataStorageVisibilityGroupConfig";
import { isValidUUID } from "@main/utils/dataValidation/isValidUUID";

export interface IStorageSecuredUserDataStorageVisibilityGroupConfig {
  visibilityGroupId: UUID;
  userId: UUID;
  encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig: IEncryptedData<IPrivateStorageSecuredUserDataStorageVisibilityGroupConfig>;
}

export const isValidStorageSecuredUserDataStorageVisibilityGroupConfig = (
  data: unknown
): data is IStorageSecuredUserDataStorageVisibilityGroupConfig => {
  return (
    typeof data === "object" &&
    data !== null &&
    "visibilityGroupId" in data &&
    "userId" in data &&
    "encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig" in data &&
    isValidUUID(data.visibilityGroupId) &&
    isValidUUID(data.userId) &&
    isEncryptedDataValid(data.encryptedPrivateStorageSecuredUserDataStorageVisibilityGroupConfig)
  );
};
